/**
 * Prerender estático (SSG): genera un .html por URL con el contenido ya renderizado,
 * metadatos SEO, CSS de la ruta y datos de hidratación. Además escribe sitemap.xml,
 * robots.txt, 404.html y search-index.json (índice del buscador).
 *
 * Producción: Apache sirve /ruta → /ruta.html (ver public/.htaccess).
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'node-html-parser';
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

fs.rmSync(path.resolve('dist-ssr'), { recursive: true, force: true });
console.log(`✓ Prerender: ${Object.keys(rendered).length} páginas, ${docs.length} documentos en el buscador, sitemap y robots.`);
