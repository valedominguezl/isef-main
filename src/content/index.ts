/**
 * Acceso tipado al contenido. Los JSON se importan en build (sin pedidos de red) y se
 * validan con `npm run content:check`, por eso acá solo se tipan (zod no entra al bundle público).
 */
import type { Aranceles, Conferencias, Curso, Cv, Disertante, Faq, Galeria, Inscripciones, Novedad, Plan, Sitio } from './schema';
import sitioJson from '@content/sitio.json';
import faqJson from '@content/faq.json';
import planJson from '@content/plan.json';
import inscripcionesJson from '@content/inscripciones.json';
import arancelesJson from '@content/aranceles.json';
import conferenciasJson from '@content/conferencias.json';
import galeriaJson from '@content/galeria.json';
import { resolverPagina, type PaginaResuelta } from './paginas';
import type { PaginaKey } from './schema';

export type WithSlug<T> = T & { slug: string };

/** "Hoy" a efectos del sitio: la fecha del build (se reconstruye todas las semanas). */
export const TODAY: string = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : new Date(Date.now() - 3 * 36e5).toISOString().slice(0, 10);

const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);

const slugOf = (path: string) => path.split('/').pop()!.replace(/\.json$/, '');

function collection<T>(modules: Record<string, unknown>): WithSlug<T>[] {
  return Object.entries(modules).map(([path, data]) => ({ ...(data as T), slug: slugOf(path) }));
}

export const sitio = sitioJson as Sitio;
export const faq = faqJson as Faq;
export const plan = planJson as Plan;
export const inscripciones = inscripcionesJson as Inscripciones;
export const aranceles = arancelesJson as Aranceles;
export const conferencias = conferenciasJson as Conferencias;
export const galeria = galeriaJson as Galeria;

/** Textos y fotos de cada página (content/paginas/*.json, editables en /admin → Páginas). */
const paginasJson = import.meta.glob('/content/paginas/*.json', { eager: true, import: 'default' });
const pagina = <K extends PaginaKey>(k: K) => resolverPagina(k, paginasJson[`/content/paginas/${k}.json`]);
export const paginas: { [K in PaginaKey]: PaginaResuelta<K> } = {
  inicio: pagina('inicio'),
  carrera: pagina('carrera'),
  especializaciones: pagina('especializaciones'),
  inscripciones: pagina('inscripciones'),
  novedades: pagina('novedades'),
  contacto: pagina('contacto'),
  aranceles: pagina('aranceles'),
  conferencias: pagina('conferencias'),
};

/** Inscripciones abiertas hoy: el interruptor del panel + la ventana inicio/cierre (si están cargadas). */
export const inscripcionesVigentes = (hoy: string = TODAY) => {
  const { abiertas, inicio, cierre } = sitio.inscripciones;
  return abiertas && (!inicio || hoy >= inicio) && (!cierre || hoy <= cierre);
};

/** Próximo: tiene fecha de inicio hoy o más adelante. */
export const esProximo = (c: Pick<Curso, 'fechaInicio'>) => Boolean(c.fechaInicio && c.fechaInicio >= TODAY);
/** Ya comenzó: tenía fecha y pasó. */
export const yaComenzo = (c: Pick<Curso, 'fechaInicio'>) => Boolean(c.fechaInicio && c.fechaInicio < TODAY);
const MESES_NUEVO = 6;
/** Fecha ISO + n meses (en UTC, sin corrimientos por zona horaria). */
const sumarMeses = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
};
/** «¡Nuevo!» durante 6 meses desde que se publicó (`creado`; si falta, la fecha de inicio). */
export const esNuevo = (c: Pick<Curso, 'creado' | 'fechaInicio'>) => {
  const desde = c.creado ?? c.fechaInicio;
  return Boolean(desde && TODAY < sumarMeses(desde, MESES_NUEVO));
};
/** "¡Nuevo!" es automático (ver esNuevo). "Destacado" se marca a mano en el panel. */
export const etiquetasCurso = (c: Pick<Curso, 'creado' | 'fechaInicio' | 'destacado'>) =>
  [c.destacado && { texto: 'Destacado', tono: 'brand' as const }, esNuevo(c) && { texto: '¡Nuevo!', tono: 'white' as const }].filter(
    (x): x is { texto: string; tono: 'brand' | 'white' } => Boolean(x),
  );

const byFeatured = (a: WithSlug<Curso>, b: WithSlug<Curso>) =>
  Number(b.esteAnio === true) - Number(a.esteAnio === true) ||
  Number(esProximo(b)) - Number(esProximo(a)) ||
  (esProximo(a) && esProximo(b) ? a.fechaInicio!.localeCompare(b.fechaInicio!) : 0) ||
  Number(esNuevo(b)) - Number(esNuevo(a)) ||
  Number(yaComenzo(a)) - Number(yaComenzo(b)) ||
  Number(b.destacado) - Number(a.destacado) ||
  (b.fechaInicio ?? '').localeCompare(a.fechaInicio ?? '') ||
  a.titulo.localeCompare(b.titulo, 'es');

export const cursos = collection<Curso>(
  import.meta.glob('/content/cursos/*.json', { eager: true, import: 'default' }),
)
  .filter((c) => c.publicado !== false)
  .sort(byFeatured);

export const disertantes = collection<Disertante>(
  import.meta.glob('/content/disertantes/*.json', { eager: true, import: 'default' }),
)
  .filter((d) => d.publicado !== false)
  .sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99));

export const novedades = collection<Novedad>(
  import.meta.glob('/content/novedades/*.json', { eager: true, import: 'default' }),
)
  .filter((n) => n.publicado !== false)
  .sort((a, b) => Number(b.destacado) - Number(a.destacado) || b.fecha.localeCompare(a.fecha));

/** Los CV se cargan bajo demanda (cada uno en su propio chunk). */
const cvLoaders = import.meta.glob<Cv>('/content/cv/*.json', { import: 'default' });
export async function loadCv(slug: string): Promise<Cv | null> {
  const loader = cvLoaders[`/content/cv/${slug}.json`];
  return loader ? loader() : null;
}

/** Novedades recientes (últimos 90 días) para la home; si no hay, la sección no se muestra. */
export const novedadesRecientes = () => novedades.filter((n) => daysBetween(n.fecha, TODAY) <= 90);

export const getCurso = (slug: string) => cursos.find((c) => c.slug === slug);
export const getDisertante = (slug: string) => disertantes.find((d) => d.slug === slug);
export const getNovedad = (slug: string) => novedades.find((n) => n.slug === slug);
export const cursosDe = (disertante: string) => cursos.filter((c) => c.disertantes.includes(disertante));
export const nombreCompleto = (d: Pick<Disertante, 'titulo' | 'nombre'>) => [d.titulo, d.nombre].filter(Boolean).join(' ');
