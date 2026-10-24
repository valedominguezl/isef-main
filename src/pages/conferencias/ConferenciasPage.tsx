import { useMemo, useState } from 'react';
import { FileText, PlayCircle } from 'lucide-react';
import { conferencias } from '@/content';
import { normalize } from '@/lib/format';
import { Bloque, usePagina } from '@/features/vista-previa/vistaPrevia';
import Seo from '@/components/seo/Seo';
import SearchField from '@/components/ui/SearchField';
import { useDebounced } from '@/lib/useDebounced';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import CardGrid from '@/components/ui/CardGrid';
import styles from './ConferenciasPage.module.scss';

/** Grabaciones de conferencias para alumnos (URL no listada; noindex). */
export function Component() {
  /** Textos y foto editables desde /admin → Páginas → Conferencias. */
  const textos = usePagina('conferencias');
  const [q, setQ] = useState('');
  const query = useDebounced(q);
  const list = useMemo(() => {
    const n = normalize(query.trim());
    return conferencias.grabaciones.filter((g) => !n || normalize(`${g.titulo} ${g.enlaces.map((e) => e.nombre).join(' ')}`).includes(n));
  }, [query]);
  return (
    <>
      <Seo title="Conferencias" noindex />
      <Bloque id="hero">
        <PageHero image={textos.hero.imagen} title={textos.hero.titulo} subtitle={textos.hero.subtitulo} />
      </Bloque>
      <Section width="wide">
        <SearchField className={styles.search} value={q} onChange={setQ} pending={q !== query} label="Buscar conferencias" placeholder="Buscar conferencias…" />
        <p role="status" className="sr-only">
          {query ? `${list.length} grabación${list.length === 1 ? '' : 'es'}` : ''}
        </p>
        {/* key: cada búsqueda vuelve a montar la grilla y las tarjetas entran con la receta común de filtros */}
        <CardGrid key={query} className={q !== query ? styles.pending : undefined}>
          {list.map((g, i) => (
            <article key={g.titulo} className={styles.card} style={{ '--i': i } as React.CSSProperties}>
              <p className={styles.sub}>{g.subtitulo}</p>
              <h2>{g.titulo}</h2>
              <ul role="list">
                {g.enlaces.map((e) => (
                  <li key={e.url}>
                    <a href={e.url} target="_blank" rel="noopener noreferrer">
                      {/\.pdf$/i.test(e.url) ? <FileText size={16} aria-hidden /> : <PlayCircle size={16} aria-hidden />}
                      {e.nombre}
                      <span className="sr-only"> (se abre en otra pestaña)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
          {!list.length && <p>No se encontraron grabaciones.</p>}
        </CardGrid>
      </Section>
    </>
  );
}
