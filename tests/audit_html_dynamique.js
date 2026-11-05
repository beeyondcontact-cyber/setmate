// Audit reproductible du HTML dynamique de index.html (P0-03).
// Parcourt le script avec l'analyseur de Playwright (babel), liste chaque gabarit `...` qui produit du HTML et chaque ${expression} insérée.
// Classe : SUR (esc/jsq/svg/pl, nombres, littéraux, constructeurs HTML internes) ou A REVOIR. Affiche aussi les puits dangereux (innerHTML, insertAdjacentHTML, script dynamique, location).
// Usage : node tests/audit_html_dynamique.js [--tout]   (sans --tout : seulement A REVOIR)
const fs = require("fs"), path = require("path");
const { babelParse } = require("playwright/lib/transform/babelBundle");
const html = fs.readFileSync(path.resolve(__dirname, "..", "index.html"), "utf8");
const src = html.match(/<script>([\s\S]*)<\/script>\s*<\/body>/)[1];
const ast = babelParse(src, "index.js", false);
const lignes = src.split("\n");
const SUR = [
  /^esc\(/, /^jsq\(/, /^svg\(/, /^pl\(/, /^Math\.(round|floor|min|max)\(/, /^Number\(/, /^encodeURIComponent\(/, /^cover\(/, /^keyTag\(/, /^VERSION$/, /^AMC$/, /^SC_NAME$/,
  /^[\w.]*\.n$/, /^[\w.]*\.length$/, /^[a-z]{1,2}$/, /^(i|j|k|id|lim|ok|ko|n|q|st|cur\.n|c\.n|x\.n|t\.n|g\.id|r\.i|o\.i)$/, /^\w+\.id$/,
  /^["'`][^"'`$]*["'`]$/, /^[^`]*\?\s*["'`][^"'`$]*["'`]\s*:\s*["'`][^"'`$]*["'`]$/
];
const sur = e => SUR.some(r => r.test(e.trim()));
const sorties = [], puits = [];
function visit(n, parent) {
  if (!n || typeof n.type !== "string") return;
  if (n.type === "TemplateLiteral") {
    const quasi = n.quasis.map(q => q.value.raw).join("§");
    if (/<[a-zA-Z\/]|=["']/.test(quasi) && n.expressions.length) {
      for (const e of n.expressions) {
        const code = src.slice(e.start, e.end).replace(/\s+/g, " ");
        const enAttr = /on[a-z]+="[^"]*$/.test(src.slice(Math.max(0, n.start), e.start).split("\n").pop()) || /on[a-z]+="[^"]*\$\{[^}]*$/.test(src.slice(Math.max(0, e.start - 120), e.start));
        sorties.push({ ligne: n.loc.start.line, expr: code.length > 110 ? code.slice(0, 107) + "..." : code, sur: sur(code), onclick: enAttr });
      }
    }
  }
  if (n.type === "AssignmentExpression" && n.left.type === "MemberExpression" && /^(innerHTML|outerHTML)$/.test(n.left.property.name || "")) puits.push({ ligne: n.loc.start.line, type: n.left.property.name + "=" });
  if (n.type === "CallExpression" && n.callee.type === "MemberExpression" && n.callee.property.name === "insertAdjacentHTML") puits.push({ ligne: n.loc.start.line, type: "insertAdjacentHTML" });
  if (n.type === "CallExpression" && n.callee.type === "MemberExpression" && /^(createElement)$/.test(n.callee.property.name) && n.arguments[0] && n.arguments[0].value === "script") puits.push({ ligne: n.loc.start.line, type: "script dynamique (JSONP)" });
  if (n.type === "CallExpression" && n.callee.type === "MemberExpression" && /^(assign|replace)$/.test(n.callee.property.name) && n.callee.object.name === "location") puits.push({ ligne: n.loc.start.line, type: "location." + n.callee.property.name });
  if (n.type === "AssignmentExpression" && n.left.type === "MemberExpression" && n.left.object.name === "location") puits.push({ ligne: n.loc.start.line, type: "location=" });
  for (const k of Object.keys(n)) { if (k === "loc" || k === "leadingComments" || k === "trailingComments") continue; const v = n[k]; if (Array.isArray(v)) v.forEach(c => visit(c, n)); else if (v && typeof v.type === "string") visit(v, n); }
}
visit(ast.program, null);
const toutes = process.argv.includes("--tout");
console.log("PUITS DANGEREUX (" + puits.length + ")"); puits.forEach(p => console.log("  l." + p.ligne + "  " + p.type));
const rev = sorties.filter(s => !s.sur);
console.log("\nEXPRESSIONS INSÉRÉES DANS DU HTML : " + sorties.length + " au total, " + sorties.filter(s => s.sur).length + " classées SUR, " + rev.length + " A REVOIR (dont " + rev.filter(s => s.onclick).length + " dans un gestionnaire on*)");
(toutes ? sorties : rev).forEach(s => console.log(`  l.${s.ligne}${s.onclick ? " [on*]" : "      "} ${s.sur ? "SUR     " : "A REVOIR"} \${${s.expr}}`));
const onc = (src.match(/\bon[a-z]+="/g) || []).length;
console.log("\nATTRIBUTS on* dans le code : " + onc + " (dont onclick : " + (src.match(/\bonclick="/g) || []).length + ")");
