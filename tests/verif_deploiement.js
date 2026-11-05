// Intégrité des fichiers de déploiement (P0-05), sans navigateur ni réseau.
// Vérifie : (1) version de index.html = nom du cache de sw.js ; (2) fichiers listés dans le manifeste présents ;
// (3) fichiers précachés par sw.js présents ; (4) fichiers locaux référencés par index.html présents ; (5) manifeste lisible.
// Usage : node tests/verif_deploiement.js [dossier]   (par défaut : la racine du dépôt)
// Ce script ne déploie rien : il lit seulement.
const fs = require("fs"), path = require("path");

function verifier(racine) {
  const pb = [];
  const lire = f => { try { return fs.readFileSync(path.join(racine, f), "utf8"); } catch (e) { pb.push(`fichier illisible ou absent : ${f}`); return ""; } };
  const existe = f => fs.existsSync(path.join(racine, f)) && fs.statSync(path.join(racine, f)).isFile();
  const html = lire("index.html"), sw = lire("sw.js"), manifestTxt = lire("manifest.webmanifest");

  const v = (html.match(/const VERSION="([^"]+)"/) || [])[1], c = (sw.match(/const C = "setmate-([^"]+)"/) || [])[1];
  if (!v) pb.push("VERSION introuvable dans index.html");
  if (!c) pb.push("nom de cache introuvable dans sw.js");
  if (v && c && v !== c) pb.push(`version de index.html (${v}) différente du cache de sw.js (${c})`);

  let manifest = null;
  try { manifest = JSON.parse(manifestTxt); } catch (e) { pb.push("manifest.webmanifest n'est pas un JSON valide"); }
  if (manifest) {
    for (const ic of manifest.icons || []) { const f = String(ic.src || "").replace(/^\.\//, ""); if (!f || !existe(f)) pb.push(`icône du manifeste absente : ${ic.src}`); }
    if (!(manifest.icons || []).length) pb.push("le manifeste ne déclare aucune icône");
    for (const k of ["name", "start_url", "display"]) if (!manifest[k]) pb.push(`le manifeste n'a pas de « ${k} »`);
    const st = String(manifest.start_url || "");
    if (st && st !== "./" && st !== "/" && !existe(st.replace(/^\.\//, ""))) pb.push(`start_url du manifeste absent : ${st}`);
  }

  const base = (sw.match(/const BASE = \[([^\]]*)\]/) || [])[1];
  if (base === undefined) pb.push("liste BASE introuvable dans sw.js");
  else for (const m of base.matchAll(/"([^"]+)"/g)) { const f = m[1].replace(/^\.\//, ""); if (f && f !== "./" && !existe(f)) pb.push(`fichier précaché par sw.js absent : ${m[1]}`); }

  for (const m of html.matchAll(/<(?:link|script|img|source)\b[^>]*?\b(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(https?:|data:|blob:|#|mailto:|\/\/)/.test(u) || u.includes("${")) continue;
    const f = u.split(/[?#]/)[0].replace(/^\.\//, "");
    if (f && !existe(f)) pb.push(`fichier référencé par index.html absent : ${u}`);
  }
  return pb;
}
module.exports = { verifier };

if (require.main === module) {
  const racine = path.resolve(process.argv[2] || path.join(__dirname, ".."));
  const pb = verifier(racine);
  if (pb.length) { pb.forEach(p => console.log("ECHEC  " + p)); process.exit(1); }
  console.log("OK    fichiers de déploiement cohérents (version = cache, manifeste, icônes, précache, références locales)");
}
