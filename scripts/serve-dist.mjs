/**
 * Servidor estático que imita producción (Cloudflare, ver wrangler.jsonc): /ruta → /ruta.html, sin .html ni
 * barra final, redirecciones de dist/_redirects y 404.html.
 * Uso: npm run preview  (después de npm run build)
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const DIST = path.resolve('dist');
const PORT = Number(process.env.PORT ?? 4173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json', '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.pdf': 'application/pdf', '.jpg': 'image/jpeg' };

// Reglas de _redirects: "origen destino código". Un "*" final en el origen es un comodín.
const RULES = fs
  .readFileSync(path.join(DIST, '_redirects'), 'utf8')
  .split('\n')
  .map((l) => l.replace(/#.*/, '').trim().split(/\s+/))
  .filter((r) => r.length >= 2)
  .map(([from, to, code = '302']) => ({ from, to, code: Number(code) }));

const matches = (from, url) => (from.endsWith('/*') ? url.startsWith(from.slice(0, -1)) : from === url);

function redirect(res, location, code = 308) {
  res.writeHead(code, { Location: location });
  res.end();
}

http
  .createServer((req, res) => {
    let url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const rule = RULES.find((r) => matches(r.from, url));
    if (rule && rule.code !== 200) return redirect(res, rule.to, rule.code);
    if (rule) url = rule.to;
    if (url.endsWith('.html')) return redirect(res, url.slice(0, -5).replace(/\/index$/, '/'));
    if (url.length > 1 && url.endsWith('/')) return redirect(res, url.slice(0, -1));

    for (const c of [url, `${url}.html`, `${url}/index.html`]) {
      const p = path.join(DIST, c);
      if (p.startsWith(DIST) && fs.existsSync(p) && fs.statSync(p).isFile()) {
        const type = TYPES[path.extname(p)] ?? 'application/octet-stream';
        const gzip = /text|javascript|json|xml|svg/.test(type) && /gzip/.test(req.headers['accept-encoding'] ?? '');
        res.writeHead(200, { 'Content-Type': type, ...(gzip ? { 'Content-Encoding': 'gzip' } : {}) });
        const stream = fs.createReadStream(p);
        return gzip ? stream.pipe(zlib.createGzip()).pipe(res) : stream.pipe(res);
      }
    }
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    fs.createReadStream(path.join(DIST, '404.html')).pipe(res);
  })
  .listen(PORT, () => console.log(`Sitio de producción en http://localhost:${PORT}`));
