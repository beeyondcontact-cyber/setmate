// P0-02 : restauration et intégrité. Le fichier est lu par le vrai parcours (Réglages > Restaurer = importData + sélecteur de fichier).
// Règle testée : on valide AVANT d'appliquer, on montre ce qui sera remplacé, on garde l'état précédent, et un échec ne change rien.
const { test } = require("@playwright/test");
const { ouvrir, expect } = require("./aide");

const piste = (n, extra = {}) => ({ n, path: "Users/x/Music/Son " + n + ".mp3", t: "Son " + n, a: "Artiste " + (n % 7), g: "Afro", sg: "", k: "8A", bpm: 100 + (n % 40), e: 5, inSerato: true, ...extra });
const etat = (extra = {}) => ({ name: "DJ Test", nextN: 4, set: { name: "Set restauré", ids: [1, 2], gig: null }, cur: 1, tracks: [piste(1), piste(2), piste(3)],
  pls: [{ id: "p1", name: "Ma playlist", src: "setmate", date: 1, items: [{ t: "Last Last", a: "Burna Boy", dz: 123, cover: null }], cover: null }], gigs: [{ id: 5, lieu: "Club", date: "2026-10-01", type: "Club", theme: "", time: "", played: [], deb: null, check: {} }], ...extra });
const sauv = (st = etat(), tete = {}) => JSON.stringify({ setmate: "1.9.1", schema: 1, date: 1730000000000, state: st, ...tete });

async function importer(page, contenu) {
  const [fc] = await Promise.all([page.waitForEvent("filechooser"), page.evaluate(() => importData())]);
  await fc.setFiles({ name: "sauvegarde.json", mimeType: "application/json", buffer: Buffer.from(contenu) });
}
const instantane = page => page.evaluate(() => JSON.stringify({ tracks: S.tracks, set: S.set, pls: S.pls, gigs: S.gigs, name: S.name, nextN: S.nextN, t: typeof S.tracks }));
const stocke = page => page.evaluate(async () => JSON.stringify({ s: await DB.get("state"), t: await DB.get("tracks") }));
async function preparer(page) {   // un état de départ reconnaissable
  await page.evaluate(async () => { S.name = "Etat actuel"; S.demo = false; S.tracks = [{ n: 1, path: "a/b.mp3", t: "Avant", a: "Moi", g: "Afro", sg: "", k: "1A", bpm: 90, e: 3, inSerato: true }]; S.nextN = 2; S.set = { name: "Set actuel", ids: [1], gig: null }; reindex(); save(true); await flushSave().catch(() => {}); });
}

const REFUS = [
  ["JSON invalide (fichier coupé)", '{"setmate":"1.9.1","state":{"tracks":[', /pas lisible|abîmé|JSON/i],
  ["fichier vide", "", /vide/i],
  ["fichier qui n'est qu'un espace", "   \n ", /vide/i],
  ["JSON qui n'est pas une sauvegarde (liste)", "[1,2,3]", /pas une sauvegarde/i],
  ["JSON sans la marque setmate", JSON.stringify({ state: etat() }), /pas une sauvegarde/i],
  ["schéma incomplet : pas de state", JSON.stringify({ setmate: "1.9.1", date: 1 }), /pas de données|state/i],
  ["schéma incomplet : state vide", JSON.stringify({ setmate: "1.9.1", date: 1, state: {} }), /aucune donnée/i],
  ["schéma incomplet : seulement des réglages sans données", JSON.stringify({ setmate: "1.9.1", date: 1, state: { name: "x", dir: "any" } }), /aucune donnée/i],
  ["anomalie connue : tracks est du texte", sauv(etat({ tracks: "pas une liste" })), /liste des sons/i],
  ["type incorrect : nextN en texte", sauv(etat({ nextN: "12" })), /nextN|numéro/i],
  ["type incorrect : set.ids contient du texte", sauv(etat({ set: { name: "x", ids: ["a"], gig: null } })), /set/i],
  ["type incorrect : playlists en objet", sauv(etat({ pls: {} })), /playlists/i],
  ["type incorrect : un son avec n texte", sauv(etat({ tracks: [piste(1), { ...piste(2), n: "2" }] })), /Son n°2|« n »/i],
  ["type incorrect : titre d'un son en nombre", sauv(etat({ tracks: [{ ...piste(1), t: 42 }] })), /« t »|titre/i],
  ["identifiants de sons en double", sauv(etat({ tracks: [piste(1), piste(1)] })), /double|deux fois/i],
  ["identifiant de playlist piégé", sauv(etat({ pls: [{ id: "x');alert(1);('", name: "p", items: [] }] })), /identifiant/i],
  ["clé d'apprentissage piégée (S.P)", sauv(etat({ P: { "1>2>');window.__PWNED=1;('": { why: "x" } } })), /apprentissage|enchaînement|clé/i],
  ["version future", sauv(etat(), { setmate: "1.10.0" }), /plus récente|mets SetMate à jour/i],
  ["version majeure inconnue", sauv(etat(), { setmate: "2.0.0" }), /plus récente|mets SetMate à jour/i],
  ["version illisible", sauv(etat(), { setmate: "abc" }), /version.*inconnue/i],
  ["version qui n'est pas du texte", sauv(etat(), { setmate: true }), /version.*inconnue/i],
  ["schéma de données futur", sauv(etat(), { schema: 99 }), /plus récente|mets SetMate à jour/i]
];
for (const [nom, contenu, msg] of REFUS) {
  test("P0-02 refus avant application : " + nom, async ({ page }) => {
    const erreurs = await ouvrir(page);
    await preparer(page);
    const avant = await instantane(page), avantDB = await stocke(page);
    await importer(page, contenu);
    await expect(page.locator(".modal h2")).toContainText(/Restauration impossible/);
    await expect(page.locator(".modal")).toContainText(msg);
    await expect(page.locator(".modal")).toContainText(/n’ont pas été modifiées|rien n’a changé/i);
    expect(await instantane(page), "l'état en mémoire ne doit pas changer").toBe(avant);
    expect(await stocke(page), "l'état enregistré ne doit pas changer").toBe(avantDB);
    expect(await page.evaluate(() => window.__PWNED), "aucun code injecté").toBeUndefined();
    expect(erreurs, "aucune erreur de page (S.tracks.forEach is not a function...)").toEqual([]);
  });
}

