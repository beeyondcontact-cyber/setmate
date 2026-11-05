// Contrôle de sabotage : on réintroduit un à un des bugs connus dans index.html, et on vérifie que le test correspondant devient ROUGE.
// Un test qui ne devient jamais rouge ne protège de rien (erreur E-011). index.html est TOUJOURS restauré à la fin.
// Usage : node tests/sabotage.js
const fs = require("fs"), path = require("path"), { spawnSync } = require("child_process");
const idx = path.resolve(__dirname, "..", "index.html"), original = fs.readFileSync(idx, "utf8");
const sabotages = [
  { nom: "E-009 : retire la garde de libTable", projet: "iphone-safari", test: "E-009", de: 'function libTable(){if(!$("#libT"))return;', vers: "function libTable(){" },
  { nom: "E-013 : le crate inutilisable est de nouveau téléchargé", projet: "chrome", test: "aucun fichier crate", de: "if(!root){crateImpossible();return;}", vers: "if(!root){download(new Blob([buildCrate(items.map(x=>x.path))]),`SetMate%%${safeName(name)}.crate`);return;}" },
  { nom: "E-007 : le limiteur de requêtes est désactivé", projet: "chrome", test: "aucun refus de quota", de: 'await dzGate(prio==="low");', vers: "" },
  { nom: "E-008 : les redessins ne respectent plus le geste", projet: "chrome", test: "aucun redessin automatique", de: "if(wait>0){if(!lrT)", vers: "if(false){if(!lrT)" },
  { nom: "P0-01 : une transaction annulée est de nouveau annoncée comme réussie", projet: "chrome", test: "P0-01 transaction annulée", de: "tx.onabort=()=>fail(tx.error||reqErr);", vers: "tx.onabort=()=>{done=true;res();};" },
  { nom: "P0-01 : la relecture de vérification est supprimée", projet: "chrome", test: "P0-01 relecture", de: "if(bad){fail(null,\"verify\");}else{done=true;res();}", vers: "done=true;res();" },
  { nom: "P0-01 : pagehide ne force plus l'écriture", projet: "chrome", test: "P0-01 fermeture de page", de: 'window.addEventListener("pagehide",()=>{if(SAVE.dirty||tracksDirty)flushSave().catch(()=>{});});', vers: "" },
  { nom: "P0-02 : la restauration n'exige plus de sauvegarde valide", projet: "chrome", test: "P0-02 refus avant application : anomalie connue", de: "if(!r.ok){showRestoreError(r.errors);return false;}return restoreState(r);", vers: "return restoreState(r.ok?r:{info:{version:'x',tracks:0,pls:0,gigs:0,own:0,setName:null,setCount:0},warnings:[],state:JSON.parse(txt).state});" },
  { nom: "P0-02 : la copie de secours de l'état précédent n'est plus écrite", projet: "chrome", test: "P0-02 sauvegarde valide réelle", de: 'await DB.set("backup_prev",', vers: 'await DB.set("backup_prev_x",' },
  { nom: "P0-02 : l'état est appliqué en mémoire avant l'écriture vérifiée", projet: "chrome", test: "P0-02 interruption pendant l'écriture", de: 'await DB.setMany([["state",st],["tracks",tracks]]);          // refusé', vers: 'S.tracks=tracks;await DB.setMany([["state",st],["tracks",tracks]]).catch(()=>{});          // refusé' },
  { nom: "version : index.html et sw.js divergent", projet: "chrome", test: "charge sans erreur", de: /const VERSION="([^"]+)"/, vers: 'const VERSION="0.0.0-sabotage"' }
];
let tous = true;
try {
  for (const s of sabotages) {
    const nouveau = original.replace(s.de, s.vers);
    if (nouveau === original) { console.log("IMPOSSIBLE  " + s.nom + " : motif introuvable, sabotage non appliqué"); tous = false; continue; }
    fs.writeFileSync(idx, nouveau);
    const r = spawnSync("npx", ["playwright", "test", "--project=" + s.projet, "--grep", s.test], { cwd: path.resolve(__dirname, ".."), encoding: "utf8", shell: true });
    const rouge = r.status !== 0;
    console.log((rouge ? "DÉTECTÉ     " : "NON DÉTECTÉ ") + s.nom);
    if (!rouge) tous = false;
  }
} finally { fs.writeFileSync(idx, original); }
console.log(tous ? "\nTous les sabotages ont été détectés." : "\nATTENTION : un sabotage n'a pas été détecté.");
process.exit(tous ? 0 : 1);
