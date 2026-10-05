import { useParams } from 'react-router';
import { getCurso, getNovedad, novedades, sitio } from '@/content';
import { NOVEDAD_CATEGORIAS } from '@/content/constants';
import { formatDate } from '@/lib/format';
import Seo, { absoluteUrl, breadcrumbJsonLd } from '@/components/seo/Seo';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import Prose from '@/components/ui/Prose';
import Button from '@/components/ui/Button';
import Reveal, { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import NewsCard from '@/components/cards/NewsCard';
import CourseCard from '@/components/cards/CourseCard';
import { Component as NotFound } from '../NotFoundPage';
import styles from './NovedadPage.module.scss';

export function Component() {
  const { slug = '' } = useParams();
  const n = getNovedad(slug);
  if (!n) return <NotFound />;
  const curso = n.curso ? getCurso(n.curso) : undefined;
  const otras = novedades.filter((x) => x.slug !== slug).slice(0, 3);

  return (
    <>
      <Seo
        title={`${n.titulo}: ${NOVEDAD_CATEGORIAS[n.categoria].toLowerCase()}`}
        description={n.resumen}
        image={`/og/novedades/${n.slug}.jpg`}
        type="article"
        jsonLd={[
          {
            '@type': 'NewsArticle',
            headline: n.titulo,
            description: n.resumen,
            datePublished: n.fecha,
            image: n.imagen ? [absoluteUrl(n.imagen)] : undefined,
            mainEntityOfPage: absoluteUrl(`/novedades/${n.slug}`),
            author: { '@type': 'Organization', name: sitio.nombreLargo, url: sitio.url },
            publisher: { '@type': 'Organization', name: sitio.nombreLargo, logo: { '@type': 'ImageObject', url: absoluteUrl('/icon-512.png') } },
          },
          breadcrumbJsonLd([
            { name: 'Inicio', path: '/' },
            { name: 'Novedades', path: '/novedades' },
            { name: n.titulo, path: `/novedades/${n.slug}` },
          ]),
        ]}
      />
      <PageHero
        image={n.imagen}
        align="start"
        eyebrow={`${NOVEDAD_CATEGORIAS[n.categoria]} · ${formatDate(n.fecha)}`}
        title={n.titulo}
        breadcrumbs={[{ name: 'Inicio', path: '/' }, { name: 'Novedades', path: '/novedades' }, { name: n.titulo }]}
      />
      <Section width="prose">
        <Reveal as="article" className={styles.article}>
          <p className={styles.lead}>{n.resumen}</p>
          <Prose text={n.cuerpo} />
          <div className={styles.actions}>
            {n.enlace && (
              <Button href={n.enlace.url} icon="external">
                {n.enlace.texto}
              </Button>
            )}
            {curso && <Button to={`/especializaciones/${curso.slug}`}>Ver el curso</Button>}
          </div>
        </Reveal>
        {curso && (
          <Reveal className={styles.curso}>
            <CourseCard curso={curso} headingLevel={2} />
          </Reveal>
        )}
      </Section>
      {otras.length > 0 && (
        <Section tone="tint" width="wide" labelledBy="otras-title">
          <SectionHeader id="otras-title" title="Más *novedades*" />
          <RevealGroup className={styles.grid}>
            {otras.map((o) => (
              <RevealItem key={o.slug}>
                <NewsCard novedad={o} variant="plain" />
              </RevealItem>
            ))}
          </RevealGroup>
        </Section>
      )}
    </>
  );
}
