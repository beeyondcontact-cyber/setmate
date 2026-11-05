// Fabrique les fichiers de référence de P0-04, de façon INDÉPENDANTE du code de l'appli (aucun import de index.html).
//  - pistes_reference.json : pistes inventées (accents, arabe, néerlandais, emoji, chemins Windows, cas à refuser)
//  - attendu_set.m3u8      : ce que l'export M3U8 doit produire (écrit ici par un formateur séparé, d'après la spécification du test)
//  - bibliotheque_test/_Serato_/ : une fausse bibliothèque Serato (database V2 + 1 crate) fabriquée avec un encodeur séparé
// Aucun fichier personnel de dj, aucun vrai dossier _Serato_. Usage : node tests/fixtures/serato/fabriquer_reference.js
const fs = require("fs"), path = require("path");
const ici = __dirname;

const pistes = [
  { n: 1, t: "Calm Down", a: "Rema", path: "Users/ines/Music/DJ/Rema - Calm Down.mp3" },
  { n: 2, t: "Été à Paris", a: "Aya Nakamura", path: "Users/ines/Music/Été à Paris.mp3" },
  { n: 3, t: "أحبك", a: "فيروز", path: "Users/ines/Music/فيروز - أحبك.mp3" },
  { n: 4, t: "Ik ben een ijsbeer ĳs", a: "Zoë Çelik", path: "Users/ines/Music/Zoë Çelik - ijsbeer.mp3" },
  { n: 5, t: "Fête 🎉🔥 𝄞", a: "DJ Émoji", path: "Users/ines/Music/Fête 🎉🔥.mp3" },
  { n: 6, t: "Titre à récupérer", a: "Absent", path: "Users/ines/Music/absent.mp3", wish: true },
  { n: 7, t: "Windows D", a: "Artiste Lecteur", path: "D:\\Musique DJ\\Été 2026\\Track 01.mp3" },
  { n: 8, t: "Windows slash", a: "Artiste Mixte", path: "c:/Users/dj/Music/a b/c d.mp3" },
  { n: 9, t: "Réseau", a: "NAS", path: "\\\\NAS\\musique\\z.mp3" },
  { n: 10, t: "Lecteur relatif", a: "X", path: "D:fichier.mp3" },
  { n: 11, t: "Titre\nsur deux lignes", a: "Piège", path: "Users/ines/Music/ok.mp3" },
  { n: 12, t: "Chemin piégé", a: "Piège", path: "Users/ines/Music/a.mp3\n#EXTINF:-1,faux\n/etc/passwd" },
  { n: 13, t: "Manquant Serato", a: "Y", path: "Users/ines/Music/m.mp3", missing: true },
  { n: 14, t: "Sans artiste", a: "", path: "Users/ines/Music/sans artiste.mp3" },
  { n: 15, t: "Sans chemin", a: "Z" }
];
fs.writeFileSync(path.join(ici, "pistes_reference.json"), JSON.stringify(pistes, null, 1) + "\n", "utf8");

// Attendu : écrit à la main d'après la règle « UTF-8 sans BOM, \n, #EXTM3U, #EXTINF:-1,Artiste - Titre, chemin ; pistes sans fichier local omises ».
const attendu = [
  "#EXTM3U",
  "#EXTINF:-1,Rema - Calm Down", "/Users/ines/Music/DJ/Rema - Calm Down.mp3",
  "#EXTINF:-1,Aya Nakamura - Été à Paris", "/Users/ines/Music/Été à Paris.mp3",
  "#EXTINF:-1,فيروز - أحبك", "/Users/ines/Music/فيروز - أحبك.mp3",
  "#EXTINF:-1,Zoë Çelik - Ik ben een ijsbeer ĳs", "/Users/ines/Music/Zoë Çelik - ijsbeer.mp3",
  "#EXTINF:-1,DJ Émoji - Fête 🎉🔥 𝄞", "/Users/ines/Music/Fête 🎉🔥.mp3",
  "#EXTINF:-1,Artiste Lecteur - Windows D", "D:\\Musique DJ\\Été 2026\\Track 01.mp3",
  "#EXTINF:-1,Artiste Mixte - Windows slash", "C:\\Users\\dj\\Music\\a b\\c d.mp3",
  "#EXTINF:-1,Piège - Titre sur deux lignes", "/Users/ines/Music/ok.mp3",
  "#EXTINF:-1,Sans artiste", "/Users/ines/Music/sans artiste.mp3"
].join("\n") + "\n";
fs.writeFileSync(path.join(ici, "attendu_set.m3u8"), Buffer.from(attendu, "utf8"));
fs.writeFileSync(path.join(ici, "attendu_non_ecrites.json"), JSON.stringify([6, 9, 10, 12, 13, 15]) + "\n", "utf8");

// --- Fausse bibliothèque Serato (encodeur séparé, volontairement simple) ---
const u32 = n => { const b = Buffer.alloc(4); b.writeUInt32BE(n); return b; };
const u16be = s => { const b = Buffer.alloc(s.length * 2); for (let i = 0; i < s.length; i++) b.writeUInt16BE(s.charCodeAt(i), i * 2); return b; };
const rec = (tag, payload) => Buffer.concat([Buffer.from(tag, "latin1"), u32(payload.length), payload]);
const txt = (tag, s) => rec(tag, u16be(s));
const bool = (tag, v) => rec(tag, Buffer.from([v ? 1 : 0]));
const base = path.join(ici, "bibliotheque_test", "_Serato_");
fs.mkdirSync(path.join(base, "Subcrates"), { recursive: true });
const otrk = p => rec("otrk", Buffer.concat([txt("pfil", p.path.replace(/\\/g, "/")), txt("tsng", p.t.replace(/\n/g, " ")), txt("tart", p.a), txt("tbpm", "100.00"), txt("tkey", "8A"), ...(p.missing ? [bool("bmis", true)] : [])]));
const db = Buffer.concat([txt("vrsn", "2.0/Serato Scratch LIVE Database"), ...pistes.filter(p => p.path && !/^\\\\/.test(p.path) && !/[\n]/.test(p.path) && !/^[A-Za-z]:[^\\/]/.test(p.path)).map(otrk)]);
fs.writeFileSync(path.join(base, "database V2"), db);
const crate = Buffer.concat([txt("vrsn", "1.0/Serato ScratchLive Crate"), rec("osrt", Buffer.concat([txt("tvcn", "key"), bool("brev", false)])), rec("ovct", Buffer.concat([txt("tvcn", "song"), txt("tvcw", "0")])), ...pistes.slice(0, 3).map(p => rec("otrk", txt("ptrk", p.path)))]);
fs.writeFileSync(path.join(base, "Subcrates", "Test reference.crate"), crate);
console.log("références fabriquées dans " + ici);
