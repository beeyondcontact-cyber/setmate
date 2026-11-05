// P0-05 : les garde-fous du workflow et du déploiement sont testés DANS LES DEUX SENS (erreur S9) :
// le vrai fichier doit passer, et chaque entorse (permission en écriture, secret, action non figée, test oublié, version divergente…) doit échouer.
// Aucun navigateur, aucun réseau : lecture de fichiers seulement.
const { test, expect } = require("@playwright/test");
const fs = require("fs"), os = require("os"), path = require("path");
const ci = require("./verif_ci"), dep = require("./verif_deploiement");

const racine = path.resolve(__dirname, "..");
const YML = fs.readFileSync(path.join(racine, ".github", "workflows", "tests.yml"), "utf8").replace(/\r\n/g, "\n");   // un checkout Windows peut mettre des CRLF
const SPECS = fs.readdirSync(__dirname).filter(f => f.endsWith(".spec.js")).sort();
test.beforeEach(({}, testInfo) => { test.skip(testInfo.project.name !== "chrome", "contrôle de fichiers, une seule fois suffit"); });

test("P0-05 workflow : le vrai fichier respecte toutes les règles et lance tous les fichiers de test", () => {
  expect(ci.verifier(YML, SPECS)).toEqual([]);
  expect(SPECS.length).toBeGreaterThanOrEqual(7);
});

const ENTORSES = [
  ["permission en écriture", y => y.replace("contents: read", "contents: write"), /écriture|exactement/],
  ["permission élargie dans un job", y => y.replace("    timeout-minutes: 10", "    timeout-minutes: 10\n    permissions:\n      contents: read"), /une seule fois/],
  ["secret utilisé", y => y.replace("run: npm ci", "run: npm ci\n        env:\n          X: ${{ secrets.MON_SECRET }}"), /secret/],
  ["jeton utilisé", y => y.replace("persist-credentials: false", "persist-credentials: true\n          token: ${{ github.token }}\n          # GITHUB_TOKEN").replace("run: npm ci", "run: echo $GITHUB_TOKEN"), /secret|jeton|persist/],
  ["action non figée (étiquette)", y => y.replace("@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1", "@v7"), /SHA|version lisible/],
  ["action sans commentaire de version", y => y.replace(" # v7.1.0", ""), /commentaire/],
  ["action non officielle", y => y.replace("actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1", "autre/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1"), /non officielle/],
  ["continue-on-error", y => y.replace("    timeout-minutes: 30", "    timeout-minutes: 30\n    continue-on-error: true"), /continue-on-error/],
  ["job sans délai d'expiration", y => y.replace("    timeout-minutes: 45\n", ""), /timeout-minutes/],
  ["concurrence supprimée", y => y.replace(/concurrency:[\s\S]*?cancel-in-progress: true\n/, ""), /concurrency/],
  ["déclencheur push supprimé", y => y.replace(/  push:\n    branches:\n      - "\*\*"\n/, ""), /déclencheurs/],
  ["déclencheur dangereux", y => y.replace("  pull_request:\n", "  pull_request:\n  pull_request_target:\n"), /non prévu/],
  ["étape de déploiement", y => y + "      - uses: actions/deploy-pages@abc\n", /déploiement|publication/],
  ["environnement de déploiement", y => y.replace("    needs: controles-statiques\n    runs-on: ubuntu-latest\n    timeout-minutes: 30", "    needs: controles-statiques\n    runs-on: ubuntu-latest\n    environment: production\n    timeout-minutes: 30"), /environment/],
  ["contrôle de sabotage retiré", y => y.replace("node tests/sabotage.js", "echo ignoré"), /sabotage/],
  ["vérification de déploiement retirée", y => y.replace("node tests/verif_deploiement.js", "echo ignoré"), /déploiement/],
  ["syntaxe/doublons retirés", y => y.replace("node tests/verif_statique.js", "echo ignoré"), /syntaxe/],
  ["un fichier de test oublié", y => y.replace("tests/p0_injection.spec.js", "tests/autre.spec.js"), /p0_injection/],
  ["checkout avec jeton persistant", y => y.replace(/ {8}persist-credentials: false\n/g, ""), /persist-credentials/]
];
for (const [nom, mut, motif] of ENTORSES) {
  test(`P0-05 workflow : l'entorse « ${nom} » est détectée`, () => {
    const y = mut(YML);
    expect(y, "la modification de test a bien changé le fichier").not.toBe(YML);
    const pb = ci.verifier(y, SPECS);
    expect(pb.length, "au moins un problème signalé").toBeGreaterThan(0);
    expect(pb.join(" | ")).toMatch(motif);
  });
}

// ---------- Fichiers de déploiement ----------
function copie(modif) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "deploiement-test-"));
  for (const f of ["index.html", "sw.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"]) fs.copyFileSync(path.join(racine, f), path.join(d, f));
  if (modif) modif(d);
  return d;
}
test("P0-05 déploiement : les vrais fichiers sont cohérents", () => { expect(dep.verifier(racine)).toEqual([]); });
const CAS = [
  ["version de index.html ≠ cache de sw.js", d => fs.writeFileSync(path.join(d, "sw.js"), fs.readFileSync(path.join(d, "sw.js"), "utf8").replace(/setmate-[^"]+/, "setmate-0.0.0")), /différente/],
  ["icône du manifeste absente", d => fs.unlinkSync(path.join(d, "icon-512.png")), /icône du manifeste absente/],
  ["fichier précaché absent", d => fs.unlinkSync(path.join(d, "apple-touch-icon.png")), /précaché/],
  ["manifeste illisible", d => fs.writeFileSync(path.join(d, "manifest.webmanifest"), "{pas du json"), /JSON/],
  ["référence locale d'index.html absente", d => fs.writeFileSync(path.join(d, "index.html"), fs.readFileSync(path.join(d, "index.html"), "utf8").replace('href="icon-192.png"', 'href="icone-fantome.png"')), /référencé par index\.html absent/],
  ["sw.js absent", d => fs.unlinkSync(path.join(d, "sw.js")), /sw\.js/]
];
for (const [nom, modif, motif] of CAS) {
  test(`P0-05 déploiement : « ${nom} » est détecté`, () => {
    const d = copie(modif);
    try { const pb = dep.verifier(d); expect(pb.length).toBeGreaterThan(0); expect(pb.join(" | ")).toMatch(motif); }
    finally { fs.rmSync(d, { recursive: true, force: true }); }
  });
}