test("P0-02 sauvegarde valide réelle : aperçu, copie de secours, application, annulation", async ({ page }) => {
  const erreurs = await ouvrir(page);
  // vraie sauvegarde produite par l'appli (mode démo)
  const json = await page.evaluate(async () => { enterDemo(); let txt = null; const od = window.download; window.download = b => { b.text().then(t => { txt = t; }); }; exportData(); window.download = od; for (let i = 0; i < 50 && !txt; i++) await sleep(20); return txt; });
  expect(json).toContain('"setmate"');
  await preparer(page);
  const avant = await instantane(page);
  await importer(page, json);
  await expect(page.locator(".modal h2")).toContainText(/Remplacer les données/);
  await expect(page.locator(".modal")).toContainText(/sons/);
  await expect(page.locator(".modal")).toContainText(/copie de secours|gardé automatiquement/i);
  expect(await instantane(page), "rien n'est appliqué avant la confirmation").toBe(avant);
  await page.locator(".modal button.red").click();
  await expect(page.locator("#toasts")).toContainText(/Données restaurées/);
  const apres = await page.evaluate(async () => ({ n: S.tracks.length, demo: S.demo, tab: Array.isArray(S.tracks), db: (await DB.get("tracks")).length, prev: !!(await DB.get("backup_prev")), prevNom: (await DB.get("backup_prev")).state.name }));
  expect(apres.tab).toBe(true);
  expect(apres.n).toBeGreaterThan(5);
  expect(apres.db, "l'état restauré est bien enregistré").toBe(apres.n);
  expect(apres.prev, "l'état précédent est gardé").toBe(true);
  expect(apres.prevNom).toBe("Etat actuel");
  await page.evaluate(() => doUndo());
  await expect.poll(() => instantane(page), { timeout: 5000 }).toBe(avant);
  expect(await page.evaluate(async () => (await DB.get("state")).name), "l'annulation est aussi enregistrée").toBe("Etat actuel");
  expect(erreurs).toEqual([]);
});

test("P0-02 ancienne version compatible (1.5) : acceptée, champs absents conservés, avertissement", async ({ page }) => {
  const erreurs = await ouvrir(page);
  await preparer(page);
  await importer(page, sauv({ tracks: [piste(1), piste(2)], set: { name: "Ancien set", ids: [1], gig: null }, nextN: 3 }, { setmate: "1.5.2", schema: undefined }));
  await expect(page.locator(".modal h2")).toContainText(/Remplacer les données/);
  await expect(page.locator(".modal")).toContainText(/1\.5\.2/);
  await expect(page.locator(".modal")).toContainText(/absent|conserv/i);
  await page.locator(".modal button.red").click();
  await expect(page.locator("#toasts")).toContainText(/Données restaurées/);
  expect(await page.evaluate(() => [S.tracks.length, S.set.name, Array.isArray(S.pls)])).toEqual([2, "Ancien set", true]);
  expect(erreurs).toEqual([]);
});

