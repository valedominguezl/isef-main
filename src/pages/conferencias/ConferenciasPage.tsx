import { useMemo, useState } from 'react';
import { FileText, PlayCircle, Search } from 'lucide-react';
import { conferencias } from '@/content';
import { normalize } from '@/lib/format';
import Seo from '@/components/seo/Seo';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import styles from './ConferenciasPage.module.scss';

/** Grabaciones de conferencias para alumnos (URL no listada; noindex). */
export function Component() {
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const n = normalize(q.trim());
    return conferencias.grabaciones.filter((g) => !n || normalize(`${g.titulo} ${g.enlaces.map((e) => e.nombre).join(' ')}`).includes(n));
  }, [q]);
  return (
    <>
      <Seo title="Conferencias" noindex />
      <PageHero title="Conferencias" subtitle="Accedé a las grabaciones desde un solo lugar" />
      <Section width="wide">
        <label className={styles.search}>
          <Search size={18} aria-hidden />
          <span className="sr-only">Buscar conferencias</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar conferencias…" />
        </label>
        <div className={styles.grid}>
          {list.map((g) => (
            <article key={g.titulo} className={styles.card}>
              <p className={styles.sub}>{g.subtitulo}</p>
              <h2>{g.titulo}</h2>
              <ul role="list">
                {g.enlaces.map((e) => (
                  <li key={e.url}>
                    <a href={e.url} target="_blank" rel="noopener noreferrer">
                      {/\.pdf$/i.test(e.url) ? <FileText size={16} aria-hidden /> : <PlayCircle size={16} aria-hidden />}
                      {e.nombre}
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
          {!list.length && <p>No se encontraron grabaciones.</p>}
        </div>
      </Section>
    </>
  );
}
