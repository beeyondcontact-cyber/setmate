// Tests automatiques de SetMate. Chaque test dit à quelle erreur du registre (ERREURS_ET_LECONS.md) il répond.
// Deezer est SIMULÉ (aucun réseau) : les résultats sont donc des données fabriquées, utiles pour les régressions, pas pour juger Deezer.
const { test, expect } = require("@playwright/test");
const path = require("path");

/** Simulation de Deezer (JSONP). Option quota : imite la vraie limite mesurée le 30/10/2026 (≈45 requêtes par 5 s). */
function reponseDeezer(url, etat) {
  const u = new URL(url), cb = u.searchParams.get("callback") || "cb", p = u.pathname;
  if (etat && etat.quota) {
    const now = Date.now(); etat.stamps = (etat.stamps || []).filter(t => now - t < 5000);
    if (etat.stamps.length >= 45) { etat.refus = (etat.refus || 0) + 1; return `${cb}(${JSON.stringify({ error: { type: "Exception", message: "Quota limit exceeded", code: 4 } })})`; }
    etat.stamps.push(now);
  }
  let d = { data: [] };
  const m = p.match(/^\/track\/(\d+)/);
  if (m) d = { id: +m[1], title: "Son " + m[1], title_short: "Son " + m[1], preview: "", rank: 1000, artist: { id: 1, name: "Artiste" }, album: { id: 1, cover_medium: "" } };
  else if (p === "/search") d = { data: [{ id: 11, title: "Calm Down", title_short: "Calm Down", preview: "x", rank: 5, artist: { id: 2, name: "Rema" }, album: { cover_medium: "" } }] };
  return `${cb}(${JSON.stringify(d)})`;
}

async function ouvrir(page, etat) {
  const erreurs = [];
  page.on("pageerror", e => erreurs.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource|net::ERR|ERR_FAILED|favicon/.test(m.text())) erreurs.push("console: " + m.text()); });
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());   // aucun réseau extérieur
  await page.route(/api\.deezer\.com/, r => r.fulfill({ status: 200, contentType: "text/javascript", body: reponseDeezer(r.request().url(), etat) }));
  await page.goto("/index.html");
  await page.waitForFunction(() => typeof VERSION !== "undefined" && typeof S !== "undefined" && !!document.querySelector("#main .screen"));
  await page.evaluate(() => closeModal());
  return erreurs;
}

test("charge sans erreur, et la version de l'appli est celle du cache hors ligne", async ({ page, request }) => {
  const erreurs = await ouvrir(page);
  await page.waitForTimeout(1500);
  const version = await page.evaluate(() => VERSION);
  const sw = await (await request.get("/sw.js")).text();
  expect(erreurs, "erreurs de la page").toEqual([]);
  expect(sw, "sw.js doit annoncer la même version (sinon l'iPhone garde l'ancienne)").toContain(`"setmate-${version}"`);
});

test("les 12 critères de non-régression (répétitions, messages, débordements, acceptation)", async ({ page }) => {
  test.setTimeout(180000);
  const erreurs = await ouvrir(page);
  await page.addScriptTag({ path: path.join(__dirname, "p0_mesures.js") });
  const r = await page.evaluate(() => P0.acceptation());
  const faux = Object.entries(r).filter(([, v]) => !/^OK/.test(v));
  expect(faux, "critères non respectés").toEqual([]);
  expect(Object.keys(r).length).toBe(12);
  expect(erreurs).toEqual([]);
});

test("E-009 : l'écran Musique sans bibliothèque ne plante pas (cas du navigateur sans accès aux dossiers)", async ({ page }) => {
  const erreurs = await ouvrir(page);
  await page.evaluate(() => { S.demo = false; S.tracks = []; reindex(); go("lib"); refreshPlay(); });
  await page.waitForTimeout(500);
  expect(erreurs).toEqual([]);
});

