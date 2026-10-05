import { useState } from 'react';
import heroImg from '@/assets/media/noticias/main.webp';
import heroSm from '@/assets/media/noticias/main-800.webp';
import { novedades, paginas } from '@/content';
import { NOVEDAD_CATEGORIAS } from '@/content/constants';
import Seo, { breadcrumbJsonLd } from '@/components/seo/Seo';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import { RevealItem } from '@/components/ui/Reveal';
import ChipGroup from '@/components/ui/Chips';
import CardGrid from '@/components/ui/CardGrid';
import NewsCard from '@/components/cards/NewsCard';
import styles from './NovedadesPage.module.scss';

type Cat = keyof typeof NOVEDAD_CATEGORIAS;

/** Textos y fotos editables desde /admin → Páginas → Novedades. */
const textos = paginas.novedades;

export function Component() {
  const [cat, setCat] = useState<Cat | null>(null);
  const cats = (Object.keys(NOVEDAD_CATEGORIAS) as Cat[]).filter((c) => novedades.some((n) => n.categoria === c));
  const list = cat ? novedades.filter((n) => n.categoria === cat) : novedades;

  return (
    <>
      <Seo
        title="Novedades"
        description="Las últimas noticias del I.S.E.F. San Luis: nuevos cursos y especializaciones, eventos y anuncios institucionales."
        image={textos.hero.imagen ?? heroImg}
        jsonLd={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Novedades', path: '/novedades' },
        ])}
      />
      <PageHero
        imageSmall={textos.hero.imagen ? undefined : heroSm}
        image={textos.hero.imagen ?? heroImg}
        title={textos.hero.titulo}
        subtitle={textos.hero.subtitulo}
        breadcrumbs={[{ name: 'Inicio', path: '/' }, { name: 'Novedades' }]}
      />
      <Section width="narrow">
        {cats.length > 1 && (
          <ChipGroup
            label="Filtrar por categoría"
            className={styles.filters}
            value={cat}
            onChange={setCat}
            all={{ label: 'Todas' }}
            options={cats.map((c) => ({ value: c, label: NOVEDAD_CATEGORIAS[c] }))}
          />
        )}
        <CardGrid reveal key={cat ?? 'all'}>
          {list.map((n, i) => (
            <RevealItem key={n.slug} className={i === 0 && !cat ? styles.first : undefined}>
              <NewsCard novedad={n} variant={i === 0 && !cat ? 'overlay' : 'plain'} headingLevel={2} />
            </RevealItem>
          ))}
        </CardGrid>
      </Section>
    </>
  );
}
