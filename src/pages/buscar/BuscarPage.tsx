import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { search, snippet, type Hit } from '@/features/search/engine';
import Highlight from '@/features/search/Highlight';
import { TYPE_LABELS, TYPE_ORDER, type SearchType } from '@/features/search/types';
import { track } from '@/lib/analytics';
import Seo from '@/components/seo/Seo';
import Section from '@/components/ui/Section';
import ChipGroup from '@/components/ui/Chips';
import styles from './BuscarPage.module.scss';

export function Component() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [input, setInput] = useState(q);
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [type, setType] = useState<SearchType | null>(null);

  useEffect(() => {
    setInput(q);
    setType(null);
    let cancel = false;
    search(q).then((r) => {
      if (!cancel) setHits(r);
    });
    if (q) track('search', { search_term: q });
    return () => {
      cancel = true;
    };
  }, [q]);

  const terms = useMemo(() => q.split(/\s+/).filter(Boolean), [q]);
  const counts = useMemo(() => {
    const c = new Map<SearchType, number>();
    hits?.forEach((h) => c.set(h.type, (c.get(h.type) ?? 0) + 1));
    return c;
  }, [hits]);
  const list = (hits ?? []).filter((h) => !type || h.type === type);

  return (
    <>
      <Seo title={q ? `Resultados para “${q}”` : 'Buscar'} noindex />
      <Section width="default" className={styles.page}>
        <form
          role="search"
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            setParams(input.trim() ? { q: input.trim() } : {});
          }}
        >
          <h1 className={styles.title}>Buscar en el sitio</h1>
          <div className={styles.bar}>
            <Search size={22} aria-hidden />
            <input type="search" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Carreras, cursos, horarios, requisitos…" aria-label="Términos de búsqueda" />
            <button type="submit">Buscar</button>
          </div>
        </form>

        {q && hits && (
          <>
            <p className={styles.summary} aria-live="polite">
              {hits.length ? (
                <>
                  {hits.length} resultado{hits.length === 1 ? '' : 's'} para <strong>“{q}”</strong>
                </>
              ) : (
                <>
                  No hay resultados para <strong>“{q}”</strong>. Revisá la ortografía o probá con términos más generales.
                </>
              )}
            </p>
            {hits.length > 0 && (
              <ChipGroup
                label="Filtrar resultados"
                className={styles.tabs}
                value={type}
                onChange={setType}
                all={{ label: 'Todo', count: hits.length }}
                options={TYPE_ORDER.filter((t) => counts.get(t)).map((t) => ({ value: t, label: TYPE_LABELS[t], count: counts.get(t) }))}
              />
            )}
            <ol className={styles.results} role="list">
              {list.map((h) => {
                const external = /^https?:/.test(h.url);
                const Title = <Highlight text={h.title} terms={terms} />;
                return (
                  <li key={h.id}>
                    <p className={styles.meta}>
                      <span>{TYPE_LABELS[h.type]}</span>
                      {h.context && <> · {h.context}</>}
                    </p>
                    <h2 className={styles.hitTitle}>
                      {external ? (
                        <a href={h.url} target="_blank" rel="noopener noreferrer">
                          {Title}
                        </a>
                      ) : (
                        <Link to={h.url}>{Title}</Link>
                      )}
                    </h2>
                    <p className={styles.url}>isefsanluis.net{h.url.startsWith('/') ? h.url : ''}</p>
                    {h.text && (
                      <p className={styles.snippet}>
                        <Highlight text={snippet(h.text, terms, 140)} terms={terms} />
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </Section>
    </>
  );
}
