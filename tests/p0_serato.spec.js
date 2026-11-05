// P0-04 : protection Serato et export M3U8.
// Règles testées : (1) aucune écriture dans un dossier _Serato_ (base, crates), quoi que disent les Réglages ;
// (2) seratoGate refuse toujours ; (3) l'export M3U8 est exact (ordre, UTF-8, chemins Windows, pistes sans fichier signalées) ;
// (4) le statut « compatibilité réelle non testée » est visible. Aucune bibliothèque personnelle : seulement tests/fixtures/serato/.
// Limite assumée : un M3U8 correct n'est PAS une preuve d'import dans un vrai Serato (non testé).
const { test } = require("@playwright/test");
const fs = require("fs"), path = require("path");
const { ouvrir, expect } = require("./aide");

const FIX = path.join(__dirname, "fixtures", "serato");
const lire = (...p) => fs.readFileSync(path.join(FIX, ...p));
const PISTES = JSON.parse(lire("pistes_reference.json", "").toString("utf8"));
const ATTENDU = lire("attendu_set.m3u8");
const NON_ECRITES = JSON.parse(lire("attendu_non_ecrites.json").toString("utf8"));
const DB_B64 = lire("bibliotheque_test", "_Serato_", "database V2").toString("base64");
const CRATE_B64 = lire("bibliotheque_test", "_Serato_", "Subcrates", "Test reference.crate").toString("base64");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

/** Faux système de fichiers en mémoire : enregistre TOUTE opération qui modifierait quelque chose (window.__ops). */
function installerFauxDisque(page) {
  return page.evaluate(({ dbB64, crateB64 }) => {
    window.__ops = [];
    const bytesDe = b64 => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    class FFile {
      constructor(parent, name, bytes) { this.kind = "file"; this.name = name; this.parent = parent; this.bytes = bytes || new Uint8Array(0); }
      path() { return this.parent.path() + "/" + this.name; }
      async getFile() { return new File([this.bytes], this.name); }
      async createWritable() { const me = this; window.__ops.push({ op: "createWritable", path: me.path() });
        return { async write(d) { me.bytes = new Uint8Array(await new Blob([d]).arrayBuffer()); window.__ops.push({ op: "write", path: me.path() }); }, async close() { window.__ops.push({ op: "close", path: me.path() }); } }; }
    }
    class FDir {
      constructor(name, parent) { this.kind = "directory"; this.name = name; this.parent = parent; this.kids = new Map(); }
      path() { return (this.parent ? this.parent.path() : "") + "/" + this.name; }
      async getFileHandle(n, o) { const k = this.kids.get(n); if (k && k.kind === "file") return k;
        if (o && o.create) { window.__ops.push({ op: "create-file", path: this.path() + "/" + n }); const f = new FFile(this, n); this.kids.set(n, f); return f; }
        throw new DOMException("introuvable", "NotFoundError"); }
      async getDirectoryHandle(n, o) { const k = this.kids.get(n); if (k && k.kind === "directory") return k;
        if (o && o.create) { window.__ops.push({ op: "create-dir", path: this.path() + "/" + n }); const d = new FDir(n, this); this.kids.set(n, d); return d; }
        throw new DOMException("introuvable", "NotFoundError"); }
      async removeEntry(n) { window.__ops.push({ op: "remove", path: this.path() + "/" + n }); this.kids.delete(n); }
      async *entries() { for (const e of this.kids) yield e; }
      async queryPermission() { return "granted"; }
      async requestPermission() { return "granted"; }
      // construction du décor (ne compte pas comme une opération de l'appli)
      mk(n) { const d = new FDir(n, this); this.kids.set(n, d); return d; }
      put(n, bytes) { const f = new FFile(this, n, bytes); this.kids.set(n, f); return f; }
    }
    const disque = new FDir("Disque", null);
    const serato = disque.mk("Musique").mk("_Serato_");
    serato.put("database V2", bytesDe(dbB64));
    serato.mk("Subcrates").put("Test reference.crate", bytesDe(crateB64));
    const musique = disque.mk("MusiqueAudio"); musique.put("Calm.mp3", new Uint8Array([1, 2, 3, 4, 5]));
    const cle = disque.mk("CLE"); const sCle = cle.mk("_Serato_"); sCle.put("database V2", bytesDe(dbB64)); sCle.mk("Subcrates").put("Test reference.crate", bytesDe(crateB64));
    window.FD = { FDir, FFile, disque, serato, musique, cle, sCle };
    window.empreintes = async dir => { const out = {}; const rec = async d => { for (const [n, v] of d.kids) { if (v.kind === "file") { const h = await crypto.subtle.digest("SHA-256", v.bytes); out[v.path()] = Array.from(new Uint8Array(h)).map(x => x.toString(16).padStart(2, "0")).join(""); } else await rec(v); } }; await rec(dir); return out; };
  }, { dbB64: DB_B64, crateB64: CRATE_B64 });
}
const reel = page => page.evaluate(() => { S.demo = false; });

