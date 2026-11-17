/* Serveur local de test : node tools/serve.mjs  → http://localhost:8080
   Sert le dépôt avec les bons types MIME (manifest, modules ES, PNG). */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const ROOT = process.cwd(), PORT = process.env.PORT || 8080;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.css': 'text/css; charset=utf-8', '.yml': 'text/yaml; charset=utf-8' };
http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    const s = await stat(f);
    if (s.isDirectory()) { res.writeHead(302, { Location: p + '/index.html' }).end(); return; }
    const b = await readFile(f);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream',
      'Cache-Control': 'no-store', 'Service-Worker-Allowed': '/' });
    res.end(b);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404'); }
}).listen(PORT, () => console.log(`▶ http://localhost:${PORT}  (icons.html pour le studio)`));
