// Petit serveur statique pour les tests (aucune dépendance). Sert le dossier du site sur le port donné.
const http = require("http"), fs = require("fs"), path = require("path");
const racine = path.resolve(__dirname, ".."), port = Number(process.argv[2] || 4173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png", ".svg": "image/svg+xml", ".css": "text/css" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
  const f = path.join(racine, p);
  if (!f.startsWith(racine) || /node_modules|\.git/.test(p)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end("introuvable"); } res.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" }); res.end(d); });
}).listen(port, "127.0.0.1", () => console.log("serveur de test sur http://127.0.0.1:" + port));
