// Aide commune aux tests P0 (ouverture de l'appli sans réseau extérieur, Deezer simulé minimal).
const { expect } = require("@playwright/test");

function reponseDeezer(url) {
  const u = new URL(url), cb = u.searchParams.get("callback") || "cb";
  return `${cb}(${JSON.stringify({ data: [] })})`;
}

/** Ouvre l'appli. Renvoie le tableau des erreurs de page (pageerror et console.error hors réseau simulé). */
async function ouvrir(page) {
  const erreurs = [];
  page.on("pageerror", e => erreurs.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource|net::ERR|ERR_FAILED|favicon/.test(m.text())) erreurs.push("console: " + m.text()); });
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  await page.route(/api\.deezer\.com/, r => r.fulfill({ status: 200, contentType: "text/javascript", body: reponseDeezer(r.request().url()) }));
  await page.goto("/index.html");
  await page.waitForFunction(() => typeof VERSION !== "undefined" && typeof S !== "undefined" && !!document.querySelector("#main .screen"));
  await page.evaluate(() => closeModal());
  await attendreDemarrage(page);
  return erreurs;
}

/** Attend la fin des tâches de fond du démarrage avant toute photo de l'état.
 *  Au démarrage, l'appli rafraîchit les tendances Deezer (simulées ici), puis enregistre l'état et ajoute une
 *  notification « Nouveautés prêtes » dont l'identifiant est l'heure. Sans cette attente, un test qui compare
 *  l'état enregistré « avant » et « après » peut voir ce changement de fond et échouer selon la vitesse de la
 *  machine (constaté sur la CI GitHub, 5 échecs). L'exigence des tests ne change pas : l'état doit rester identique
 *  à l'octet. Si le rafraîchissement ne se termine pas, l'attente échoue avec un message clair (pas de contournement). */
async function attendreDemarrage(page) {
  await page.waitForFunction(() => typeof trBusy !== "undefined" && trBusy === false && S.trends && S.trends.date > 0, null, { timeout: 15000 });
  const lire = () => page.evaluate(async () => JSON.stringify({ s: await DB.get("state"), t: await DB.get("tracks") }));
  let precedent = await lire();
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(700); // plus long que le délai d'écriture différée (400 ms)
    const courant = await lire();
    if (courant === precedent) return;
    precedent = courant;
  }
  throw new Error("l'état enregistré ne se stabilise pas après le démarrage de l'appli");
}
module.exports = { ouvrir, expect };
