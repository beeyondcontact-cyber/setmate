// Contrôle de sabotage : on réintroduit un à un des bugs connus dans index.html, et on vérifie que le test correspondant devient ROUGE.
// Un test qui ne devient jamais rouge ne protège de rien (erreur E-011).
// SÉCURITÉ DU FICHIER (P0-04) : avant la moindre altération, une copie de secours est écrite (index.html.sabotage_bak).
// Au démarrage, une copie de secours laissée par une exécution interrompue est restaurée. Restauration dans tous les cas
// (fin normale, erreur, Ctrl+C, arrêt demandé) ; seul un arrêt brutal (kill -9, coupure) laisse le fichier altéré, et la copie de
// secours permet alors de le réparer au prochain lancement. Le mécanisme est testé par tests/sabotage_mecanisme.spec.js.
// Usage : node tests/sabotage.js
const fs = require("fs"), path = require("path"), { spawnSync } = require("child_process");
const SUFFIXE = ".sabotage_bak";

/** Si une copie de secours existe, la précédente exécution a été interrompue : on remet le fichier d'origine. Renvoie true si restauré. */
function recupererInterruption(cible) {
  const bak = cible + SUFFIXE;
  if (!fs.existsSync(bak)) return false;
  fs.copyFileSync(bak, cible);
  fs.unlinkSync(bak);
  return true;
}
/** Écrit la copie de secours (avant toute altération) et renvoie la fonction de restauration (idempotente). */
function proteger(cible) {
  const bak = cible + SUFFIXE;
  const original = fs.readFileSync(cible);
  fs.writeFileSync(bak, original);
  if (!fs.readFileSync(bak).equals(original)) throw new Error("copie de secours illisible : abandon avant toute altération");
  let fait = false;
  const restaurer = () => {
    if (fait) return; fait = true;
    fs.writeFileSync(cible, original);
    if (fs.existsSync(bak)) fs.unlinkSync(bak);
  };
  return { original, restaurer, bak };
}
/** Exécute fn(original) avec protection : restauration à la fin, en cas d'erreur et sur signal d'arrêt. */
function avecProtection(cible, fn) {
  const restauree = recupererInterruption(cible);
  if (restauree) console.log("ATTENTION : une exécution précédente avait été interrompue. " + path.basename(cible) + " a été restauré depuis " + path.basename(cible) + SUFFIXE + ".");
  const p = proteger(cible);
  const sur = signal => () => { p.restaurer(); process.exit(signal === "SIGINT" ? 130 : 143); };
  const gSigint = sur("SIGINT"), gSigterm = sur("SIGTERM"), gSighup = sur("SIGTERM");
  process.on("SIGINT", gSigint); process.on("SIGTERM", gSigterm); process.on("SIGHUP", gSighup);
  try { return fn(p.original.toString("utf8")); }
  finally {
    p.restaurer();
    process.removeListener("SIGINT", gSigint); process.removeListener("SIGTERM", gSigterm); process.removeListener("SIGHUP", gSighup);
    if (!fs.readFileSync(cible).equals(p.original)) { console.error("ERREUR GRAVE : " + cible + " n'est pas identique à l'original après restauration."); process.exitCode = 2; }
  }
}
module.exports = { recupererInterruption, proteger, avecProtection, SUFFIXE };