test("P0-02 données volumineuses : 30 000 sons restaurés et relus, un fichier trop gros est refusé", async ({ page }) => {
  test.setTimeout(150000);
  const erreurs = await ouvrir(page);
  await preparer(page);
  const gros = Array.from({ length: 30000 }, (_, i) => piste(i + 1));
  await importer(page, sauv(etat({ tracks: gros, nextN: 30001, set: { name: "Gros", ids: [1], gig: null } })));
  await expect(page.locator(".modal h2")).toContainText(/Remplacer les données/, { timeout: 60000 });
  await expect(page.locator(".modal")).toContainText(/30[  \s]?000 sons/);
  await page.locator(".modal button.red").click();
  await expect(page.locator("#toasts")).toContainText(/Données restaurées/, { timeout: 90000 });
  expect(await page.evaluate(async () => [S.tracks.length, (await DB.get("tracks")).length])).toEqual([30000, 30000]);
  await page.evaluate(() => { RESTORE_MAX_BYTES = 100; });
  const avant = await instantane(page);
  await importer(page, sauv());
  await expect(page.locator(".modal")).toContainText(/trop volumineux/i);
  expect(await instantane(page)).toBe(avant);
  expect(erreurs).toEqual([]);
});

test("P0-02 interruption pendant l'écriture : rien n'est appliqué, l'état précédent est conservé", async ({ page }) => {
  const erreurs = await ouvrir(page);
  await preparer(page);
  const avant = await instantane(page), avantDB = await stocke(page);
  await importer(page, sauv());
  await expect(page.locator(".modal h2")).toContainText(/Remplacer les données/);
  await page.evaluate(() => { const o = IDBObjectStore.prototype.put; window.__o = o; IDBObjectStore.prototype.put = function (v, k) { if (k === "tracks") { this.transaction.abort(); } return o.apply(this, arguments); }; });
  await page.locator(".modal button.red").click();
  await expect(page.locator(".modal h2")).toContainText(/Restauration impossible/);
  await expect(page.locator(".modal")).toContainText(/rien n’a changé|n’ont pas été modifiées/i);
  await page.evaluate(() => { IDBObjectStore.prototype.put = window.__o; });
  expect(await instantane(page)).toBe(avant);
  expect(await stocke(page)).toBe(avantDB);
  expect(erreurs).toEqual([]);
});

test("P0-02 copie de secours impossible (stockage plein) : la restauration est refusée, rien ne change", async ({ page }) => {
  await ouvrir(page);
  await preparer(page);
  const avant = await instantane(page), avantDB = await stocke(page);
  await importer(page, sauv());
  await expect(page.locator(".modal h2")).toContainText(/Remplacer les données/);
  await page.evaluate(() => { const o = IDBObjectStore.prototype.put; window.__o = o; IDBObjectStore.prototype.put = function (v, k) { if (k === "backup_prev") throw new DOMException("plein", "QuotaExceededError"); return o.apply(this, arguments); }; });
  await page.locator(".modal button.red").click();
  await expect(page.locator(".modal h2")).toContainText(/Restauration impossible/);
  await expect(page.locator(".modal")).toContainText(/copie de l’état actuel|stockage plein/i);
  await page.evaluate(() => { IDBObjectStore.prototype.put = window.__o; });
  expect(await instantane(page)).toBe(avant);
  expect(await stocke(page)).toBe(avantDB);
});

test("P0-02 annuler dans l'aperçu ne change rien", async ({ page }) => {
  await ouvrir(page);
  await preparer(page);
  const avant = await instantane(page);
  await importer(page, sauv());
  await expect(page.locator(".modal h2")).toContainText(/Remplacer les données/);
  await page.locator(".modal button.ghost").click();
  await page.waitForTimeout(300);
  expect(await instantane(page)).toBe(avant);
  expect(await page.evaluate(async () => !!(await DB.get("backup_prev")))).toBe(false);
});

test("P0-02 un « __proto__ » dans la sauvegarde ne pollue pas les objets de l'appli", async ({ page }) => {
  const erreurs = await ouvrir(page);
  await preparer(page);
  await importer(page, '{"setmate":"1.9.1","date":1,"state":{"tracks":[],"set":{"name":"p","ids":[],"gig":null,"__proto__":{"pollue":1}},"nextN":1,"__proto__":{"pollue2":1}}}');
  await page.locator(".modal button.red").click();
  await expect(page.locator("#toasts")).toContainText(/Données restaurées/);
  expect(await page.evaluate(() => [({}).pollue, ({}).pollue2, S.pollue, S.set.pollue])).toEqual([undefined, undefined, undefined, undefined]);
  expect(erreurs).toEqual([]);
});