test("E-013 : sans écriture directe dans Serato, aucun fichier crate inutilisable n'est téléchargé", async ({ page }) => {
  const erreurs = await ouvrir(page);
  let telechargements = 0; page.on("download", () => telechargements++);
  await page.evaluate(() => { enterDemo(); S.set.ids = visible().filter(t => !t.wish).slice(0, 4).map(t => t.n); S.set.name = "Set test"; return exportSetCrate(); });
  await page.waitForTimeout(500);
  expect(telechargements).toBe(0);
  await expect(page.locator(".modal h2")).toContainText("Pas de crate possible");
  const msg = await page.evaluate(() => { let t = null; const o = window.toast, od = window.download; window.toast = m => { t = m; }; window.download = () => {}; exportM3U(); window.toast = o; window.download = od; return t; });
  expect(msg, "le message M3U ne doit rien promettre qui n'a pas été testé").not.toMatch(/Glisse-la dans Serato pour l.importer/);
  expect(erreurs).toEqual([]);
});

test("E-013 : un set partagé est retrouvé dans la musique de l'autre DJ, dans l'ordre", async ({ page }) => {
  const erreurs = await ouvrir(page);
  const r = await page.evaluate(async () => {
    enterDemo(); const six = visible().filter(t => !t.wish).slice(0, 6); S.set.ids = six.map(t => t.n); S.set.name = "Set du vendredi";
    let texte = null, fichier = null; const oS = shareOut; shareOut = async o => { if (o.text) texte = o.text; if (o.file) fichier = o.file; return "partage"; };
    shareSetText(); shareSetFile(); shareOut = oS;
    const json = await fichier.text(); const sansChemins = !/Users\/demo|\.mp3|"path"/.test(texte + json);
    const ordreA = six.map(t => t.a + " - " + t.t);
    // autre bibliothèque : 4 sons sur 6, autres chemins
    const garde = [six[3], six[0], six[5], six[1]]; S.demo = false; S.tracks = []; S.nextN = 1;
    const mk = (t, a, p) => ({ n: S.nextN++, path: p, t, a, g: "Afro", sg: "", conf: 90, bpm: 110, k: "8A", e: 5, year: 2024, era: "Actuel", kbps: 320, inSerato: true, added: 1 });
    garde.forEach(x => S.tracks.push(mk(x.t, x.a, "Users/elle/Music/" + x.a + " - " + x.t + ".mp3"))); reindex(); S.set = { name: "Mon set", ids: [], gig: null };
    impRun(texte, ""); const titre = document.querySelector(".modal h2").textContent; const nom = IMP.name;
    const cb = document.querySelector("#impDz"); if (cb) cb.checked = false;
    await impGo();
    return { sansChemins, titre, nom, set: S.set.ids.map(n => T(n).a + " - " + T(n).t), ordreA, chemins: crateTracks(buildCrate(setFiles().map(x => x.path))) };
  });
  expect(r.sansChemins, "le partage ne doit contenir aucun chemin").toBe(true);
  expect(r.titre).toContain("4 sons sur 6");
  expect(r.nom).toBe("Set du vendredi");
  expect(r.set).toEqual([r.ordreA[0], r.ordreA[1], r.ordreA[3], r.ordreA[5]]);
  expect(r.chemins.every(c => c.startsWith("Users/elle/Music/")), "la crate doit utiliser les chemins de l'AUTRE DJ").toBe(true);
  expect(erreurs).toEqual([]);
});

test("E-007 : 60 requêtes d'un coup ne provoquent aucun refus de quota Deezer (limiteur)", async ({ page }) => {
  test.setTimeout(120000);
  const etat = { quota: true };
  const erreurs = await ouvrir(page, etat);
  await page.waitForTimeout(1500); etat.stamps = []; etat.refus = 0;
  const r = await page.evaluate(async () => { let ok = 0, quota = 0; await Promise.all(Array.from({ length: 60 }, (_, i) => jsonp("https://api.deezer.com/track/" + (100 + i), 40000).then(() => ok++, e => { if (/quota/i.test(e.message)) quota++; }))); return { ok, quota }; });
  expect(r.quota, "refus de quota visibles").toBe(0);
  expect(r.ok).toBe(60);
  expect(etat.refus, "refus reçus par la simulation").toBe(0);
  expect(erreurs).toEqual([]);
});

test("contrôle de validité (E-011) : sans le limiteur, la simulation de quota refuse bien des requêtes", async ({ page }) => {
  test.setTimeout(60000);
  const etat = { quota: true };
  await ouvrir(page, etat);
  await page.waitForTimeout(1500); etat.stamps = []; etat.refus = 0;
  const r = await page.evaluate(async () => { let quota = 0; await Promise.all(Array.from({ length: 60 }, (_, i) => _jsonp("https://api.deezer.com/track/" + (500 + i), 20000).then(() => 0, e => { if (/quota/i.test(e.message)) quota++; }))); return quota; });
  expect(r, "ce test ne prouverait rien si la simulation ne refusait jamais").toBeGreaterThan(0);
});

