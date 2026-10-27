import { track } from '@/lib/analytics';

let ultima = { termino: '', at: 0 };

/**
 * Una búsqueda cuenta una vez: si se escribió en la lupa y después se tocó Enter, /buscar no la repite
 * (mismo término en los últimos 30 s). `resultados: 0` = algo que buscan y el sitio no tiene.
 */
export function trackSearch(termino: string, resultados: number) {
  const clave = termino.trim().toLowerCase();
  const ahora = Date.now();
  if (clave === ultima.termino && ahora - ultima.at < 30_000) return;
  ultima = { termino: clave, at: ahora };
  track('search', { search_term: termino.trim(), resultados });
}
