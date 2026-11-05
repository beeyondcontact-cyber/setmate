// P0-03 : injection. On reproduit l'anomalie initiale (URL Apple dans un onclick) puis on prouve la correction,
// avec des données malformées venant de chaque source externe : réponse iTunes, réponse Deezer, fichier de sauvegarde.
// Aucun réseau réel : iTunes et Deezer sont simulés par des données fabriquées.
const { test } = require("@playwright/test");
const { ouvrir, expect } = require("./aide");

const EVIL_URL = "https://music.apple.com/x');window.__PWNED=1;('";

test("P0-03 safeUrl : liste blanche https + domaines attendus (javascript:, data:, http:, faux domaines refusés)", async ({ page }) => {
  await ouvrir(page);
  const r = await page.evaluate(() => {
    const t = (u, k) => safeUrl(u, k) !== null;
    return {
      pommeOk: t("https://music.apple.com/fr/album/x/1?i=2", "open"), itunesOk: t("https://itunes.apple.com/fr/album/x", "open"), deezerOk: t("https://www.deezer.com/fr/track/1", "open"),
      js: t("javascript:alert(1)", "open"), data: t("data:text/html,<script>alert(1)</script>", "open"), http: t("http://music.apple.com/x", "open"), relatif: t("//music.apple.com/x", "open"), vide: t("", "open"), nul: t(null, "open"),
      fauxSousDomaine: t("https://music.apple.com.evil.com/x", "open"), fauxPrefixe: t("https://evilmusic.apple.com/x", "open"), identifiants: t("https://user:pw@music.apple.com/x", "open"), port: t("https://music.apple.com:8443/x", "open"),
      autreDomaine: t("https://evil.example/x", "open"), majuscules: t("HTTPS://MUSIC.APPLE.COM/x", "open"),
      imgOk: t("https://e-cdns-images.dzcdn.net/images/cover/abc/250x250-000000-80-0-0.jpg", "img"), imgAutre: t("https://evil.example/a.jpg", "img"), imgHttp: t("http://cdns-images.dzcdn.net/a.jpg", "img"),
      mediaOk: t("https://cdns-preview-d.dzcdn.net/stream/c-abc-1.mp3", "media"), mediaJs: t("javascript:alert(1)", "media"), apiOk: t("https://api.deezer.com/track/1", "api"), apiAutre: t("https://api.evil.example/track/1", "api"),
      sansType: t("https://music.apple.com/x", "inconnu")
    };
  });
  expect(r).toEqual({ pommeOk: true, itunesOk: true, deezerOk: true, js: false, data: false, http: false, relatif: false, vide: false, nul: false, fauxSousDomaine: false, fauxPrefixe: false, identifiants: false, port: false, autreDomaine: false, majuscules: true,
    imgOk: true, imgAutre: false, imgHttp: false, mediaOk: true, mediaJs: false, apiOk: true, apiAutre: false, sansType: false });
});

test("P0-03 embedAM : une URL Apple piégée n'exécute aucun code (anomalie initiale), le lien sûr fonctionne", async ({ page }) => {
  const erreurs = await ouvrir(page);
  await page.evaluate(url => { TM = { t: "Titre", a: "Artiste" }; S.am[amKey(TM)] = { id: 1, coll: 2, url, t: "Titre", a: "Artiste" }; window.__NAV = []; window.__PWNED = undefined; embedAM(); }, EVIL_URL);
  await expect(page.locator(".modal h2")).toBeVisible();
  // 1) On exécute le code en ligne éventuel des boutons, avec un faux « location » (sinon la page quitterait l'appli).
  const apresCodeEnLigne = await page.evaluate(() => { document.querySelectorAll(".modal [onclick]").forEach(b => { const c = b.getAttribute("onclick"); if (/location/.test(c)) new Function("location", c).call(b, { assign: u => window.__NAV.push(u), set href(u) { window.__NAV.push(u); } }); }); return window.__PWNED; });
  expect(apresCodeEnLigne, "le code injecté dans l'URL ne doit pas s'exécuter").toBeUndefined();
  // 2) Clic réel sur le bouton, navigation capturée.
  await page.evaluate(() => { NAV.go = u => window.__NAV.push(u); });
  const bouton = page.locator(".modal button", { hasText: "Ouvrir dans Musique" });
  if (await bouton.count()) await bouton.click();
  const etat = await page.evaluate(() => ({ pwned: window.__PWNED, nav: window.__NAV }));
  expect(etat.pwned).toBeUndefined();
  expect(etat.nav.some(u => /PWNED|\x27\)/.test(u)), "l'URL piégée ne doit jamais être ouverte").toBe(false);
  expect(erreurs).toEqual([]);
});

