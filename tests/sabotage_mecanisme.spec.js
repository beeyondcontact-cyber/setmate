// Test du mécanisme de sécurité de tests/sabotage.js (P0-04) : copie de secours, restauration après interruption, restauration dans tous les cas.
// Il travaille UNIQUEMENT sur un fichier temporaire : jamais sur le vrai index.html.
const { test, expect } = require("@playwright/test");
const fs = require("fs"), os = require("os"), path = require("path"), { spawnSync } = require("child_process");
const sab = require("./sabotage");

const ORIGINAL = "<html>version d'origine éà 🎉\n<script>const VERSION=\"1.0\";</script>\n";
const ALTERE = "<html>ALTERE PAR SABOTAGE\n";
let dossier, cible;
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "chrome", "test de script Node, une seule fois suffit");
  dossier = fs.mkdtempSync(path.join(os.tmpdir(), "sabotage-test-"));
  cible = path.join(dossier, "index.html");
  fs.writeFileSync(cible, ORIGINAL);
});
test.afterEach(() => { try { fs.rmSync(dossier, { recursive: true, force: true }); } catch (e) {} });
const bak = () => cible + sab.SUFFIXE;
const contenu = () => fs.readFileSync(cible, "utf8");

test("sabotage : la copie de secours est écrite AVANT la première altération", () => {
  let vuAvant = null;
  sab.avecProtection(cible, original => {
    expect(original).toBe(ORIGINAL);
    vuAvant = { bakExiste: fs.existsSync(bak()), bak: fs.existsSync(bak()) && fs.readFileSync(bak(), "utf8") };
    fs.writeFileSync(cible, ALTERE);
    expect(contenu()).toBe(ALTERE);
  });
  expect(vuAvant).toEqual({ bakExiste: true, bak: ORIGINAL });
  expect(contenu(), "fin normale : fichier restauré").toBe(ORIGINAL);
  expect(fs.existsSync(bak()), "fin normale : copie de secours supprimée").toBe(false);
});

test("sabotage : restauration quand une erreur survient pendant les sabotages", () => {
  expect(() => sab.avecProtection(cible, () => { fs.writeFileSync(cible, ALTERE); throw new Error("panne simulée"); })).toThrow("panne simulée");
  expect(contenu()).toBe(ORIGINAL);
  expect(fs.existsSync(bak())).toBe(false);
});

test("sabotage : un arrêt brutal laisse le fichier altéré MAIS la copie de secours le répare au lancement suivant", () => {
  const script = path.join(dossier, "enfant.js");
  fs.writeFileSync(script, `
    const sab = require(process.argv[2]); const fs = require("fs");
    const p = sab.proteger(process.argv[3]);
    fs.writeFileSync(process.argv[3], ${JSON.stringify(ALTERE)});
    process.kill(process.pid, "SIGKILL");      // arrêt brutal : aucun finally, aucun gestionnaire de signal
    setTimeout(() => {}, 5000);
  `);
  const r = spawnSync(process.execPath, [script, path.resolve(__dirname, "sabotage.js"), cible], { encoding: "utf8" });
  expect(r.status === 0, "l'enfant a bien été tué brutalement").toBe(false);
  expect(contenu(), "après l'arrêt brutal, le fichier est resté altéré (c'est le cas à réparer)").toBe(ALTERE);
  expect(fs.existsSync(bak()), "mais la copie de secours existe").toBe(true);
  expect(fs.readFileSync(bak(), "utf8")).toBe(ORIGINAL);
  // lancement suivant : détection et restauration automatiques, AVANT de lire l'original
  let recu = null;
  const sortie = []; const log = console.log; console.log = m => sortie.push(m);
  try { sab.avecProtection(cible, original => { recu = original; }); } finally { console.log = log; }
  expect(recu, "l'original lu est le vrai original, pas la version altérée").toBe(ORIGINAL);
  expect(sortie.join("\n")).toMatch(/interrompue/);
  expect(contenu()).toBe(ORIGINAL);
  expect(fs.existsSync(bak())).toBe(false);
});

test("sabotage : recupererInterruption ne fait rien s'il n'y a pas de copie de secours, et restaure sinon", () => {
  expect(sab.recupererInterruption(cible)).toBe(false);
  expect(contenu()).toBe(ORIGINAL);
  fs.writeFileSync(bak(), ORIGINAL); fs.writeFileSync(cible, ALTERE);
  expect(sab.recupererInterruption(cible)).toBe(true);
  expect(contenu()).toBe(ORIGINAL);
  expect(fs.existsSync(bak())).toBe(false);
});

test("sabotage : une copie de secours périmée sur un fichier sain est sans danger", () => {
  fs.writeFileSync(bak(), ORIGINAL);
  sab.avecProtection(cible, () => {});
  expect(contenu()).toBe(ORIGINAL);
  expect(fs.existsSync(bak())).toBe(false);
});

test("sabotage : la restauration est idempotente et le script réel vise bien index.html avec le suffixe .sabotage_bak", () => {
  const p = sab.proteger(cible);
  fs.writeFileSync(cible, ALTERE);
  p.restaurer(); p.restaurer();
  expect(contenu()).toBe(ORIGINAL);
  expect(sab.SUFFIXE).toBe(".sabotage_bak");
  const src = fs.readFileSync(path.join(__dirname, "sabotage.js"), "utf8");
  expect(src).toMatch(/avecProtection\(idx, original =>/);
  expect(src, "aucune écriture de l'index en dehors de la zone protégée").not.toMatch(/^fs\.writeFileSync\(idx/m);
});
