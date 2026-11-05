// Contrôle statique avant commit : (1) le script de index.html est syntaxiquement valide (new Function),
// (2) aucune fonction ni const/let de premier niveau n'est déclarée deux fois, (3) VERSION == nom du cache dans sw.js.
// Usage : node tests/verif_statique.js
const fs = require("fs"), path = require("path");
const racine = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(racine, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(racine, "sw.js"), "utf8");
let code = 0;
const m = html.match(/<script>([\s\S]*)<\/script>\s*<\/body>/);
if (!m) { console.log("ECHEC : script principal introuvable"); process.exit(1); }
const src = m[1];
try { new Function(src); console.log("OK    syntaxe du script (new Function)"); } catch (e) { console.log("ECHEC syntaxe : " + e.message); code = 1; }
const vus = new Map(), dup = [];
for (const l of src.split("\n")) {
  const r = l.match(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/) || l.match(/^(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=/);
  if (!r) continue;
  if (vus.has(r[1])) dup.push(r[1]); else vus.set(r[1], 1);
}
if (dup.length) { console.log("ECHEC doublons de premier niveau : " + dup.join(", ")); code = 1; } else console.log("OK    aucun doublon de function/const/let de premier niveau (" + vus.size + " noms)");
const v = (src.match(/const VERSION="([^"]+)"/) || [])[1], c = (sw.match(/const C = "setmate-([^"]+)"/) || [])[1];
if (v && v === c) console.log("OK    VERSION = cache sw.js = " + v); else { console.log(`ECHEC version ${v} != cache ${c}`); code = 1; }
process.exit(code);
