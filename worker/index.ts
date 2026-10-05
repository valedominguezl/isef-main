/**
 * Worker del sitio: sirve los archivos estáticos (dist/) y, solo bajo /api/*, las funciones del panel:
 *   POST /api/ia/curso   { texto }        → borrador de curso (campos del sitio) armado con Claude
 *   POST /api/ia/cv      { texto }        → currículum normalizado (secciones del sitio) armado con Claude
 *   GET  /api/fotos?q=…                   → fotos de stock gratuitas (Pexels si hay clave; si no, Openverse CC0)
 *   GET  /api/fotos/descargar?url=…       → baja una foto elegida (solo de esos bancos) para procesarla en el panel
 * Todo exige la contraseña del panel (token de GitHub con permiso de escritura en el repositorio).
 * Secretos (Cloudflare → Workers → isef-sanluis → Settings → Variables and secrets):
 *   ANTHROPIC_API_KEY (obligatorio para /api/ia/*) · PEXELS_API_KEY (opcional, mejores fotos)
 */
import Anthropic from '@anthropic-ai/sdk';

interface Env {
  ASSETS: Fetcher;
  ANTHROPIC_API_KEY?: string;
  PEXELS_API_KEY?: string;
}

const REPO = 'valedominguezl/isef-main';
const MODEL = 'claude-opus-5-5';
const MAX_TEXTO = 60_000; // ~15k tokens: un CV largo entra completo; más que eso es un error de carga

/* ───────────────────────── Esquemas de salida (structured outputs) ───────────────────────── */

const CURSO_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['titulo', 'subtitulo', 'descripcion', 'modalidad', 'duracion', 'costo', 'fechaInicio', 'condiciones', 'importante', 'temario', 'busquedaFoto'],
  properties: {
    titulo: { type: 'string', description: 'Título corto (máx. 70 caracteres), sin comillas.' },
    subtitulo: { type: 'string', description: 'Bajada de una línea (máx. 100 caracteres).' },
    descripcion: {
      type: 'string',
      description: 'Descripción en Markdown simple: párrafos, **negrita** y listas con "- ". Sin títulos (#), sin cursiva, sin enlaces.',
    },
    modalidad: { type: 'string', description: 'Ej.: "Online por Zoom", "Presencial en la sede principal". Vacío si no se dice.' },
    duracion: { type: 'string', description: 'Encuentros, días y horario. Vacío si no se dice.' },
    costo: { type: 'string', description: 'Vacío si no se dice.' },
    fechaInicio: { type: 'string', description: 'AAAA-MM-DD si el texto da una fecha de inicio concreta; si no, vacío.' },
    condiciones: { type: 'string', description: 'Condiciones de aprobación (Markdown simple). Vacío si no se dicen.' },
    importante: { type: 'string', description: 'Aviso importante. Vacío si no hay.' },
    temario: {
      type: 'array',
      description: 'Módulos del curso. Si el texto no trae temario, armalo con los objetivos o ejes que menciona, sin inventar contenidos nuevos.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['tema', 'subtemas'],
        properties: { tema: { type: 'string' }, subtemas: { type: 'array', items: { type: 'string' } } },
      },
    },
    busquedaFoto: { type: 'string', description: '2 a 4 palabras en inglés para buscar una foto de stock que represente el curso (p. ej. "personal trainer outdoor").' },
  },
} as const;

const SECCIONES = ['formacion', 'docencia', 'experiencia', 'gestion', 'investigacion', 'eventos', 'distinciones', 'comunidad', 'capacitacion', 'idiomas', 'otros'];

const CV_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['resumen', 'secciones'],
  properties: {
    resumen: { type: 'string', description: 'Dos o tres oraciones en tercera persona sobre su perfil profesional. Vacío si el CV no da para eso.' },
    secciones: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['tipo', 'items'],
        properties: {
          tipo: { type: 'string', enum: SECCIONES },
          items: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['periodo', 'titulo', 'institucion', 'detalle'],
              properties: {
                periodo: { type: 'string', description: 'Año o rango ("2015", "2018–2022", "2020–actualidad"). Vacío si no hay.' },
                titulo: { type: 'string', description: 'Cargo, título, curso, publicación o premio.' },
                institucion: { type: 'string', description: 'Institución, revista o lugar. Vacío si no hay.' },
                detalle: { type: 'string', description: 'Aclaración breve. Vacío si no hace falta.' },
              },
            },
          },
        },
      },
    },
  },
} as const;

