/**
 * Servidor estático que imita producción (Apache/.htaccess): /ruta → /ruta.html, 404.html.
 * Uso: npm run preview  (después de npm run build)
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const DIST = path.resolve('dist');
const PORT = Number(process.env.PORT ?? 4173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json', '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.pdf': 'application/pdf', '.jpg': 'image/jpeg' };
const LEGACY = { '/Carrera': '/carrera', '/Inscripciones': '/inscripciones', '/Especializaciones': '/especializaciones', '/Noticias': '/novedades', '/Cookies': '/privacidad', '/Institucional/Contacto': '/contacto', '/Institucional': '/contacto', '/TestHiit': '/test-hiit' };

http
  .createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (LEGACY[url]) {
      res.writeHead(301, { Location: LEGACY[url] });
      return res.end();
    }
    const candidates = [url, `${url}.html`, `${url}/index.html`];
    if (url.startsWith('/admin')) candidates.push('/admin.html');
    for (const c of candidates) {
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
