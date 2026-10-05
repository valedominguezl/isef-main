import { useState } from 'react';
import { useLoaderData, useParams, type LoaderFunctionArgs } from 'react-router';
import logo from '@/assets/logo.webp';
import { cursosDe, getDisertante, loadCv, nombreCompleto, sitio } from '@/content';
import { CV_SECCIONES } from '@/content/constants';
import type { Cv, CvItem } from '@/content/schema';
import Seo, { absoluteUrl, breadcrumbJsonLd } from '@/components/seo/Seo';
import Section from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Button from '@/components/ui/Button';
import Reveal, { RevealItem } from '@/components/ui/Reveal';
import CardGrid from '@/components/ui/CardGrid';
import CourseCard from '@/components/cards/CourseCard';
import { Component as NotFound } from '../NotFoundPage';
import styles from './DisertantePage.module.scss';

export async function loader({ params }: LoaderFunctionArgs) {
  return { cv: await loadCv(params.slug ?? '') };
}

const ORDER = Object.keys(CV_SECCIONES) as (keyof typeof CV_SECCIONES)[];
const LIMIT = 12;

/** Orden estándar: lo vigente primero, después de lo más reciente a lo más antiguo. */
function yearKey(periodo?: string) {
  if (!periodo) return -1;
  if (/actual|contin|curso/i.test(periodo)) return 10000;
  const years = periodo.match(/\d{4}/g);
  return years ? Math.max(...years.map(Number)) : -1;
}
const sortItems = (items: CvItem[]) =>
  items
    .map((it, i) => ({ it, i }))
    .sort((a, b) => yearKey(b.it.periodo) - yearKey(a.it.periodo) || a.i - b.i)
    .map((x) => x.it);

function CvSection({ titulo, items }: { titulo: string; items: CvItem[] }) {
  const [all, setAll] = useState(false);
  // Sin fechas en toda la sección: una sola columna (sin el hueco vacío de los períodos)
  const dated = items.some((it) => it.periodo);
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        {titulo} <small>{items.length}</small>
      </h2>
      <ol className={[styles.timeline, !dated && styles.undated].filter(Boolean).join(' ')} role="list">
        {items.map((it, i) => (
          <li key={i} className={!all && i >= LIMIT ? styles.extra : undefined}>
            {dated && <span className={styles.period}>{it.periodo ?? ''}</span>}
            <div className={styles.entry}>
              <p className={styles.entryTitle}>{it.titulo}</p>
              {it.institucion && <p className={styles.inst}>{it.institucion}</p>}
              {it.detalle && <p className={styles.detail}>{it.detalle}</p>}
            </div>
          </li>
        ))}
      </ol>
      {items.length > LIMIT && (
        <button type="button" className={`${styles.more} no-print`} onClick={() => setAll((v) => !v)} aria-expanded={all}>
          {all ? 'Mostrar menos' : `Ver los ${items.length} antecedentes`}
        </button>
      )}
    </section>
  );
}

export function Component() {
  const { slug = '' } = useParams();
  const { cv } = useLoaderData() as { cv: Cv | null };
  const d = getDisertante(slug);
  if (!d) return <NotFound />;
  const nombre = nombreCompleto(d);
  const cursos = cursosDe(slug);
  const secciones = (cv?.secciones ?? []).filter((s) => s.items.length).sort((a, b) => ORDER.indexOf(a.tipo) - ORDER.indexOf(b.tipo));

  return (
    <>
      <Seo
        title={`${nombre} — Currículum`}
        description={cv?.resumen ?? `${nombre}: ${d.destacados.join(', ')}. Disertante de las especializaciones del ${sitio.nombre}.`}
        image={`/og/disertantes/${slug}.jpg`}
        type="profile"
        jsonLd={[
          {
            '@type': 'Person',
            name: nombre,
            honorificPrefix: d.titulo || undefined,
            jobTitle: d.especialidad,
            description: cv?.resumen,
            image: d.foto ? absoluteUrl(d.foto) : undefined,
            url: absoluteUrl(`/disertantes/${slug}`),
            affiliation: { '@type': 'EducationalOrganization', name: sitio.nombreLargo },
          },
          breadcrumbJsonLd([
            { name: 'Inicio', path: '/' },
            { name: 'Especializaciones', path: '/especializaciones' },
            { name: nombre, path: `/disertantes/${slug}` },
          ]),
        ]}
      />

      <header className={`${styles.header} on-dark`}>
        <div className={styles.headerInner}>
          <div className="no-print">
            <Breadcrumbs light items={[{ name: 'Inicio', path: '/' }, { name: 'Disertantes', path: '/especializaciones#disertantes' }, { name: nombre }]} />
          </div>
          <div className={styles.printBrand}>
            <img src={logo} alt="" width={40} height={40} />
            <span>
              {sitio.nombreLargo} · Currículum
            </span>
          </div>
          <div className={styles.profile}>
            {d.foto && <img className={styles.photo} src={d.foto} alt={`Retrato de ${nombre}`} width={200} height={200} {...{ fetchpriority: "high" }} />}
            <div className={styles.identity}>
              <p className={styles.area}>{d.especialidad}</p>
              <h1>{nombre}</h1>
              {cv?.resumen && <p className={styles.summary}>{cv.resumen}</p>}
              <ul className={styles.tags} role="list">
                {d.destacados.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              {cursos.length > 0 && (
                <div className={`${styles.actions} no-print`}>
                  <Button href="#cursos" variant="outline-light" icon="none">
                    Cursos que dicta ({cursos.length})
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <Section width="default">
        {secciones.length ? (
          <Reveal className={styles.cv}>
            {secciones.map((s, i) => (
              <CvSection key={`${s.tipo}-${i}`} titulo={s.titulo || CV_SECCIONES[s.tipo]} items={sortItems(s.items)} />
            ))}
          </Reveal>
        ) : (
          <p>El currículum completo de {nombre} estará disponible próximamente.</p>
        )}
      </Section>

      {cursos.length > 0 && (
        <Section id="cursos" tone="tint" width="wide" labelledBy="cursos-title" className="no-print">
          <SectionHeader id="cursos-title" title={`Cursos con *${nombre}*`} />
          <CardGrid reveal>
            {cursos.map((c) => (
              <RevealItem key={c.slug}>
                <CourseCard curso={c} />
              </RevealItem>
            ))}
          </CardGrid>
        </Section>
      )}
    </>
  );
}
