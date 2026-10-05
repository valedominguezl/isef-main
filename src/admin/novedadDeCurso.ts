import { excerpt } from '@/lib/markdown';

type Obj = Record<string, unknown>;

/** Fecha de hoy en Argentina (UTC-3), AAAA-MM-DD. */
const hoy = () => new Date(Date.now() - 3 * 36e5).toISOString().slice(0, 10);

/**
 * Novedad automática de un curso nuevo: se crea junto con el curso, queda vinculada a él
 * (visible / activo / destacado salen del curso) y se puede editar o borrar desde Novedades.
 */
export function novedadDeCurso(slug: string, curso: Obj): Obj {
  const subtitulo = String(curso.subtitulo ?? '').trim();
  // El comienzo de la descripción; si no hay, el subtítulo (juntos suelen repetirse)
  const resumen = excerpt(String(curso.descripcion ?? ''), 240) || subtitulo;
  return {
    titulo: String(curso.titulo ?? ''),
    fecha: hoy(),
    categoria: 'curso',
    resumen: resumen.length >= 10 ? resumen : `Nuevo curso: ${String(curso.titulo ?? '')}.`,
    ...(curso.imagen ? { imagen: curso.imagen } : {}),
    curso: slug,
  };
}
