// Garde-fous du workflow GitHub Actions (P0-05), sans réseau : le fichier .github/workflows/tests.yml doit respecter les règles de sécurité
// et lancer TOUS les fichiers de test. Contrôle textuel (pas d'analyseur YAML : aucune dépendance installée).
// Usage : node tests/verif_ci.js
const fs = require("fs"), path = require("path");

function verifier(yml, specs) {
  const pb = [];
  const lignes = yml.split(/\r?\n/);
  const code = lignes.filter(l => !/^\s*#/.test(l)).join("\n");           // sans les commentaires
  // permissions minimales
  if (!/^permissions:\s*\n\s+contents:\s*read\s*$/m.test(code)) pb.push("permissions de premier niveau : doit être exactement « contents: read »");
  const perms = [...code.matchAll(/^\s*permissions:\s*(.*)$/gm)];
  if (perms.length !== 1) pb.push(`« permissions » doit apparaître une seule fois (trouvé ${perms.length}) : pas d'élargissement par job`);
  if (/^\s*[a-z-]+:\s*write\s*$/m.test(code) || /write-all/.test(code)) pb.push("une permission en écriture est déclarée");
  // aucun secret
  if (/\$\{\{\s*secrets\./i.test(code) || /\bsecrets:/i.test(code) || /GITHUB_TOKEN/.test(code)) pb.push("le workflow utilise un secret ou le jeton");
  // pas de déploiement ni publication
  if (/pages\/deploy|deploy-pages|upload-pages-artifact|gh-pages|actions\/deploy|\bgit push\b|gh release|npm publish|docker push|\bcurl\b.*\b(POST|PUT)\b/i.test(code)) pb.push("une étape ressemble à un déploiement ou à une publication");
  if (/^\s*environment:/m.test(code)) pb.push("« environment » (déploiement) déclaré");
  // déclencheurs
  if (!/^on:\s*$/m.test(code) || !/^\s+pull_request:/m.test(code) || !/^\s+push:/m.test(code)) pb.push("déclencheurs : pull_request et push requis");
  if (/pull_request_target|workflow_run|workflow_dispatch|schedule:|release:|repository_dispatch/.test(code)) pb.push("déclencheur non prévu (pull_request_target, workflow_run, schedule, release… interdits)");
  // concurrence et délais
  if (!/^concurrency:/m.test(code) || !/cancel-in-progress:\s*true/.test(code)) pb.push("concurrency avec cancel-in-progress: true requis");
  const jobs = code.split(/^jobs:\s*$/m)[1] || "";
  const noms = [...jobs.matchAll(/^  ([a-z0-9_-]+):\s*$/gm)].map(m => m[1]);
  if (!noms.length) pb.push("aucun job trouvé");
  const blocs = jobs.split(/^  [a-z0-9_-]+:\s*$/m).slice(1);
  blocs.forEach((b, i) => { if (!/^\s+timeout-minutes:\s*\d+/m.test(b)) pb.push(`job « ${noms[i]} » sans timeout-minutes`); });
  // pas de continue-on-error
  if (/continue-on-error/.test(code)) pb.push("continue-on-error interdit");
  // actions figées sur un SHA de 40 caractères, avec commentaire de version
  const uses = [...lignes.map((l, n) => [n + 1, l]).filter(([, l]) => /^\s*(-\s*)?uses:/.test(l) && !/^\s*#/.test(l))];
  if (!uses.length) pb.push("aucune action utilisée (inattendu)");
  for (const [n, l] of uses) {
    const m = l.match(/uses:\s*([\w.-]+\/[\w./-]+)@(\S+)/);
    if (!m) { pb.push(`ligne ${n} : « uses » illisible ou local`); continue; }
    if (!/^[0-9a-f]{40}$/.test(m[2])) pb.push(`ligne ${n} : ${m[1]} n'est pas figée sur un SHA de commit (${m[2]})`);
    if (!/#\s*v\d/.test(l)) pb.push(`ligne ${n} : ${m[1]} sans commentaire « # vX.Y.Z » (version lisible)`);
    if (!/^actions\//.test(m[1])) pb.push(`ligne ${n} : action non officielle (${m[1]})`);
  }
  // checkout sans jeton persistant
  if (/actions\/checkout/.test(code) && !/persist-credentials:\s*false/.test(code)) pb.push("actions/checkout sans persist-credentials: false");
  // contrôles obligatoires
  const exige = [
    [/node tests\/verif_statique\.js/, "syntaxe et doublons (tests/verif_statique.js)"],
    [/node tests\/verif_deploiement\.js/, "intégrité des fichiers de déploiement (tests/verif_deploiement.js)"],
    [/node tests\/verif_ci\.js/, "garde-fous du workflow (tests/verif_ci.js)"],
    [/node tests\/sabotage\.js/, "contrôle de sabotage (tests/sabotage.js)"],
    [/playwright test/, "tests Playwright"]
  ];
  for (const [re, nom] of exige) if (!re.test(code)) pb.push(`contrôle manquant : ${nom}`);
  for (const s of specs) if (!code.includes("tests/" + s)) pb.push(`fichier de test non lancé par le workflow : tests/${s}`);
  return pb;
}
module.exports = { verifier };

if (require.main === module) {
  const racine = path.resolve(__dirname, "..");
  const yml = fs.readFileSync(path.join(racine, ".github", "workflows", "tests.yml"), "utf8");
  const specs = fs.readdirSync(__dirname).filter(f => f.endsWith(".spec.js")).sort();
  const pb = verifier(yml, specs);
  if (pb.length) { pb.forEach(p => console.log("ECHEC  " + p)); process.exit(1); }
  console.log(`OK    workflow conforme (permissions minimales, actions figées, sans secret ni déploiement, ${specs.length} fichiers de test tous lancés)`);
}