const SISTEMA_CURSO = `Cargás cursos en el sitio del I.S.E.F. San Luis, un profesorado de Educación Física de Argentina.
Recibís el texto de un curso (como lo mandaría el instituto por WhatsApp o mail) y devolvés sus campos para el sitio.
- Español rioplatense, claro y profesional; corregí ortografía y mayúsculas innecesarias.
- No inventes datos: si algo no está en el texto (fecha, horario, costo, modalidad), dejalo vacío.
- No repitas en la descripción lo que ya va en otros campos (temario, condiciones, teléfono de inscripción).
- Las negritas, pocas y en las ideas clave.`;

const SISTEMA_CV = `Normalizás currículums de disertantes para el sitio del I.S.E.F. San Luis (profesorado de Educación Física, Argentina).
Recibís el texto extraído de un PDF (puede venir desordenado) y lo repartís en las secciones del sitio:
formacion (títulos y estudios), docencia, experiencia (profesional), gestion (cargos directivos), investigacion (proyectos y publicaciones), eventos (congresos, conferencias, disertaciones), distinciones (premios, becas), comunidad (extensión, voluntariado), capacitacion (cursos y perfeccionamiento), idiomas, otros.
- NUNCA incluyas datos personales: DNI, CUIL, domicilio, teléfono, mail, fecha o lugar de nacimiento, edad, estado civil, nacionalidad, fotos.
- No inventes nada; conservá nombres propios, instituciones y años tal como figuran.
- Ordená cada sección de lo más reciente a lo más antiguo. Omití secciones vacías.
- Una entrada por ítem; si una línea mezcla varios ítems, separalos.`;

/* ───────────────────────── Utilidades ───────────────────────── */

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

const error = (status: number, mensaje: string) => json({ error: mensaje }, status);

/** Contraseñas ya verificadas (token → vence): evita consultar a GitHub en cada pedido. */
const verificados = new Map<string, number>();

/** La "contraseña" del panel es un token de GitHub: tiene que poder escribir en el repositorio del sitio. */
async function autorizado(req: Request): Promise<boolean> {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;
  const vence = verificados.get(token);
  if (vence && vence > Date.now()) return true;
  const r = await fetch(`https://api.github.com/repos/${REPO}`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'user-agent': 'isef-sanluis-admin' },
  });
  if (!r.ok) return false;
  const repo = (await r.json()) as { permissions?: { push?: boolean } };
  if (!repo.permissions?.push) return false;
  verificados.set(token, Date.now() + 10 * 60_000);
  return true;
}

/** Una llamada a Claude con salida JSON garantizada por el esquema. */
async function estructurar(env: Env, sistema: string, texto: string, schema: object): Promise<unknown> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    // Si un filtro de seguridad declina (falso positivo), el pedido se reintenta solo en otro modelo
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema } },
    system: sistema,
    messages: [{ role: 'user', content: texto }],
  } as unknown as Anthropic.Beta.MessageCreateParamsNonStreaming);
  if (response.stop_reason === 'refusal') throw new Error('Claude no pudo procesar este texto.');
  if (response.stop_reason === 'max_tokens') throw new Error('El texto es demasiado largo para procesarlo de una vez.');
  const bloque = response.content.find((b) => b.type === 'text');
  if (!bloque || bloque.type !== 'text') throw new Error('Respuesta vacía.');
  return JSON.parse(bloque.text);
}

/* ───────────────────────── Fotos de stock ───────────────────────── */

interface Foto {
  miniatura: string;
  url: string;
  autor: string;
  fuente: string;
  enlace: string;
}