test("P0-03 embedAM : lien Apple légitime toujours ouvert tel quel ; ids malformés = pas de lecteur intégré", async ({ page }) => {
  await ouvrir(page);
  const ok = "https://music.apple.com/fr/album/last-last/1621227688?i=1621227706&uo=4";
  await page.evaluate(url => { TM = { t: "Last Last", a: "Burna Boy" }; S.am[amKey(TM)] = { id: 1621227706, coll: 1621227688, url, t: "Last Last", a: "Burna Boy" }; window.__NAV = []; embedAM(); NAV.go = u => window.__NAV.push(u); }, ok);
  await expect(page.locator(".modal iframe")).toHaveAttribute("src", "https://embed.music.apple.com/fr/album/_/1621227688?i=1621227706");
  await page.locator(".modal button", { hasText: "Ouvrir dans Musique" }).click();
  expect(await page.evaluate(() => window.__NAV)).toEqual([ok]);
  // identifiants piégés
  await page.evaluate(() => { closeModal(); TM = { t: "B", a: "B" }; S.am[amKey(TM)] = { id: '1" onload="window.__PWNED=1', coll: "2/../../x", url: "https://music.apple.com/ok", t: "B", a: "B" }; embedAM(); });
  await page.waitForTimeout(300);
  const f = await page.evaluate(() => { const i = document.querySelector(".modal iframe"); return { iframe: i ? i.getAttribute("src") : null, html: document.querySelector("#layer").innerHTML.includes("__PWNED") }; });
  expect(f.html, "aucun identifiant piégé dans le HTML").toBe(false);
  expect(f.iframe === null || /^https:\/\/embed\.music\.apple\.com\/fr\/album\/_\/\d+\?i=\d+$/.test(f.iframe)).toBe(true);
});

test("P0-03 openAM : une URL piégée dans le cache Apple est refusée avec un message, sans navigation", async ({ page }) => {
  await ouvrir(page);
  await page.evaluate(url => { TM = { t: "Titre", a: "Artiste" }; S.am[amKey(TM)] = { id: 1, coll: 2, url, t: "Titre", a: "Artiste" }; window.__NAV = []; NAV.go = u => window.__NAV.push(u); return openAM(); }, "javascript:window.__PWNED=1");
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => ({ nav: window.__NAV, pwned: window.__PWNED }));
  expect(r).toEqual({ nav: [], pwned: undefined });
  await expect(page.locator("#toasts")).toContainText(/lien|Apple/i);
});

test("P0-03 réponse iTunes piégée : amMatch ne garde ni URL ni identifiants dangereux", async ({ page }) => {
  await ouvrir(page);
  await page.route(/itunes\.apple\.com/, r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ results: [{ trackId: "1);window.__PWNED=1;(", collectionId: 2, trackViewUrl: "javascript:window.__PWNED=1", trackName: "Calm Down", artistName: "Rema" }] }) }));
  const m = await page.evaluate(async () => { amLast = 0; return await amMatch({ t: "Calm Down", a: "Rema" }); });
  expect(m, "un résultat dont l'URL ou les identifiants sont invalides est écarté").toBeNull();
  expect(await page.evaluate(() => window.__PWNED)).toBeUndefined();
});