// ---------- 1. Porte : refuse toujours ----------
test("P0-04 seratoGate : refuse toujours, même si les Réglages sont altérés", async ({ page }) => {
  const erreurs = await ouvrir(page);
  const r = await page.evaluate(async () => {
    const res = {};
    S.demo = false;
    res.defaut = await seratoGate();
    S.flags = { seratover: false }; S.seratoVer = "3"; res.interrupteurCoupe = await seratoGate();   // l'ancien réglage qui rendait la porte permissive
    S.flags = { seratover: false, reco2: false }; S.seratoVer = "3"; S.flags.seratoGate = true; res.autresFlags = await seratoGate();
    S.flags = undefined; S.seratoVer = null; res.flagsAbsents = await seratoGate();
    const ancienFlag = window.flag; window.flag = () => false; S.seratoVer = "3"; res.flagFonctionTrompee = await seratoGate(); window.flag = ancienFlag;
    let leve = false; try { SERATO_ECRITURE_AUTORISEE = true; } catch (e) { leve = true; }   // la constante ne peut pas être réaffectée
    res.constanteVerrouillee = leve; res.apresTentative = await seratoGate(); res.constante = SERATO_ECRITURE_AUTORISEE;
    return res;
  });
  expect(r).toEqual({ defaut: false, interrupteurCoupe: false, autresFlags: false, flagsAbsents: false, flagFonctionTrompee: false, constanteVerrouillee: true, apresTentative: false, constante: false });
  expect(erreurs).toEqual([]);
});

test("P0-04 Réglages : plus d'interrupteur pour désactiver le contrôle (A-01), même après une restauration altérée", async ({ page }) => {
  const erreurs = await ouvrir(page);
  const r = await page.evaluate(() => { S.flags = { seratover: false }; go("settings"); const t = document.querySelector("#main").innerHTML; return { fi: Object.keys(FLAG_INFO), checkbox: /S\.flags\.seratover/.test(t), libelle: /Vérifier la version de Serato/.test(t) }; });
  expect(r.fi).not.toContain("seratover");
  expect(r.checkbox).toBe(false);
  expect(r.libelle).toBe(false);
  expect(erreurs).toEqual([]);
});

