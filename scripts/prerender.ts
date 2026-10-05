/**
 * Prerender estático (SSG): genera un .html por URL con el contenido ya renderizado,
 * metadatos SEO, CSS de la ruta y datos de hidratación. Además escribe sitemap.xml,
 * robots.txt, 404.html y search-index.json (índice del buscador).
 *
 * Producción: Cloudflare (Workers, estáticos) sirve /ruta → /ruta.html (reglas en public/_redirects y _headers).
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'node-html-parser';
import sharp, { type OverlayOptions } from 'sharp';
import type { SearchDoc } from '../src/features/search/types';

const DIST = path.resolve('dist');
const SSR = path.resolve('dist-ssr/entry-server.js');
const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
type Manifest = Record<string, { file: string; css?: string[]; imports?: string[]; dynamicImports?: string[]; isEntry?: boolean }>;
const manifest: Manifest = JSON.parse(fs.readFileSync(path.join(DIST, '.vite/manifest.json'), 'utf8'));

const mod = await import(pathToFileURL(SSR).href);
const { render, cursos, disertantes, novedades, sitio, aranceles, contentDocs } = mod;

/** Módulo de página de cada ruta (para precargar su JS y su CSS). */
const PAGE_MODULE: [RegExp, string][] = [
  [/^\/$/, 'src/pages/home/HomePage.tsx'],
  [/^\/carrera$/, 'src/pages/carrera/CarreraPage.tsx'],
  [/^\/especializaciones$/, 'src/pages/especializaciones/EspecializacionesPage.tsx'],
  [/^\/especializaciones\/.+/, 'src/pages/especializaciones/CursoPage.tsx'],
  [/^\/disertantes\/.+/, 'src/pages/disertantes/DisertantePage.tsx'],
  [/^\/novedades$/, 'src/pages/novedades/NovedadesPage.tsx'],
  [/^\/novedades\/.+/, 'src/pages/novedades/NovedadPage.tsx'],
  [/^\/inscripciones$/, 'src/pages/inscripciones/InscripcionesPage.tsx'],
  [/^\/contacto$/, 'src/pages/contacto/ContactoPage.tsx'],
  [/^\/aranceles$/, 'src/pages/aranceles/ArancelesPage.tsx'],
  [/^\/privacidad$/, 'src/pages/privacidad/PrivacidadPage.tsx'],
  [/^\/buscar$/, 'src/pages/buscar/BuscarPage.tsx'],
  [/^\/404$/, 'src/pages/NotFoundPage.tsx'],
];

function assetsFor(url: string) {
  const entry = PAGE_MODULE.find(([re]) => re.test(url))?.[1];
  const css = new Set<string>();
  const js = new Set<string>();
  const visit = (key: string, top: boolean) => {
    const chunk = manifest[key];
    if (!chunk || (chunk.isEntry && !top)) return;
    if (!top || entry) js.add(chunk.file);
    chunk.css?.forEach((c) => css.add(c));
    chunk.imports?.forEach((k) => visit(k, false));
  };
  if (entry) visit(entry, true);
  return {
    links: [...css].map((c) => `<link rel="stylesheet" href="/${c}">`).join('\n') + [...js].map((f) => `<link rel="modulepreload" href="/${f}">`).join('\n'),
  };
}