test("P0-03 réponse Deezer piégée : un identifiant de son non numérique n'atteint jamais un onclick", async ({ page }) => {
  const erreurs = await ouvrir(page);
  await page.route(/api\.deezer\.com\/search/, r => {
    const cb = new URL(r.request().url()).searchParams.get("callback");
    const d = { data: [{ id: "7);window.__PWNED=1;(", title: "Piège", title_short: "Piège", preview: "javascript:window.__PWNED=1", rank: 1, artist: { id: "9);window.__PWNED=1;(", name: "Pirate" }, album: { cover_medium: "https://evil.example/a.jpg);background:url(https://evil.example/b.jpg" } },
      { id: 11, title: "Calm Down", title_short: "Calm Down", preview: "https://cdns-preview-d.dzcdn.net/stream/c-1.mp3", rank: 5, artist: { id: 2, name: "Rema" }, album: { cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/x/250x250.jpg" } }] };
    r.fulfill({ status: 200, contentType: "text/javascript", body: `${cb}(${JSON.stringify(d)})` });
  });
  await page.evaluate(async () => { S.screen = "trend"; go("trend"); await doSearch("calm"); });
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => ({ html: document.body.innerHTML.includes("__PWNED"), legit: document.body.innerHTML.includes("playDz(11)"), pwned: window.__PWNED, evilUrl: /evil\.example/.test(document.body.innerHTML) }));
  expect(r.html, "aucun fragment de code piégé dans la page").toBe(false);
  expect(r.evilUrl, "aucune pochette hors liste blanche").toBe(false);
  expect(r.pwned).toBeUndefined();
  expect(r.legit, "le résultat légitime reste fonctionnel").toBe(true);
  expect(erreurs).toEqual([]);
});

test("P0-03 cover() : l'URL de pochette est contrôlée (pas d'injection CSS), la pochette légitime reste affichée", async ({ page }) => {
  await ouvrir(page);
  const r = await page.evaluate(() => ({
    mauvais: cover({ cover: "https://evil.example/a.jpg);background:url(https://evil.example/b.jpg", a: "X" }), js: cover({ cover: "javascript:alert(1)", a: "X" }),
    bon: cover({ cover: "https://e-cdns-images.dzcdn.net/images/cover/x/250x250.jpg", a: "X" })
  }));
  expect(r.mauvais).not.toMatch(/evil\.example/);
  expect(r.js).not.toMatch(/javascript/);
  expect(r.bon).toContain("e-cdns-images.dzcdn.net/images/cover/x/250x250.jpg");
});

test("P0-03 jsq : une chaîne glissée dans un gestionnaire onclick reste une simple chaîne (quotes, antislash, retours à la ligne)", async ({ page }) => {
  await ouvrir(page);
  const r = await page.evaluate(() => {
    const cas = ["a');window.__PWNED=1;('", "a\\');window.__PWNED=1;//", "ligne1\nligne2');window.__PWNED=1;('", "a b", '"><img src=x onerror=window.__PWNED=1>', "</script><script>window.__PWNED=1</script>"];
    return cas.map(c => { const d = document.createElement("div"); d.innerHTML = `<button onclick="window.__v='${jsq(c)}'">x</button>`; window.__v = undefined; d.firstChild.click(); return { ok: window.__v === c, img: !!d.querySelector("img"), pwned: window.__PWNED }; });
  });
  for (const x of r) expect(x).toEqual({ ok: true, img: false, pwned: undefined });
});

test("P0-03 identifiants de playlist, de fichier, d'écran et clés d'apprentissage piégés : aucun code exécuté au clic", async ({ page }) => {
  const erreurs = await ouvrir(page);
  const r = await page.evaluate(async () => {
    enterDemo();
    const mal = "a');window.__PWNED=1;('";
    const clics = [];
    const clique = (html, sel) => { const d = document.createElement("div"); d.innerHTML = html; document.body.appendChild(d); const els = [...d.querySelectorAll(sel)]; els.forEach(e => { try { e.click(); } catch (x) {} }); d.remove(); return els.length; };
    // 1) carte de playlist (plCard) avec identifiant piégé
    S.pls = [{ id: mal, name: "P", src: "setmate", date: 1, items: [{ t: "A", a: "B", dz: 1 }], cover: null }];
    clics.push(["plCard", clique(plCard(S.pls[0]), "[onclick]")]);
    // 2) notification avec lien d'écran piégé
    S.notifs = [{ id: 1, txt: "n", go: mal, seen: false, date: Date.now() }]; toggleNotif(); clics.push(["notif", clique(document.querySelector("#notifBox").innerHTML, ".it")]); closeNotif();
    // 3) clés d'apprentissage piégées (S.P) avec deux sons existants
    const [a, b] = S.tracks; S.P = { [a.n + ">" + b.n + ">" + mal]: { v: .1, why: "w" } }; S.L = {}; showLearned(); clics.push(["learned", clique(document.querySelector(".modal").innerHTML, ".mi")]); closeModal();
    return { clics, pwned: window.__PWNED, plOpen: S.plOpen };
  });
  expect(r.clics.every(([, n]) => n > 0), "chaque cas a bien produit des éléments cliquables : " + JSON.stringify(r.clics)).toBe(true);
  expect(r.pwned, "aucun code injecté ne doit s'exécuter").toBeUndefined();
  expect(erreurs).toEqual([]);
});

test("P0-03 soirée à date piégée : le formulaire n'est pas cassé (attribut échappé)", async ({ page }) => {
  await ouvrir(page);
  await page.evaluate(() => { S.gigs = [{ id: 5, lieu: "Club", date: '"><img src=x onerror=window.__PWNED=1>', type: "Club", theme: "", time: "", played: [], deb: null, check: {} }]; editGig(5); });
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => ({ img: !!document.querySelector(".modal img[src=x]"), pwned: window.__PWNED }));
  expect(r).toEqual({ img: false, pwned: undefined });
});

// --- Restauration : les mêmes données piégées doivent être refusées AVANT application (P0-02 + P0-03) ---
const piste = (n, extra = {}) => ({ n, path: "Users/x/Music/Son " + n + ".mp3", t: "Son " + n, a: "Artiste", g: "Afro", sg: "", k: "8A", bpm: 100, e: 5, inSerato: true, year: 2020, ...extra });
const etat = (extra = {}) => ({ nextN: 3, set: { name: "S", ids: [1], gig: null }, tracks: [piste(1), piste(2)], pls: [], gigs: [], ...extra });
const sauv = (st) => JSON.stringify({ setmate: "1.9.1", schema: 1, date: 1730000000000, state: st });
async function importer(page, contenu) {
  const [fc] = await Promise.all([page.waitForEvent("filechooser"), page.evaluate(() => importData())]);
  await fc.setFiles({ name: "sauvegarde.json", mimeType: "application/json", buffer: Buffer.from(contenu) });
}
const PIEGES = [
  ["tonalité d'un son avec du HTML", etat({ tracks: [piste(1, { k: "<img src=x onerror=window.__PWNED=1>" })] })],
  ["année d'un son avec du HTML", etat({ tracks: [piste(1, { year: "<svg onload=window.__PWNED=1>" })] })],
  ["identifiant Deezer d'un son en texte", etat({ tracks: [piste(1, { dz: "1);window.__PWNED=1;(" })] })],
  ["identifiant Deezer dans une playlist", etat({ pls: [{ id: "p1", name: "P", items: [{ t: "A", a: "B", dz: "1);window.__PWNED=1;(" }] }] })],
  ["identifiant Deezer dans les tendances", etat({ trends: { date: 1, items: [{ t: "A", a: "B", dz: "1);window.__PWNED=1;(", pos: 1 }] } })],
  ["position dans les tendances en HTML", etat({ trends: { date: 1, items: [{ t: "A", a: "B", dz: 1, pos: "<b onmouseover=window.__PWNED=1>" }] } })],
  ["identifiant Deezer dans les découvertes", etat({ disc: { date: 1, items: [{ t: "A", a: "B", dz: "x');window.__PWNED=1;('" }], extra: [] } })],
  ["date de soirée avec du HTML", etat({ gigs: [{ id: 5, lieu: "x", date: '"><img src=x onerror=window.__PWNED=1>', played: [] }] })]
];
for (const [nom, st] of PIEGES) {
  test("P0-03 restauration refusée : " + nom, async ({ page }) => {
    const erreurs = await ouvrir(page);
    const avant = await page.evaluate(() => JSON.stringify({ t: S.tracks, s: S.set, g: S.gigs }));
    await importer(page, sauv(st));
    await expect(page.locator(".modal h2")).toContainText(/Restauration impossible/);
    expect(await page.evaluate(() => JSON.stringify({ t: S.tracks, s: S.set, g: S.gigs }))).toBe(avant);
    expect(await page.evaluate(() => window.__PWNED)).toBeUndefined();
    expect(erreurs).toEqual([]);
  });
}

test("P0-03 restauration : cache Apple et pochettes piégés sont retirés (avertissement), le reste est restauré", async ({ page }) => {
  const erreurs = await ouvrir(page);
  const st = etat({ am: { "bon": { id: 1, coll: 2, url: "https://music.apple.com/fr/album/x/2?i=1", t: "ok", a: "ok" }, "mauvais1": { id: 1, coll: 2, url: "javascript:window.__PWNED=1", t: "x", a: "y" }, "mauvais2": { id: "1);window.__PWNED=1;(", coll: 2, url: "https://music.apple.com/x", t: "x", a: "y" }, "mauvais3": { id: 1, coll: 2, url: "https://music.apple.com/x');window.__PWNED=1;('" } },
    tracks: [piste(1, { cover: "https://evil.example/a.jpg);background:url(https://evil.example/b.jpg" }), piste(2, { cover: "https://e-cdns-images.dzcdn.net/images/cover/x/250x250.jpg" })] });
  await importer(page, sauv(st));
  await expect(page.locator(".modal h2")).toContainText(/Remplacer les données/);
  await expect(page.locator(".modal")).toContainText(/3 liens Apple Music invalides/);
  await expect(page.locator(".modal")).toContainText(/1 pochette/);
  await page.locator(".modal button.red").click();
  await expect(page.locator("#toasts")).toContainText(/Données restaurées/);
  const r = await page.evaluate(() => ({ am: Object.keys(S.am), c1: S.tracks[0].cover, c2: S.tracks[1].cover, pwned: window.__PWNED }));
  expect(r).toEqual({ am: ["bon"], c1: null, c2: "https://e-cdns-images.dzcdn.net/images/cover/x/250x250.jpg", pwned: undefined });
  expect(erreurs).toEqual([]);
});

test("P0-03 restauration : une sauvegarde légitime avec lien Apple, pochette et tendances est toujours acceptée", async ({ page }) => {
  await ouvrir(page);
  const st = etat({ am: { "rema calm down": { id: 1, coll: 2, url: "https://music.apple.com/fr/album/x/2?i=1", t: "Calm Down", a: "Rema" }, "inconnu": null },
    trends: { date: 1, items: [{ t: "Calm Down", a: "Rema", dz: 11, pos: 1, cover: "https://e-cdns-images.dzcdn.net/images/cover/x/250x250.jpg", pop: 5 }] },
    pls: [{ id: "p1", name: "P", src: "setmate", date: 1, items: [{ t: "A", a: "B", dz: 3, cover: null, pop: 5, aid: 8 }], cover: null }], gigs: [{ id: 5, lieu: "Club", date: "2026-10-01", type: "Club", played: [1] }] });
  await importer(page, sauv(st));
  await expect(page.locator(".modal h2")).toContainText(/Remplacer les données/);
});

test("P0-03 JSONP : l'adresse de la balise <script> est limitée à api.deezer.com en https", async ({ page }) => {
  await ouvrir(page);
  const r = await page.evaluate(async () => {
    const ajouts = []; const o = Node.prototype.appendChild; Node.prototype.appendChild = function (n) { if (n.tagName === "SCRIPT") ajouts.push(n.src); return o.apply(this, arguments); };
    const essais = {}; for (const u of ["https://evil.example/x", "http://api.deezer.com/track/1", "javascript:window.__PWNED=1", "https://api.deezer.com.evil.example/track/1"]) { try { await jsonp(u, 500); essais[u] = "accepté"; } catch (e) { essais[u] = "refusé"; } }
    Node.prototype.appendChild = o; return { ajouts, essais };
  });
  expect(r.ajouts, "aucune balise script créée pour une adresse hors liste").toEqual([]);
  expect(Object.values(r.essais).every(v => v === "refusé")).toBe(true);
});
