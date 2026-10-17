/**
 * Worker del sitio: sirve los archivos estáticos (dist/) y, solo bajo /api/*, las funciones del panel:
 *   GET  /api/fotos?q=…                     → fotos de stock gratuitas de dominio público (Openverse, CC0/PDM)
 *   GET  /api/fotos/descargar?url=…         → baja la foto elegida (solo de bancos de imágenes) para procesarla en el panel
 *   GET  /api/certificados/respuestas?form= → respuestas del Google Form (vía el Apps Script del instituto)
 *   GET  /api/certificados/emitidos?form=   → certificados ya emitidos de esa actividad
 *   POST /api/certificados/emitir           → registra un certificado y, si trae mail, lo manda por Gmail
 *   GET/POST /api/certificados/firma        → firma escaneada del rector (guardada en el Apps Script, no en el repo)
 *   GET  /api/verificar?c=…                 → PÚBLICA: valida un código de certificado (página /verificar)
 * Gratis: no usa servicios pagos. Exige la contraseña del panel (token de GitHub con permiso de escritura),
 * salvo /api/verificar. La URL y la clave del Apps Script son secretos del Worker (docs/CERTIFICADOS.md).
 */

interface Env {
  ASSETS: Fetcher;
  /** URL de la aplicación web del Apps Script (…/exec). */
  CERT_SCRIPT_URL?: string;
  /** Clave compartida con el Apps Script (propiedad CLAVE del script). */
  CERT_SCRIPT_KEY?: string;
}

const REPO = 'valedominguezl/isef-main';

/* ───────────────────────── Utilidades ───────────────────────── */

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

const error = (status: number, mensaje: string) => json({ error: mensaje }, status);

/** Contraseñas ya verificadas (token → vence): evita consultar a GitHub en cada pedido. */
const verificados = new Map<string, number>();

/** La "contraseña" del panel es un token de GitHub: tiene que poder escribir en el repositorio del sitio. */
/** 'limite' = GitHub frenó las consultas por un rato (no es la contraseña). */
async function autorizado(req: Request): Promise<'si' | 'no' | 'limite'> {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!token) return 'no';
  const vence = verificados.get(token);
  if (vence && vence > Date.now()) return 'si';
  const r = await fetch(`https://api.github.com/repos/${REPO}`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'user-agent': 'isef-sanluis-admin' },
  });
  if ((r.status === 403 || r.status === 429) && r.headers.get('x-ratelimit-remaining') === '0') return 'limite';
  if (!r.ok) return 'no';
  const repo = (await r.json()) as { permissions?: { push?: boolean } };
  if (!repo.permissions?.push) return 'no';
  verificados.set(token, Date.now() + 10 * 60_000);
  return 'si';
}

/* ───────────────────────── Fotos de stock ───────────────────────── */

interface Foto {
  miniatura: string;
  url: string;
  autor: string;
  fuente: string;
  enlace: string;
}

/** Openverse, solo imágenes de dominio público (CC0/PDM): uso libre, sin citar al autor. */
async function buscarFotos(q: string): Promise<Foto[]> {
  const r = await fetch(
    `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license=cc0,pdm&license_type=commercial&aspect_ratio=wide&page_size=12&mature=false`,
    { headers: { 'user-agent': 'isef-sanluis-admin (isefsanluis.net)' } },
  );
  if (!r.ok) return [];
  const d = (await r.json()) as { results: { thumbnail: string; url: string; creator?: string; source: string; foreign_landing_url: string }[] };
  return (d.results ?? [])
    .filter((p) => fotoPermitida(p.url)) // solo las que después se pueden bajar
    .map((p) => ({ miniatura: p.thumbnail, url: p.url, autor: p.creator ?? '', fuente: p.source, enlace: p.foreign_landing_url }));
}

/** Solo se descargan fotos de los bancos de imágenes (no es un proxy abierto). */
const HOSTS_FOTOS = /(^|\.)(pexels\.com|openverse\.org|stocksnap\.io|rawpixel\.com|wikimedia\.org|staticflickr\.com|flickr\.com|unsplash\.com)$/;

function fotoPermitida(url: string): boolean {
  if (!URL.canParse(url)) return false;
  const u = new URL(url);
  return u.protocol === 'https:' && HOSTS_FOTOS.test(u.hostname);
}

async function descargarFoto(url: string): Promise<Response> {
  if (!URL.canParse(url)) return error(400, 'URL inválida.');
  const u = new URL(url);
  if (!fotoPermitida(url)) return error(400, 'Esa foto no viene de un banco de imágenes permitido.');
  const r = await fetch(u.toString(), { headers: { 'user-agent': 'isef-sanluis-admin (isefsanluis.net)' } });
  const tipo = r.headers.get('content-type') ?? '';
  if (!r.ok || !tipo.startsWith('image/')) return error(502, 'No se pudo bajar la foto.');
  return new Response(r.body, { headers: { 'content-type': tipo, 'cache-control': 'no-store' } });
}