test("P0-04 une sauvegarde restaurée par le vrai parcours (Restaurer) avec l'ancien réglage coupé ne rend pas la porte permissive", async ({ page }) => {
  const erreurs = await ouvrir(page);
  // vraie sauvegarde produite par l'appli (mode démo), puis altérée : l'ancien interrupteur est coupé et la version Serato vaut « 3 »
  const json = await page.evaluate(async () => { enterDemo(); let txt = null; const od = window.download; window.download = b => { b.text().then(t => { txt = t; }); }; exportData(); window.download = od; for (let i = 0; i < 50 && !txt; i++) await sleep(20); return txt; });
  const sauv = JSON.parse(json); sauv.state.flags = { seratover: false, reco2: true }; sauv.state.seratoVer = "3";
  const [fc] = await Promise.all([page.waitForEvent("filechooser"), page.evaluate(() => importData())]);
  await fc.setFiles({ name: "sauvegarde.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(sauv)) });
  await expect(page.locator(".modal h2")).toContainText(/Remplacer les données/);
  await page.locator(".modal button.red").click();
  await expect(page.locator("#toasts")).toContainText(/Données restaurées/);
  const r = await page.evaluate(async () => { const flags = JSON.stringify(S.flags), ver = S.seratoVer; const gate = await seratoGate(); go("settings"); return { flags, ver, gate, checkbox: /S\.flags\.seratover/.test(document.querySelector("#main").innerHTML) }; });
  expect(JSON.parse(r.flags).seratover, "l'état altéré a bien été restauré").toBe(false);
  expect(r.ver).toBe("3");
  expect(r.gate, "la porte refuse malgré tout").toBe(false);
  expect(r.checkbox, "aucun interrupteur affiché").toBe(false);
  expect(erreurs).toEqual([]);
});

// ---------- 2. Aucune écriture dans _Serato_ (contrôle du code source) ----------
test("P0-04 code : l'unique écriture de fichier est la copie de fichiers audio, jamais dans Serato", async () => {
  const code = html.match(/<script>([\s\S]*)<\/script>\s*<\/body>/)[1];
  const lignes = code.split("\n");
  const avec = re => lignes.map((l, i) => [i + 1, l]).filter(([, l]) => re.test(l));
  expect(avec(/createWritable/).length, "createWritable : une seule ligne (copyFiles)").toBe(1);
  expect(avec(/createWritable/)[0][1]).toMatch(/dest\.getFileHandle\(nm/);
  expect(avec(/\.removeEntry\(/).length, "aucun removeEntry").toBe(0);
  expect(avec(/getDirectoryHandle\("Subcrates"/).length, "plus de dossier Subcrates ouvert").toBe(0);
  expect(avec(/getDirectoryHandle\("_Serato_"/).length, "plus de dossier _Serato_ ouvert en écriture").toBe(0);
  expect(avec(/buildCrate\(/).length, "buildCrate n'est plus appelé par l'interface (définition seule)").toBe(1);
  const rw = avec(/mode:"readwrite"/).map(([, l]) => /setfolder/.test(l) ? "setfolder" : /id:"usb"/.test(l) ? "usb" : "AUTRE");
  expect(rw.sort(), "seuls les dossiers de copie (set, clé) demandent l'écriture").toEqual(["setfolder", "usb"]);
  expect(code).toMatch(/async function writeFile\(\)\{seratoRefus\("writeFile"\);\}/);
  expect(code).toMatch(/async function writeCrates\(\)\{seratoRefus\("writeCrates"\);\}/);
});

// ---------- 3. Aucune écriture dans _Serato_ (comportement, faux disque) ----------
test.describe("faux disque", () => {
  test.beforeEach(({}, testInfo) => { test.skip(testInfo.project.name !== "chrome", "demande l'accès aux dossiers (Chrome seulement)"); });

  test("P0-04 aucune fonction n'écrit dans la bibliothèque Serato, réglages altérés ou non", async ({ page }) => {
    const erreurs = await ouvrir(page);
    const telechargements = []; page.on("download", d => telechargements.push(d.suggestedFilename()));
    await installerFauxDisque(page);
    const avant = await page.evaluate(async () => await empreintes(FD.disque));
    const lecture = await page.evaluate(async () => {
      S.demo = false; S.flags = { seratover: false }; S.seratoVer = "3";              // altéré exprès : l'ancien réglage ouvrait l'écriture
      H.serato = FD.serato; PERM.serato = "granted"; H.music = FD.musique; PERM.music = "granted";
      const ok = await loadSerato(false);                                                // la LECTURE doit toujours marcher
      const piste = S.tracks.find(t => t.t === "Calm Down");
      S.set = { name: "Set écriture", ids: S.tracks.filter(t => !t.wish).slice(0, 3).map(t => t.n), gig: null }; S.crates = {}; RULES.forEach((r, i) => S.crates[i] = 1);
      return { ok, n: S.tracks.length, piste: piste && piste.path, h: !!H.serato };
    });
    expect(lecture.ok, "loadSerato lit la base de test").not.toBe(false);
    expect(lecture.n).toBeGreaterThan(5);
    expect(lecture.piste).toBe("Users/ines/Music/DJ/Rema - Calm Down.mp3");
    // tous les points d'entrée d'écriture
    const sorties = await page.evaluate(async () => {
      const out = {};
      const essai = async (nom, f) => { try { await f(); out[nom] = "ok"; } catch (e) { out[nom] = "refus : " + e.message; } };
      await essai("exportSetCrate", () => exportSetCrate());
      out.modalCrate = (document.querySelector(".modal h2") || {}).textContent || "";
      closeModal();
      await essai("writeRuleCrates", () => writeRuleCrates());
      closeModal();
      await essai("writeCrates", () => writeCrates(H.serato, [{ name: "X", paths: ["a"] }], "main"));
      await essai("writeFile", () => writeFile(H.serato, "database V2", new Uint8Array([0])));
      await essai("writableSerato", async () => { out.writable = await writableSerato(); });
      await essai("copyFiles dans un dossier Serato", () => copyFiles(FD.serato, [S.tracks[0]], null, false));
      return out;
    });
    expect(sorties.exportSetCrate).toBe("ok");
    expect(sorties.modalCrate).toContain("Pas de crate possible");
    expect(sorties.writeCrates).toMatch(/désactivée/);
    expect(sorties.writeFile).toMatch(/désactivée/);
    expect(sorties.writable).toBeNull();
    expect(sorties["copyFiles dans un dossier Serato"]).toMatch(/désactivée/);
    const ops = await page.evaluate(() => window.__ops);
    expect(ops, "aucune opération d'écriture sur le faux disque").toEqual([]);
    expect(await page.evaluate(async () => await empreintes(FD.disque))).toEqual(avant);
    expect(telechargements.every(n => /\.m3u8$/.test(n)), "seuls des .m3u8 sont téléchargés : " + telechargements.join(", ")).toBe(true);
    expect(erreurs).toEqual([]);
  });

  test("P0-04 la copie sur clé n'écrit que dans SetMate/, jamais dans le _Serato_ de la clé", async ({ page }) => {
    const erreurs = await ouvrir(page);
    await installerFauxDisque(page);
    const avant = await page.evaluate(async () => await empreintes(FD.cle.kids.get("_Serato_")));
    await page.evaluate(() => {
      S.demo = false; S.flags = { seratover: false }; S.seratoVer = "3"; H.music = FD.musique; PERM.music = "granted"; S.musicPrefix = "Users/ines/Music/";
      S.tracks = [{ n: 1, path: "Users/ines/Music/Calm.mp3", t: "Calm Down", a: "Rema", g: "Afro", sg: "", k: "8A", bpm: 100, e: 5, inSerato: true }]; reindex();
      S.set = { name: "Set clé", ids: [1], gig: null };
      window.showDirectoryPicker = async () => FD.cle;
      exportUsb();
    });
    await expect(page.locator("#usbGo")).toBeVisible();
    await page.locator("#usbGo").click();
    await page.waitForFunction(() => document.querySelectorAll(".step.done").length >= 2, null, { timeout: 15000 });
    const ops = await page.evaluate(() => window.__ops);
    expect(ops.length, "la copie a bien eu lieu").toBeGreaterThan(0);
    expect(ops.filter(o => /\/_Serato_/.test(o.path)), "rien dans _Serato_").toEqual([]);
    expect(ops.every(o => o.path.startsWith("/Disque/CLE/SetMate")), JSON.stringify(ops)).toBe(true);
    expect(await page.evaluate(async () => await empreintes(FD.cle.kids.get("_Serato_")))).toEqual(avant);
    expect(erreurs).toEqual([]);
  });

  test("P0-04 choisir un dossier _Serato_ comme destination est refusé (clé et dossier du set)", async ({ page }) => {
    const erreurs = await ouvrir(page);
    await installerFauxDisque(page);
    await page.evaluate(async () => {
      S.demo = false; H.music = FD.musique; PERM.music = "granted"; S.musicPrefix = "Users/ines/Music/";
      S.tracks = [{ n: 1, path: "Users/ines/Music/Calm.mp3", t: "Calm Down", a: "Rema", g: "Afro", sg: "", k: "8A", bpm: 100, e: 5, inSerato: true }]; reindex();
      S.set = { name: "Set refus", ids: [1], gig: null };
      window.showDirectoryPicker = async () => FD.sCle;
      exportUsb();
    });
    await page.locator("#usbGo").click();
    await page.waitForTimeout(400);
    await page.evaluate(async () => { closeModal(); await exportFolder(); });
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.__ops), "aucune écriture").toEqual([]);
    expect(erreurs).toEqual([]);
  });
});

// ---------- 4. Export M3U8 ----------
test("P0-04 M3U8 : contenu exact (ordre, accents, arabe, néerlandais, emoji, chemins Windows, pistes sans fichier)", async ({ page }) => {
  const erreurs = await ouvrir(page);
  const r = await page.evaluate(pistes => { const b = buildM3U8(pistes); return { text: b.text, written: b.written.map(x => x.n), skipped: b.skipped.map(k => k.track.n), reasons: b.skipped.map(k => k.reason), bytes: Array.from(new TextEncoder().encode(b.text)) }; }, PISTES);
  expect(Buffer.from(r.bytes).equals(ATTENDU), "octets identiques au fichier de référence").toBe(true);
  expect(r.text).toBe(ATTENDU.toString("utf8"));
  expect(r.written).toEqual([1, 2, 3, 4, 5, 7, 8, 11, 14]);           // l'ordre d'entrée est conservé
  expect(r.skipped).toEqual(NON_ECRITES);
  expect(r.reasons.every(x => x.length > 5)).toBe(true);
  expect(r.bytes.slice(0, 3), "pas de BOM").not.toEqual([0xEF, 0xBB, 0xBF]);
  expect(Buffer.from(r.bytes).toString("utf8").startsWith("#EXTM3U\n")).toBe(true);
  expect(r.text, "aucun chemin inventé pour une piste sans fichier").not.toMatch(/absent\.mp3|\/etc\/passwd|NAS|fichier\.mp3|m\.mp3|Sans chemin/);
  expect(r.text.split("\n").filter(l => l.startsWith("#EXTINF")).length).toBe(9);
  expect(erreurs).toEqual([]);
});

test("P0-04 M3U8 : chemins Windows et cas limites", async ({ page }) => {
  await ouvrir(page);
  const cas = [
    ["Users/ines/Music/a.mp3", "/Users/ines/Music/a.mp3"],
    ["/Users/ines/Music/a.mp3", "/Users/ines/Music/a.mp3"],
    ["C:\\Users\\Sabri\\Music\\a.mp3", "C:\\Users\\Sabri\\Music\\a.mp3"],
    ["C:/Users/Sabri/Music/a.mp3", "C:\\Users\\Sabri\\Music\\a.mp3"],
    ["d:\\Musique DJ\\Mon Dossier\\a b.mp3", "D:\\Musique DJ\\Mon Dossier\\a b.mp3"],
    ["E:\\Été\\ça va.flac", "E:\\Été\\ça va.flac"],
    ["D:\\\\Double\\\\sep.mp3", "D:\\Double\\sep.mp3"],
    ["Users\\ines\\Music\\b.mp3", "/Users/ines/Music/b.mp3"],
    ["\\\\NAS\\partage\\a.mp3", null],
    ["//NAS/partage/a.mp3", null],
    ["D:fichier.mp3", null], ["D:\\", null], ["", null], ["   ", null], [null, null], [undefined, null], [42, null],
    ["Users/x/a.mp3\n/etc/passwd", null], ["Users/x/a.mp3\r", null], ["Users/x/\u0000a.mp3", null]
  ];
  const r = await page.evaluate(c => c.map(([e]) => m3uPath(e)), cas);
  expect(r).toEqual(cas.map(c => c[1]));
  const long = await page.evaluate(() => { const p = "D:\\" + "a".repeat(250) + ".mp3"; const b = buildM3U8([{ n: 1, t: "T", a: "A", path: p }]); return { long: b.long.length, ecrit: b.written.length }; });
  expect(long).toEqual({ long: 1, ecrit: 1 });
});

test("P0-04 M3U8 : le vrai téléchargement du set est identique à la référence et signale les pistes sans fichier", async ({ page }) => {
  const erreurs = await ouvrir(page);
  await page.evaluate(pistes => { S.demo = false; S.tracks = pistes.map(p => ({ g: "Afro", sg: "", conf: 90, ...p })); reindex(); S.set = { name: "Set référence", ids: pistes.map(p => p.n), gig: null }; }, PISTES);
  const [dl] = await Promise.all([page.waitForEvent("download"), page.evaluate(() => exportM3U())]);
  expect(dl.suggestedFilename()).toBe("Set référence.m3u8");
  const flux = await dl.createReadStream(); const morceaux = []; for await (const c of flux) morceaux.push(c);
  expect(Buffer.concat(morceaux).equals(ATTENDU)).toBe(true);
  const modal = page.locator(".modal");
  await expect(modal).toContainText("6 sons sans fichier local");
  for (const t of ["Titre à récupérer", "Réseau", "Lecteur relatif", "Chemin piégé", "Manquant Serato", "Sans chemin"]) await expect(modal).toContainText(t);
  await expect(modal).toContainText("Compatibilité réelle non testée");
  await expect(modal).toContainText("9 sons écrits");
  expect(erreurs).toEqual([]);
});

test("P0-04 M3U8 : l'ordre suit le set (réordonné) et un set sans aucun fichier n'écrit rien", async ({ page }) => {
  const erreurs = await ouvrir(page);
  let telechargements = 0; page.on("download", () => telechargements++);
  const t = await page.evaluate(() => {
    S.demo = false; S.tracks = [1, 2, 3].map(n => ({ n, path: "Users/x/Music/" + n + ".mp3", t: "Titre " + n, a: "A", g: "Afro", sg: "", conf: 90 })); reindex();
    S.set = { name: "Ordre", ids: [3, 1, 2], gig: null }; const b = buildM3U8(S.set.ids.map(T)); const o1 = b.text.split("\n").filter(l => l.startsWith("#EXTINF")).map(l => l.slice(-1));
    S.tracks.forEach(x => x.wish = true); S.set = { name: "Vide", ids: [1, 2], gig: null }; exportM3U(); return { o1, modal: document.querySelector(".modal").innerText };
  });
  expect(t.o1).toEqual(["3", "1", "2"]);
  expect(t.modal).toContain("Aucun son avec un fichier local");
  await page.waitForTimeout(300);
  expect(telechargements).toBe(0);
  expect(erreurs).toEqual([]);
});

test("P0-04 M3U8 : en mode démo, aucun fichier avec des chemins inventés", async ({ page }) => {
  const erreurs = await ouvrir(page);
  let telechargements = 0; page.on("download", () => telechargements++);
  const msg = await page.evaluate(() => { enterDemo(); S.set.ids = visible().filter(t => !t.wish).slice(0, 3).map(t => t.n); const m = []; const o = window.toast; window.toast = x => m.push(x); exportM3U(); RULES.forEach((r, i) => S.crates[i] = 1); exportRuleM3U(); window.toast = o; return m; });
  await page.waitForTimeout(300);
  expect(telechargements).toBe(0);
  expect(msg.length).toBe(2);
  expect(msg.every(m => /chemins inventés/.test(m))).toBe(true);
  expect(erreurs).toEqual([]);
});

test("P0-04 M3U8 : playlists proposées de la bibliothèque, uniquement des .m3u8", async ({ page }) => {
  const erreurs = await ouvrir(page);
  const noms = []; page.on("download", d => noms.push(d.suggestedFilename()));
  await page.evaluate(() => { enterDemo(); S.demo = false; RULES.forEach((r, i) => S.crates[i] = 1); exportRuleM3U(); });
  await page.waitForTimeout(800);
  expect(noms.length).toBeGreaterThan(0);
  expect(noms.every(n => /^SetMate - .+\.m3u8$/.test(n)), noms.join(", ")).toBe(true);
  expect(erreurs).toEqual([]);
});

// ---------- 5. Libellés visibles ----------
test("P0-04 statut visible : « Compatibilité réelle non testée » près de l'export, plus de bouton « Crate Serato »", async ({ page }) => {
  const erreurs = await ouvrir(page);
  const r = await page.evaluate(() => {
    enterDemo(); S.set.ids = visible().filter(t => !t.wish).slice(0, 3).map(t => t.n); go("next");
    const set = document.querySelector("#main").innerText; const btn = [...document.querySelectorAll("#main button")].map(b => b.innerText.trim());
    S.sel = null; S.screen = "lib"; go("lib"); const lib = document.querySelector("#main").innerText;
    return { set, btn, lib };
  });
  expect(r.set).toContain("Compatibilité réelle non testée");
  expect(r.set).toContain("n’écrit rien dans ton dossier Serato");
  expect(r.btn).toContain("Exporter M3U8");
  expect(r.btn.some(b => /Crate Serato/.test(b))).toBe(false);
  expect(r.lib).toContain("Compatibilité réelle non testée");
  expect(r.lib).not.toMatch(/Créer dans Serato/);
  expect(erreurs).toEqual([]);
});

test("P0-04 « Protect Library » n'est jamais présentée comme une protection contre SetMate", async () => {
  expect(html).not.toMatch(/Protect Library/i);
});