if (require.main === module) {
  const racine = path.resolve(__dirname, "..");
  const idx = path.join(racine, "index.html");
  const sabotages = [
    { nom: "E-009 : retire la garde de libTable", projet: "iphone-safari", test: "E-009", de: 'function libTable(){if(!$("#libT"))return;', vers: "function libTable(){" },
    { nom: "E-013 : le crate inutilisable est de nouveau téléchargé", projet: "chrome", test: "aucun fichier crate", de: "  crateImpossible();}\nasync function exportUsb", vers: "  download(new Blob([buildCrate(items.map(x=>x.path))]),`SetMate%%${safeName(S.set.name)}.crate`);}\nasync function exportUsb" },
    { nom: "E-007 : le limiteur de requêtes est désactivé", projet: "chrome", test: "aucun refus de quota", de: 'await dzGate(prio==="low");', vers: "" },
    { nom: "E-008 : les redessins ne respectent plus le geste", projet: "chrome", test: "aucun redessin automatique", de: "if(wait>0){if(!lrT)", vers: "if(false){if(!lrT)" },
    { nom: "P0-01 : une transaction annulée est de nouveau annoncée comme réussie", projet: "chrome", test: "P0-01 transaction annulée", de: "tx.onabort=()=>fail(tx.error||reqErr);", vers: "tx.onabort=()=>{done=true;res();};" },
    { nom: "P0-01 : la relecture de vérification est supprimée", projet: "chrome", test: "P0-01 relecture", de: "if(bad){fail(null,\"verify\");}else{done=true;res();}", vers: "done=true;res();" },
    { nom: "P0-01 : pagehide ne force plus l'écriture", projet: "chrome", test: "P0-01 fermeture de page", de: 'window.addEventListener("pagehide",()=>{if(SAVE.dirty||tracksDirty)flushSave().catch(()=>{});});', vers: "" },
    { nom: "P0-02 : la restauration n'exige plus de sauvegarde valide", projet: "chrome", test: "P0-02 refus avant application : anomalie connue", de: "if(!r.ok){showRestoreError(r.errors);return false;}return restoreState(r);", vers: "return restoreState(r.ok?r:{info:{version:'x',tracks:0,pls:0,gigs:0,own:0,setName:null,setCount:0},warnings:[],state:JSON.parse(txt).state});" },
    { nom: "P0-02 : la copie de secours de l'état précédent n'est plus écrite", projet: "chrome", test: "P0-02 sauvegarde valide réelle", de: 'await DB.set("backup_prev",', vers: 'await DB.set("backup_prev_x",' },
    { nom: "P0-02 : l'état est appliqué en mémoire avant l'écriture vérifiée", projet: "chrome", test: "P0-02 interruption pendant l'écriture", de: 'await DB.setMany([["state",st],["tracks",tracks]]);          // refusé', vers: 'S.tracks=tracks;await DB.setMany([["state",st],["tracks",tracks]]).catch(()=>{});          // refusé' },
    { nom: "P0-03 : safeUrl accepte de nouveau toute adresse", projet: "chrome", test: "P0-03 safeUrl", de: "function safeUrl(u,kind){try{", vers: "function safeUrl(u,kind){return typeof u===\"string\"?u:null;try{" },
    { nom: "P0-03 : jsq n'échappe plus les retours à la ligne", projet: "chrome", test: "P0-03 jsq", de: '.replace(/\\n/g,"\\\\n")', vers: "" },
    { nom: "P0-03 : un identifiant Deezer non numérique atteint de nouveau les onclick", projet: "chrome", test: "P0-03 réponse Deezer piégée", de: "const dzItem=t=>({dz:intId(t.id),", vers: "const dzItem=t=>({dz:t.id," },
    { nom: "P0-03 : le JSONP accepte de nouveau n'importe quelle adresse", projet: "chrome", test: "P0-03 JSONP", de: 'url=safeUrl(url,"api");if(!url)return rej(new Error("adresse refusée"));', vers: "" },
    { nom: "P0-03 : l'URL Apple retourne dans un gestionnaire onclick", projet: "chrome", test: "P0-03 embedAM : une URL Apple piégée", de: '${m.url?`<button class="btn" id="amOpen">Ouvrir dans Musique</button>`:""}', vers: "<button class=\"btn\" onclick=\"location.assign('${m.url}')\">Ouvrir dans Musique</button>" },
    { nom: "P0-04 : seratoGate redevient permissif quand un réglage est coupé", projet: "chrome", test: "P0-04 seratoGate", de: "async function seratoGate(){return SERATO_ECRITURE_AUTORISEE===true;}", vers: "async function seratoGate(){return !S.flags||S.flags.seratover===false||SERATO_ECRITURE_AUTORISEE===true;}" },
    { nom: "P0-04 : l'interrupteur du contrôle de version revient dans les Réglages", projet: "chrome", test: "P0-04 Réglages", de: 'nrjbpm:"Énergie jamais déduite du BPM (CHG-03)"};', vers: 'nrjbpm:"Énergie jamais déduite du BPM (CHG-03)",seratover:"Vérifier la version de Serato avant d’écrire"};' },
    { nom: "P0-04 : writeCrates écrit de nouveau dans Subcrates", projet: "chrome", test: "P0-04 aucune fonction n'écrit", de: 'async function writeCrates(){seratoRefus("writeCrates");}', vers: 'async function writeCrates(root){const sub=await root.getDirectoryHandle("Subcrates",{create:true});await (await sub.getFileHandle("x.crate",{create:true})).createWritable();}' },
    { nom: "P0-04 : la copie sur clé écrit de nouveau dans le _Serato_ de la clé", projet: "chrome", test: "P0-04 la copie sur clé", de: 'const ui=stepsUI("Copie sur "+usb.name,["Copie des fichiers","Vérification"]);', vers: 'const ui=stepsUI("Copie sur "+usb.name,["Copie des fichiers","Vérification"]);try{await (await (await usb.getDirectoryHandle("_Serato_",{create:true})).getFileHandle("database V2",{create:true})).createWritable();}catch(e){}' },
    { nom: "P0-04 : un dossier _Serato_ est accepté comme destination de clé", projet: "chrome", test: "P0-04 choisir un dossier _Serato_", de: "if(estDossierSerato(usb.name)){", vers: "if(false){" },
    { nom: "P0-04 : une piste à récupérer est écrite dans le M3U8 avec un chemin", projet: "chrome", test: "P0-04 M3U8 : contenu exact", de: 'if(x.wish)why="à récupérer : pas de fichier sur cet ordinateur";', vers: "if(false)why=null;" },
    { nom: "P0-04 : un chemin avec saut de ligne est écrit dans le M3U8", projet: "chrome", test: "P0-04 M3U8 : contenu exact", de: "if(!s||/[", vers: "if(!s&&/[" },
    { nom: "P0-04 : les chemins avec lecteur ne sont plus gérés", projet: "chrome", test: "P0-04 M3U8 : chemins Windows", de: "if(/^[A-Za-z]:/.test(s))return null;", vers: "" },
    { nom: "P0-04 : le statut « compatibilité réelle non testée » disparaît de l'écran du set", projet: "chrome", test: "P0-04 statut visible", de: 'id="m3uStatut">Export M3U8 pour Serato : <b>${M3U_STATUT}</b>.', vers: 'id="m3uStatut">Export M3U8 pour Serato.' },
    { nom: "version : index.html et sw.js divergent", projet: "chrome", test: "charge sans erreur", de: /const VERSION="([^"]+)"/, vers: 'const VERSION="0.0.0-sabotage"' }
  ];
  let tous = true;
  avecProtection(idx, original => {
    for (const s of sabotages) {
      const nouveau = original.replace(s.de, s.vers);
      if (nouveau === original) { console.log("IMPOSSIBLE  " + s.nom + " : motif introuvable, sabotage non appliqué"); tous = false; continue; }
      fs.writeFileSync(idx, nouveau);
      const r = spawnSync("npx", ["playwright", "test", "--workers=2", "--project=" + s.projet, "--grep", s.test], { cwd: racine, encoding: "utf8", shell: true });
      const rouge = r.status !== 0;
      console.log((rouge ? "DÉTECTÉ     " : "NON DÉTECTÉ ") + s.nom);
      if (!rouge) tous = false;
    }
  });
  console.log(tous ? "\nTous les sabotages ont été détectés." : "\nATTENTION : un sabotage n'a pas été détecté.");
  process.exit(tous ? (process.exitCode || 0) : 1);
}
