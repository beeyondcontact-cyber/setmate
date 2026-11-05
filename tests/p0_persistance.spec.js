// P0-01 : persistance. Une écriture n'est "réussie" qu'après la fin de la transaction IndexedDB ET une relecture.
// Les pannes de stockage sont SIMULÉES en remplaçant des méthodes d'IndexedDB dans la page (aucun vrai disque plein n'est provoqué).
const { test } = require("@playwright/test");
const { ouvrir, expect } = require("./aide");

// Remplace IDBObjectStore.prototype.put pour imiter une panne ; window.__pannePut() la retire.
const PANNES = {
  quota: () => { const o = IDBObjectStore.prototype.put; IDBObjectStore.prototype.put = function () { throw new DOMException("The quota has been exceeded.", "QuotaExceededError"); }; window.__pannePut = () => { IDBObjectStore.prototype.put = o; }; },
  abandon: () => { const o = IDBObjectStore.prototype.put; IDBObjectStore.prototype.put = function () { const r = o.apply(this, arguments); this.transaction.abort(); return r; }; window.__pannePut = () => { IDBObjectStore.prototype.put = o; }; },
  fantome: () => { const o = IDBObjectStore.prototype.put; IDBObjectStore.prototype.put = function () { return {}; }; window.__pannePut = () => { IDBObjectStore.prototype.put = o; }; }
};
async function panne(page, nom) { await page.evaluate(`(${PANNES[nom].toString()})()`); }
async function repare(page) { await page.evaluate(() => window.__pannePut()); }

test("P0-01 succès : DB.set ne répond qu'après la fin de transaction, et la valeur est relue", async ({ page }) => {
  const erreurs = await ouvrir(page);
  const r = await page.evaluate(async () => { await DB.set("t_ok", { a: 1, b: [1, 2, 3] }); return DB.get("t_ok"); });
  expect(r).toEqual({ a: 1, b: [1, 2, 3] });
  const r2 = await page.evaluate(async () => { await DB.setMany([["t_a", [1]], ["t_b", [2, 3]]]); await DB.del("t_a"); return [await DB.get("t_a"), await DB.get("t_b")]; });
  expect(r2).toEqual([undefined, [2, 3]]);
  expect(erreurs).toEqual([]);
});

test("P0-01 quota : une erreur de quota est refusée (pas de faux « fait »), les anciennes données restent lisibles", async ({ page }) => {
  await ouvrir(page);
  await page.evaluate(async () => { await DB.set("t_q", "ancien"); });
  await panne(page, "quota");
  const r = await page.evaluate(async () => { try { await DB.set("t_q", "nouveau"); return { ok: true }; } catch (e) { return { ok: false, quota: e.quota === true, msg: e.message }; } });
  await repare(page);
  expect(r.ok, "DB.set ne doit pas répondre « fait » quand le navigateur refuse l'écriture").toBe(false);
  expect(r.quota).toBe(true);
  expect(r.msg).toMatch(/plein|quota/i);
  expect(await page.evaluate(() => DB.get("t_q"))).toBe("ancien");
});

test("P0-01 transaction annulée en cours de route : erreur exploitable, ancienne valeur intacte", async ({ page }) => {
  await ouvrir(page);
  await page.evaluate(async () => { await DB.set("t_ab", "ancien"); });
  await panne(page, "abandon");
  const r = await page.evaluate(async () => { try { await DB.set("t_ab", "nouveau"); return { ok: true }; } catch (e) { return { ok: false, msg: e.message }; } });
  await repare(page);
  expect(r.ok).toBe(false);
  expect(r.msg.length).toBeGreaterThan(10);
  expect(await page.evaluate(() => DB.get("t_ab"))).toBe("ancien");
});

test("P0-01 relecture : une transaction « terminée » dont la donnée est absente n'est pas prise pour un succès", async ({ page }) => {
  await ouvrir(page);
  await panne(page, "fantome");
  const r = await page.evaluate(async () => { try { await DB.set("t_fant", { x: 1 }); return { ok: true }; } catch (e) { return { ok: false, msg: e.message }; } });
  await repare(page);
  expect(r.ok, "sans relecture, ce cas était annoncé comme réussi").toBe(false);
});

test("P0-01 connexion fermée (interruption) : refus clair, puis reprise après réouverture", async ({ page }) => {
  await ouvrir(page);
  const r = await page.evaluate(async () => { DB.db.close(); let ok = null; try { await DB.set("t_cl", 1); ok = true; } catch (e) { ok = false; } await DB.open(); await DB.set("t_cl", 2); return { ok, apres: await DB.get("t_cl") }; });
  expect(r).toEqual({ ok: false, apres: 2 });
});

test("P0-01 opération groupée atomique : si une écriture échoue, aucune des autres n'est gardée", async ({ page }) => {
  await ouvrir(page);
  await page.evaluate(() => { const o = IDBObjectStore.prototype.put; window.__o = o; IDBObjectStore.prototype.put = function (v, k) { if (k === "t_b") throw new DOMException("plein", "QuotaExceededError"); return o.apply(this, arguments); }; });
  const r = await page.evaluate(async () => { try { await DB.setMany([["t_a", 1], ["t_b", 2]]); return "accepté"; } catch (e) { return e.quota === true ? "refusé (quota)" : "autre : " + e.message; } });
  await page.evaluate(() => { IDBObjectStore.prototype.put = window.__o; });
  expect(r).toBe("refusé (quota)");
  expect(await page.evaluate(async () => [await DB.get("t_a"), await DB.get("t_b")])).toEqual([undefined, undefined]);
});

test("P0-01 save() : échec = indicateur visible + message de quota + données en mémoire intactes, puis rétablissement", async ({ page }) => {
  const erreurs = await ouvrir(page);
  await page.evaluate(async () => { S.set.name = "Avant"; save(); await flushSave(); });
  await panne(page, "quota");
  await page.evaluate(async () => { S.set.name = "Après panne"; save(); try { await flushSave(); } catch (e) {} });
  const apres = await page.evaluate(() => ({ nom: S.set.name, badge: !!document.getElementById("saveBadge"), texte: (document.getElementById("saveBadge") || {}).textContent || "", nonEnregistre: document.documentElement.dataset.unsaved === "1" }));
  expect(apres.nom).toBe("Après panne");
  expect(apres.badge, "indicateur « non enregistré »").toBe(true);
  expect(apres.texte).toMatch(/non enregistr/i);
  expect(apres.nonEnregistre).toBe(true);
  await expect(page.locator("#toasts")).toContainText(/Stockage plein/);
  const stocke = await page.evaluate(() => DB.get("state").then(s => s.set.name));
  expect(stocke, "l'état précédent reste lisible").toBe("Avant");
  await repare(page);
  await page.evaluate(async () => { await flushSave(); });
  const final = await page.evaluate(async () => ({ badge: !!document.getElementById("saveBadge"), nonEnregistre: document.documentElement.dataset.unsaved === "1", stocke: (await DB.get("state")).set.name }));
  expect(final).toEqual({ badge: false, nonEnregistre: false, stocke: "Après panne" });
  expect(erreurs).toEqual([]);
});

test("P0-01 fermeture de page : pagehide force l'écriture sans attendre les 400 ms", async ({ page }) => {
  await ouvrir(page);
  await page.evaluate(async () => { S.set.name = "Avant fermeture"; save(); window.dispatchEvent(new Event("pagehide")); });
  await expect.poll(() => page.evaluate(() => DB.get("state").then(s => s.set.name)), { timeout: 350, intervals: [25] }).toBe("Avant fermeture");
});