async function buscarFotos(env: Env, q: string): Promise<Foto[]> {
  if (env.PEXELS_API_KEY) {
    const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&orientation=landscape&per_page=12`, {
      headers: { authorization: env.PEXELS_API_KEY },
    });
    if (r.ok) {
      const d = (await r.json()) as { photos: { src: { medium: string; large2x: string }; photographer: string; url: string }[] };
      return d.photos.map((p) => ({ miniatura: p.src.medium, url: p.src.large2x, autor: p.photographer, fuente: 'Pexels', enlace: p.url }));
    }
  }
  // Sin clave de Pexels: Openverse, solo imágenes de dominio público (CC0/PDM: no hace falta citar al autor)
  const r = await fetch(
    `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license=cc0,pdm&license_type=commercial&aspect_ratio=wide&page_size=12&mature=false`,
    { headers: { 'user-agent': 'isef-sanluis-admin (isefsanluis.net)' } },
  );
  if (!r.ok) return [];
  const d = (await r.json()) as { results: { thumbnail: string; url: string; creator?: string; source: string; foreign_landing_url: string }[] };
  return d.results.map((p) => ({ miniatura: p.thumbnail, url: p.url, autor: p.creator ?? '', fuente: p.source, enlace: p.foreign_landing_url }));
}

/** Solo se descargan fotos de los bancos de imágenes (no es un proxy abierto). */
const HOSTS_FOTOS = /(^|\.)(pexels\.com|openverse\.org|stocksnap\.io|rawpixel\.com|wikimedia\.org|staticflickr\.com|flickr\.com|unsplash\.com)$/;

async function descargarFoto(url: string): Promise<Response> {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return error(400, 'URL inválida.');
  }
  if (u.protocol !== 'https:' || !HOSTS_FOTOS.test(u.hostname)) return error(400, 'Esa foto no viene de un banco de imágenes permitido.');
  const r = await fetch(u.toString(), { headers: { 'user-agent': 'isef-sanluis-admin (isefsanluis.net)' } });
  const tipo = r.headers.get('content-type') ?? '';
  if (!r.ok || !tipo.startsWith('image/')) return error(502, 'No se pudo bajar la foto.');
  return new Response(r.body, { headers: { 'content-type': tipo, 'cache-control': 'no-store' } });
}

/* ───────────────────────── Rutas ───────────────────────── */

async function api(req: Request, env: Env, url: URL): Promise<Response> {
  if (!(await autorizado(req))) return error(401, 'Contraseña incorrecta o vencida.');

  if (url.pathname === '/api/fotos' && req.method === 'GET') {
    const q = url.searchParams.get('q')?.trim();
    if (!q) return error(400, 'Falta qué buscar.');
    return json({ fotos: await buscarFotos(env, q.slice(0, 80)) });
  }
  if (url.pathname === '/api/fotos/descargar' && req.method === 'GET') return descargarFoto(url.searchParams.get('url') ?? '');

  if ((url.pathname === '/api/ia/curso' || url.pathname === '/api/ia/cv') && req.method === 'POST') {
    if (!env.ANTHROPIC_API_KEY) return error(503, 'La IA todavía no está configurada (falta la clave en Cloudflare).');
    const { texto } = (await req.json().catch(() => ({}))) as { texto?: string };
    if (!texto?.trim()) return error(400, 'Pegá el texto.');
    if (texto.length > MAX_TEXTO) return error(413, 'El texto es demasiado largo.');
    try {
      const esCurso = url.pathname.endsWith('/curso');
      const datos = await estructurar(env, esCurso ? SISTEMA_CURSO : SISTEMA_CV, texto, esCurso ? CURSO_SCHEMA : CV_SCHEMA);
      return json(datos);
    } catch (e) {
      if (e instanceof Anthropic.RateLimitError) return error(429, 'Demasiados pedidos seguidos: probá en un minuto.');
      if (e instanceof Anthropic.AuthenticationError) return error(503, 'La clave de la IA no es válida.');
      if (e instanceof Anthropic.APIError) return error(502, 'La IA no respondió. Probá de nuevo.');
      return error(502, (e as Error).message);
    }
  }
  return error(404, 'No existe.');
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) return api(req, env, url);
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