/* ───────────────────────── Certificados (Apps Script) ───────────────────────── */

type Accion = 'respuestas' | 'emitidos' | 'emitir' | 'verificar' | 'firma' | 'guardarFirma';

/** Reenvía el pedido al Apps Script con la clave (que nunca llega al navegador). */
async function script(env: Env, accion: Accion, datos: Record<string, unknown>): Promise<Response> {
  if (!env.CERT_SCRIPT_URL || !env.CERT_SCRIPT_KEY) return error(503, 'Falta conectar el Apps Script de certificados (ver docs/CERTIFICADOS.md).');
  // Apps Script responde con una redirección a script.googleusercontent.com: fetch la sigue sola
  const r = await fetch(env.CERT_SCRIPT_URL, {
    method: 'POST',
    headers: { 'content-type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...datos, accion, clave: env.CERT_SCRIPT_KEY }),
  });
  const texto = await r.text();
  let d: { error?: string } & Record<string, unknown>;
  try {
    d = JSON.parse(texto) as typeof d;
  } catch {
    return error(502, 'El Apps Script no respondió bien. Revisá que esté publicado como aplicación web.');
  }
  return d.error ? error(400, d.error) : json(d);
}

const FORM_ID = /^[\w-]{20,80}$/;

async function certificados(req: Request, url: URL, env: Env): Promise<Response> {
  const form = url.searchParams.get('form') ?? '';
  if (url.pathname === '/api/certificados/respuestas' && req.method === 'GET') {
    if (!FORM_ID.test(form)) return error(400, 'Formulario inválido.');
    return script(env, 'respuestas', { form });
  }
  if (url.pathname === '/api/certificados/emitidos' && req.method === 'GET') {
    if (!FORM_ID.test(form)) return error(400, 'Formulario inválido.');
    return script(env, 'emitidos', { form });
  }
  if (url.pathname === '/api/certificados/emitir' && req.method === 'POST') {
    const tam = Number(req.headers.get('content-length') ?? 0);
    if (tam > 5_000_000) return error(413, 'El certificado es demasiado grande.');
    const e = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!e || !FORM_ID.test(String(e.formulario ?? '')) || !/^ISEF-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(String(e.codigo ?? ''))) return error(400, 'Datos incompletos.');
    return script(env, 'emitir', { emision: e });
  }
  if (url.pathname === '/api/certificados/firma') {
    if (req.method === 'GET') return script(env, 'firma', {});
    if (req.method === 'POST') {
      const d = (await req.json().catch(() => null)) as { png?: unknown } | null;
      const png = d?.png ?? null;
      if (png !== null && (typeof png !== 'string' || png.length > 400_000 || !/^[A-Za-z0-9+/=]+$/.test(png))) return error(400, 'La imagen de la firma no es válida o es muy grande.');
      return script(env, 'guardarFirma', { png });
    }
  }
  return error(404, 'No existe.');
}

/* ───────────────────────── Rutas ───────────────────────── */

async function api(req: Request, url: URL, env: Env): Promise<Response> {
  // Verificación pública de un certificado (no pide contraseña; solo devuelve nombre, actividad y fecha)
  if (url.pathname === '/api/verificar' && req.method === 'GET') {
    const c = (url.searchParams.get('c') ?? '').trim().toUpperCase();
    if (!/^ISEF-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c)) return error(400, 'El código tiene la forma ISEF-XXXX-XXXX.');
    return script(env, 'verificar', { codigo: c });
  }

  const auth = await autorizado(req);
  if (auth === 'limite') return error(503, 'GitHub está limitando las consultas. Probá de nuevo en unos minutos.');
  if (auth === 'no') return error(401, 'Contraseña incorrecta o vencida.');

  if (url.pathname === '/api/fotos' && req.method === 'GET') {
    const q = url.searchParams.get('q')?.trim();
    if (!q) return error(400, 'Falta qué buscar.');
    return json({ fotos: await buscarFotos(q.slice(0, 80)) });
  }
  if (url.pathname === '/api/fotos/descargar' && req.method === 'GET') return descargarFoto(url.searchParams.get('url') ?? '');
  if (url.pathname.startsWith('/api/certificados/')) return certificados(req, url, env);

  return error(404, 'No existe.');
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      // Un error de red (GitHub, Openverse, Google) devuelve JSON claro, no la página de error de Cloudflare
      try {
        return await api(req, url, env);
      } catch {
        return error(502, 'No se pudo conectar con el servicio. Probá de nuevo en un rato.');
      }
    }
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
