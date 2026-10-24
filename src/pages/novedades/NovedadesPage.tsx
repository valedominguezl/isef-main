import { useState } from 'react';
import heroImg from '@/assets/media/noticias/main.webp';
import heroSm from '@/assets/media/noticias/main-800.webp';
import { novedades } from '@/content';
import { NOVEDAD_CATEGORIAS } from '@/content/constants';
import { Bloque, usePagina } from '@/features/vista-previa/vistaPrevia';
import Seo, { breadcrumbJsonLd } from '@/components/seo/Seo';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import { RevealItem } from '@/components/ui/Reveal';
import ChipGroup from '@/components/ui/Chips';
import CardGrid from '@/components/ui/CardGrid';
import NewsCard from '@/components/cards/NewsCard';
import styles from './NovedadesPage.module.scss';

type Cat = keyof typeof NOVEDAD_CATEGORIAS;

export function Component() {
  /** Textos y fotos editables desde /admin → Páginas → Novedades. */
  const textos = usePagina('novedades');
  const [cat, setCat] = useState<Cat | null>(null);
  // Primera carga: entrada lenta al hacer scroll (Reveal). Después de tocar un filtro: la receta corta de resultados
  const [filtrado, setFiltrado] = useState(false);
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
      <Bloque id="hero">
      <PageHero
        imageSmall={textos.hero.imagen ? undefined : heroSm}
        image={textos.hero.imagen ?? heroImg}
        title={textos.hero.titulo}
        subtitle={textos.hero.subtitulo}
        breadcrumbs={[{ name: 'Inicio', path: '/' }, { name: 'Novedades' }]}
      />
      </Bloque>
      <Section width="narrow">
        {cats.length > 1 && (
          <ChipGroup
            label="Filtrar por categoría"
            className={styles.filters}
            value={cat}
            onChange={(c) => {
              setFiltrado(true);
              setCat(c);
            }}
            all={{ label: 'Todas' }}
            options={cats.map((c) => ({ value: c, label: NOVEDAD_CATEGORIAS[c] }))}
          />
        )}
        <p role="status" className="sr-only">
          {filtrado ? `${list.length} novedad${list.length === 1 ? '' : 'es'}` : ''}
        </p>
        {filtrado ? (
          <CardGrid key={cat ?? 'all'}>
            {list.map((n, i) => (
              <div key={n.slug} className={[styles.item, i === 0 && !cat && styles.first].filter(Boolean).join(' ')} style={{ '--i': i } as React.CSSProperties}>
                <NewsCard novedad={n} variant={i === 0 && !cat ? 'overlay' : 'plain'} headingLevel={2} />
              </div>
            ))}
          </CardGrid>
        ) : (
          <CardGrid reveal>
            {list.map((n, i) => (
              <RevealItem key={n.slug} className={i === 0 ? styles.first : undefined}>
                <NewsCard novedad={n} variant={i === 0 ? 'overlay' : 'plain'} headingLevel={2} />
              </RevealItem>
            ))}
          </CardGrid>
        )}
      </Section>
    </>
  );
}