test("E-008 : aucun redessin automatique pendant qu'un doigt est posé, un seul rattrapage ensuite", async ({ page }) => {
  await ouvrir(page);
  await page.evaluate(() => { S.screen = "trend"; S.trTab = "decouverte"; go("trend"); });
  await page.waitForTimeout(3200);
  const pendant = await page.evaluate(async () => { window.__r = 0; const or = render; render = function () { window.__r++; return or.apply(this, arguments); }; document.dispatchEvent(new Event("touchstart")); for (let i = 0; i < 6; i++) { liveRefresh(); await new Promise(r => setTimeout(r, 150)); } return window.__r; });
  expect(pendant, "redessins pendant le geste").toBe(0);
  await page.evaluate(() => document.dispatchEvent(new Event("touchend")));
  await page.waitForTimeout(4500);
  const apres = await page.evaluate(() => window.__r);
  expect(apres, "un rattrapage après le geste").toBeGreaterThanOrEqual(1);
  expect(apres, "pas de rafale après le geste").toBeLessThanOrEqual(3);
});

test("parcours des sons : file d'attente, à récupérer, récupérés, annulation, fichier arrivé", async ({ page }) => {
  const erreurs = await ouvrir(page);
  const r = await page.evaluate(() => {
    const A = [1, 2, 3].map(i => addToLib({ dz: 9000 + i, t: "Son " + i, a: "Art " + i, cover: null }, "moi").t);
    const out = { file0: qList().length };
    recEmptyQueue(); out.todo1 = tList().length; out.file1 = qList().length;
    recMark([A[0].n], "done"); out.done2 = dList().length; out.todo2 = tList().length; out.wishes2 = wishes().length;
    doUndo(); out.done3 = dList().length; out.todo3 = tList().length;
    A[1].wish = false; A[1].path = "x/y.mp3"; out.fichier = rst(A[1]);
    recDoneAll("todo"); out.done5 = dList().length;
    return out;
  });
  expect(r).toEqual({ file0: 3, todo1: 3, file1: 0, done2: 1, todo2: 2, wishes2: 2, done3: 0, todo3: 3, fichier: "done", done5: 3 });
  expect(erreurs).toEqual([]);
});

test("lecture des listes et des exports Apple et Spotify (formats fabriqués d'après les guides)", async ({ page }) => {
  await ouvrir(page);
  const r = await page.evaluate(() => {
    const n = (t) => parseHistory(t, "x");
    const apple = n("Feature Name,Song Name,Artist Name,Play Duration Milliseconds\nx,Last Last,Burna Boy,180000\nx,Calm Down,Rema,12000\nx,Calm Down,Rema,190000");
    const spot = n(JSON.stringify([{ artistName: "Tayc", trackName: "N'y pense plus", msPlayed: 200000 }, { artistName: "Tayc", trackName: "N'y pense plus", msPlayed: 5000 }]));
    const pls = n(JSON.stringify({ playlists: [{ name: "Ma soirée", items: [{ track: { trackName: "Last Last", artistName: "Burna Boy" } }] }] }));
    let casse = null; try { n("{pas du json"); } catch (e) { casse = e.message; }
    return {
      applePlays: apple.plays.length, spotPlays: spot.plays.length, plNom: pls.playlists[0].name, plSons: pls.playlists[0].items.length, casse, parasite: n("rien").plays.length,
      txt: parseList("Burna Boy - Last Last\n1. Tayc – N’y pense plus").length, m3u: parseList("#EXTM3U\n#EXTINF:1,Rema - Calm Down\n/x/Rema - Calm Down.mp3").length,
      csv: parseList('"Track Name","Artist Name(s)"\n"Essence","Wizkid;Tems"')[0].a
    };
  });
  expect(r).toEqual({ applePlays: 2, spotPlays: 1, plNom: "Ma soirée", plSons: 1, casse: "JSON illisible", parasite: 0, txt: 2, m3u: 1, csv: "Wizkid" });
});
