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
  return erreurs;
}
module.exports = { ouvrir, expect };
