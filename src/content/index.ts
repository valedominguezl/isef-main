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

export type WithSlug<T> = T & { slug: string };

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

const byFeatured = (a: WithSlug<Curso>, b: WithSlug<Curso>) =>
  Number(b.destacado) - Number(a.destacado) ||
  Number(Boolean(b.etiqueta)) - Number(Boolean(a.etiqueta)) ||
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

export const getCurso = (slug: string) => cursos.find((c) => c.slug === slug);
export const getDisertante = (slug: string) => disertantes.find((d) => d.slug === slug);
export const getNovedad = (slug: string) => novedades.find((n) => n.slug === slug);
export const cursosDe = (disertante: string) => cursos.filter((c) => c.disertantes.includes(disertante));
export const nombreCompleto = (d: Pick<Disertante, 'titulo' | 'nombre'>) => [d.titulo, d.nombre].filter(Boolean).join(' ');
