/**
 * API local de contenido SOLO para `npm run dev`: permite que el panel /admin lea y escriba
 * archivos de /content, /public/media y /public/docs sin pasar por GitHub.
 * En producción el admin usa la API de GitHub (ver src/admin/storage/github.ts).
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const ROOT = process.cwd();
const ALLOWED = ['content/', 'public/media/', 'public/docs/'];

function safePath(p: string | null): string | null {
  if (!p) return null;
  const norm = path.posix.normalize(p.replace(/\\/g, '/')).replace(/^\/+/, '');
  if (norm.includes('..') || !ALLOWED.some((a) => norm.startsWith(a))) return null;
  return path.join(ROOT, norm);
}

function readBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export function localContentApi(): Plugin {
  return {
    name: 'isef-local-content-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__content', async (req, res) => {
        const remote = req.socket.remoteAddress ?? '';
        if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote)) {
          res.statusCode = 403;
          return res.end('Solo localhost');
        }
        const url = new URL(req.url ?? '/', 'http://localhost');
        const send = (code: number, body: unknown) => {
          res.statusCode = code;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };
        try {
          if (url.pathname === '/list') {
            const dir = safePath(url.searchParams.get('dir'));
            if (!dir) return send(400, { error: 'dir inválido' });
            const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => !f.startsWith('.')) : [];
            return send(200, files.map((name) => ({ name, path: path.relative(ROOT, path.join(dir, name)).replace(/\\/g, '/') })));
          }
          if (url.pathname === '/file') {
            const file = safePath(url.searchParams.get('path'));
            if (!file) return send(400, { error: 'path inválido' });
            if (req.method === 'GET') {
              if (!fs.existsSync(file)) return send(404, { error: 'no existe' });
              return send(200, { content: fs.readFileSync(file, 'utf8') });
            }
            if (req.method === 'PUT') {
              const { content, encoding } = JSON.parse(await readBody(req)) as { content: string; encoding?: 'base64' | 'utf8' };
              fs.mkdirSync(path.dirname(file), { recursive: true });
              fs.writeFileSync(file, encoding === 'base64' ? Buffer.from(content, 'base64') : content);
              return send(200, { ok: true });
            }
            if (req.method === 'DELETE') {
              if (fs.existsSync(file)) fs.unlinkSync(file);
              return send(200, { ok: true });
            }
          }
          send(404, { error: 'ruta desconocida' });
        } catch (e) {
          send(500, { error: (e as Error).message });
        }
      });
    },
  };
}
