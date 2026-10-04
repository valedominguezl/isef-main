import MiniSearch, { type SearchResult } from 'minisearch';
import { normalize } from '@/lib/format';
import type { SearchDoc } from './types';

export type Hit = SearchResult & SearchDoc;

let indexPromise: Promise<MiniSearch<SearchDoc>> | null = null;

const STOP = new Set(['de', 'la', 'el', 'en', 'y', 'a', 'los', 'las', 'del', 'un', 'una', 'que', 'por', 'con', 'para', 'al', 'se', 'es', 'como', 'o']);

async function fetchDocs(): Promise<SearchDoc[]> {
  try {
    const res = await fetch('/search-index.json', { cache: 'force-cache' });
    if (res.ok) return (await res.json()) as SearchDoc[];
  } catch {
    /* en dev el archivo no existe: se arma desde el contenido */
  }
  const { contentDocs } = await import('./buildDocs');
  return contentDocs();
}

/** Carga perezosa del índice (solo cuando alguien abre el buscador). */
export function loadIndex() {
  indexPromise ??= fetchDocs().then((docs) => {
    const ms = new MiniSearch<SearchDoc>({
      fields: ['title', 'keywords', 'context', 'text'],
      storeFields: ['type', 'title', 'url', 'context', 'text'],
      processTerm: (t) => {
        const n = normalize(t);
        return STOP.has(n) ? null : n;
      },
      searchOptions: { boost: { title: 4, keywords: 2.5, context: 1.5 }, prefix: true, fuzzy: 0.2, combineWith: 'AND' },
    });
    ms.addAll(docs);
    return ms;
  });
  return indexPromise;
}

export async function search(query: string): Promise<Hit[]> {
  const q = query.trim();
  if (!q) return [];
  const ms = await loadIndex();
  let hits = ms.search(q) as Hit[];
  if (!hits.length) hits = ms.search(q, { combineWith: 'OR' }) as Hit[];
  // Deduplicar por URL (una sección y su página pueden coincidir)
  const seen = new Set<string>();
  return hits.filter((h) => (seen.has(h.url + h.title) ? false : (seen.add(h.url + h.title), true)));
}

/** Fragmento del texto alrededor del primer término encontrado. */
export function snippet(text: string, terms: string[], radius = 90): string {
  if (!text) return '';
  const nt = normalize(text);
  let pos = -1;
  for (const t of terms) {
    const p = nt.indexOf(normalize(t));
    if (p >= 0 && (pos < 0 || p < pos)) pos = p;
  }
  if (pos < 0) return text.slice(0, radius * 2) + (text.length > radius * 2 ? '…' : '');
  const start = Math.max(0, pos - radius);
  const end = Math.min(text.length, pos + radius);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
}
