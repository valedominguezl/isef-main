import { useState } from 'react';
import heroImg from '@/assets/media/noticias/main.webp';
import heroSm from '@/assets/media/noticias/main-800.webp';
import { novedades } from '@/content';
import { NOVEDAD_CATEGORIAS } from '@/content/constants';
import Seo, { breadcrumbJsonLd } from '@/components/seo/Seo';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import NewsCard from '@/components/cards/NewsCard';
import styles from './NovedadesPage.module.scss';

type Cat = keyof typeof NOVEDAD_CATEGORIAS;

export function Component() {
  const [cat, setCat] = useState<Cat | null>(null);
  const cats = (Object.keys(NOVEDAD_CATEGORIAS) as Cat[]).filter((c) => novedades.some((n) => n.categoria === c));
  const list = cat ? novedades.filter((n) => n.categoria === cat) : novedades;

  return (
    <>
      <Seo
        title="Novedades"
        description="Las últimas noticias del I.S.E.F. San Luis: nuevos cursos y especializaciones, eventos y anuncios institucionales."
        image={heroImg}
        jsonLd={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Novedades', path: '/novedades' },
        ])}
      />
      <PageHero imageSmall={heroSm}
        image={heroImg} title="Novedades" subtitle="Las últimas noticias del I.S.E.F." breadcrumbs={[{ name: 'Inicio', path: '/' }, { name: 'Novedades' }]} />
      <Section width="wide">
        {cats.length > 1 && (
          <div className={styles.chips} role="group" aria-label="Filtrar por categoría">
            <button type="button" aria-pressed={!cat} onClick={() => setCat(null)}>
              Todas
            </button>
            {cats.map((c) => (
              <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(cat === c ? null : c)}>
                {NOVEDAD_CATEGORIAS[c]}
              </button>
            ))}
          </div>
        )}
        <RevealGroup className={styles.grid} key={cat ?? 'all'}>
          {list.map((n, i) => (
            <RevealItem key={n.slug} className={i === 0 && !cat ? styles.first : undefined}>
              <NewsCard novedad={n} variant={i === 0 && !cat ? 'overlay' : 'plain'} headingLevel={2} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
    </>
  );
}