/** Fuentes críticas (subset latino) para precargar y evitar el salto de tipografía. */
const FONT_PRELOADS = fs
  .readdirSync(path.join(DIST, 'assets'))
  .filter((f) => /^(libre-franklin-latin-wght-normal|merriweather-latin-300-normal)-.*\.woff2$/.test(f))
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`)
  .join('\n');

/** Precarga la imagen principal (LCP) marcada con fetchpriority="high". */
function lcpPreload(html: string) {
  const m = html.match(/<img[^>]*fetchpriority="high"[^>]*>/);
  const src = m?.[0].match(/src="([^"]+)"/)?.[1];
  const srcset = m?.[0].match(/srcSet="([^"]+)"|srcset="([^"]+)"/);
  const set = srcset ? srcset[1] ?? srcset[2] : '';
  if (!src) return '';
  return set
    ? `<link rel="preload" as="image" imagesrcset="${set}" imagesizes="100vw" fetchpriority="high">`
    : `<link rel="preload" as="image" href="${src}" fetchpriority="high">`;
}

function fileFor(url: string) {
  if (url === '/') return path.join(DIST, 'index.html');
  return path.join(DIST, `${url.replace(/^\//, '')}.html`);
}

function write(file: string, html: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

async function page(url: string, out = fileFor(url)) {
  const { html, helmet } = await render(url);
  const head = [helmet.title, helmet.priority, helmet.meta, helmet.link, helmet.script].map((h: { toString(): string }) => h.toString()).join('\n') + '\n' + assetsFor(url).links + '\n' + FONT_PRELOADS + '\n' + lcpPreload(html);
  const doc = template
    .replace(/<html[^>]*>/, () => `<html ${helmet.htmlAttributes.toString() || 'lang="es-AR"'}>`)
    .replace('<!--app-head-->', () => head)
    .replace('<!--app-html-->', () => html);
  write(out, doc);
  return html as string;
}

function shell(url: string, title: string, out = fileFor(url)) {
  const doc = template
    .replace('<!--app-head-->', `<title>${title} | ${sitio.nombre}</title>\n<meta name="robots" content="noindex, nofollow">`)
    .replace('<div id="root"><!--app-html--></div>', '<div id="root" data-shell="1"></div>');
  write(out, doc);
}

// ── Rutas ─────────────────────────────────────────────────────────────
const staticRoutes = ['/', '/carrera', '/especializaciones', '/novedades', '/inscripciones', '/contacto', '/privacidad', ...(aranceles.visible ? ['/aranceles'] : [])];
const dynamicRoutes = [
  ...cursos.map((c: { slug: string }) => `/especializaciones/${c.slug}`),
  ...disertantes.map((d: { slug: string }) => `/disertantes/${d.slug}`),
  ...novedades.map((n: { slug: string }) => `/novedades/${n.slug}`),
];

const rendered: Record<string, string> = {};
for (const url of [...staticRoutes, ...dynamicRoutes]) rendered[url] = await page(url);
await page('/buscar');
await page('/404', path.join(DIST, '404.html'));
shell('/admin', 'Administración');
shell('/test-hiit', 'Test HIIT');
shell('/hijos.htm', 'Conferencias', path.join(DIST, 'hijos.htm'));

// ── Índice de búsqueda: contenido + secciones reales de cada página ─────
const docs: SearchDoc[] = contentDocs();
const PAGE_TITLES: Record<string, string> = {
  '/': 'Inicio',
  '/carrera': 'La carrera',
  '/especializaciones': 'Especializaciones',
  '/inscripciones': 'Inscripciones',
  '/contacto': 'Contacto',
  '/privacidad': 'Privacidad',
};
for (const url of Object.keys(PAGE_TITLES)) {
  const root = parse(rendered[url]);
  for (const sec of root.querySelectorAll('main section[id], main section[aria-labelledby]')) {
    const h = sec.querySelector('h2');
    if (!h) continue;
    const id = sec.getAttribute('id');
    if (id === 'faq') continue; // las preguntas se indexan una por una
    const text = sec.text.replace(h.text, '').replace(/\s+/g, ' ').trim();
    if (text.length < 40) continue;
    docs.push({
      id: `s-${url}-${id ?? h.text}`,
      type: 'seccion',
      title: h.text.replace(/\s+/g, ' ').trim(),
      url: id ? `${url === '/' ? '' : url}#${id}`.replace(/^#/, '/#') : url,
      context: PAGE_TITLES[url],
      text: text.slice(0, 1500),
    });
  }
}
fs.writeFileSync(path.join(DIST, 'search-index.json'), JSON.stringify(docs));

// ── Sitemap y robots ────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const prio = (u: string) => (u === '/' ? '1.0' : ['/carrera', '/inscripciones', '/especializaciones'].includes(u) ? '0.9' : u.split('/').length > 2 ? '0.7' : '0.6');
const lastmod = (u: string) => novedades.find((n: { slug: string; fecha: string }) => `/novedades/${n.slug}` === u)?.fecha ?? today;
const urls = [...staticRoutes, ...dynamicRoutes]
  .map((u) => `  <url><loc>${sitio.url}${u === '/' ? '/' : u}</loc><lastmod>${lastmod(u)}</lastmod><priority>${prio(u)}</priority></url>`)
  .join('\n');
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
fs.writeFileSync(
  path.join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /buscar\nDisallow: /hijos.htm\nDisallow: /test-hiit\n\nSitemap: ${sitio.url}/sitemap.xml\n`,
);

// ── Imágenes para compartir (Open Graph) con el título de cada página ───
const xml = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function wrap(text: string, max: number, lines = 3) {
  const out: string[] = [];
  let cur = '';
  for (const w of text.split(/\s+/)) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      out.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) out.push(cur);
  if (out.length > lines) out.splice(lines - 1, out.length, `${out.slice(lines - 1).join(' ').slice(0, max - 1)}…`);
  return out;
}
const logo = await sharp('src/assets/logo.webp').resize(96).png().toBuffer();
async function ogCard(out: string, base: string | undefined, eyebrow: string, title: string, portrait?: string) {
  const lines = wrap(title, portrait ? 18 : 26);
  const size = lines.length > 2 ? 64 : 76;
  const startY = 600 - 70 - (lines.length - 1) * size * 1.08;
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d0c12" stop-opacity=".9"/><stop offset="1" stop-color="#7761ff" stop-opacity=".65"/></linearGradient><linearGradient id="b" x1="0" x2="1"><stop offset="0" stop-color="#7761ff"/><stop offset="1" stop-color="#ff554e"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><rect y="618" width="1200" height="12" fill="url(#b)"/><text x="72" y="${startY - size - 12}" font-family="Arial, Helvetica, sans-serif" font-size="26" letter-spacing="4" fill="#ffffff" fill-opacity=".78">${xml(eyebrow.toUpperCase())}</text>${lines
    .map((l, i) => `<text x="72" y="${startY + i * size * 1.08}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="700" fill="#ffffff">${xml(l)}</text>`)
    .join('')}<text x="190" y="104" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="#ffffff">I.S.E.F. San Luis</text></svg>`;
  const bg = base && fs.existsSync(path.join('public', base)) ? sharp(path.join('public', base)).resize(1200, 630, { fit: 'cover' }) : sharp({ create: { width: 1200, height: 630, channels: 3, background: '#160c45' } });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const layers: OverlayOptions[] = [{ input: Buffer.from(svg) }, { input: logo, left: 72, top: 52 }];
  if (portrait && fs.existsSync(path.join('public', portrait))) {
    const d = 340;
    const mask = Buffer.from(`<svg width="${d}" height="${d}"><circle cx="${d / 2}" cy="${d / 2}" r="${d / 2}" fill="#fff"/></svg>`);
    const ring = Buffer.from(`<svg width="${d + 16}" height="${d + 16}"><circle cx="${(d + 16) / 2}" cy="${(d + 16) / 2}" r="${(d + 12) / 2}" fill="none" stroke="#ffffff" stroke-width="6"/></svg>`);
    const photo = await sharp(path.join('public', portrait)).resize(d, d, { fit: 'cover' }).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
    layers.push({ input: photo, left: 790, top: 140 }, { input: ring, left: 782, top: 132 });
  }
  await bg.composite(layers).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
}
const CAT: Record<string, string> = { novedad: 'Novedad', curso: 'Nuevo curso', evento: 'Evento', institucional: 'Institucional' };
for (const c of cursos) await ogCard(path.join(DIST, 'og/especializaciones', `${c.slug}.jpg`), c.imagen, 'Especialización', c.titulo);
for (const n of novedades) await ogCard(path.join(DIST, 'og/novedades', `${n.slug}.jpg`), n.imagen, CAT[n.categoria] ?? 'Novedad', n.titulo);
for (const d of disertantes) await ogCard(path.join(DIST, 'og/disertantes', `${d.slug}.jpg`), undefined, d.especialidad, [d.titulo, d.nombre].filter(Boolean).join(' '), d.foto);

// ── llms.txt: resumen del sitio para buscadores con IA ──────────────────
const llms = [
  `# ${sitio.nombreLargo}`,
  '',
  `> ${sitio.descripcion}`,
  '',
  `Profesorado de Educación Física presencial (4 años, título oficial con validez nacional) con sedes en ${sitio.sedes.map((s: { nombre: string; direccion: string }) => `${s.nombre} (${s.direccion})`).join(' y ')}. Contacto: WhatsApp +${sitio.whatsapp}, ${sitio.email}.`,
  '',
  '## Páginas principales',
  `- [La carrera y plan de estudios](${sitio.url}/carrera)`,
  `- [Inscripciones y requisitos](${sitio.url}/inscripciones)`,
  `- [Especializaciones](${sitio.url}/especializaciones)`,
  `- [Novedades](${sitio.url}/novedades)`,
  `- [Contacto y sedes](${sitio.url}/contacto)`,
  '',
  '## Especializaciones',
  ...cursos.map((c: { slug: string; titulo: string; subtitulo: string }) => `- [${c.titulo}](${sitio.url}/especializaciones/${c.slug}): ${c.subtitulo}`),
  '',
  '## Disertantes',
  ...disertantes.map((d: { slug: string; titulo: string; nombre: string; especialidad: string }) => `- [${[d.titulo, d.nombre].filter(Boolean).join(' ')}](${sitio.url}/disertantes/${d.slug}): ${d.especialidad}`),
  '',
];
fs.writeFileSync(path.join(DIST, 'llms.txt'), llms.join('\n'));

fs.rmSync(path.resolve('dist-ssr'), { recursive: true, force: true });
console.log(`✓ Prerender: ${Object.keys(rendered).length} páginas, ${docs.length} documentos en el buscador, sitemap, robots, llms.txt e imágenes para compartir.`);
