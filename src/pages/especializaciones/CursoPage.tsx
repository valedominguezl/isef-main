import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, CalendarDays, CircleDollarSign, ClipboardCheck, Clock, MonitorPlay } from 'lucide-react';
import { cursos, disertantes, etiquetasCurso, getCurso, nombreCompleto, sitio, yaComenzo } from '@/content';
import { formatDate, whatsappUrl } from '@/lib/format';
import { excerpt, toPlainText } from '@/lib/markdown';
import { track } from '@/lib/analytics';
import Seo, { absoluteUrl, breadcrumbJsonLd } from '@/components/seo/Seo';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Prose from '@/components/ui/Prose';
import Accordion from '@/components/ui/Accordion';
import Reveal, { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import CourseCard from '@/components/cards/CourseCard';
import { Component as NotFound } from '../NotFoundPage';
import styles from './CursoPage.module.scss';

export function Component() {
  const { slug = '' } = useParams();
  const curso = getCurso(slug);
  if (!curso) return <NotFound />;

  const dis = curso.disertantes.map((s) => disertantes.find((d) => d.slug === s)).filter((d): d is NonNullable<typeof d> => Boolean(d));
  const relacionados = cursos
    .filter((c) => c.slug !== curso.slug)
    .sort((a, b) => Number(b.disertantes.some((d) => curso.disertantes.includes(d))) - Number(a.disertantes.some((d) => curso.disertantes.includes(d))))
    .slice(0, 3);
  const consulta = whatsappUrl(sitio.whatsapp, `Hola! Quiero consultar por el curso "${curso.titulo}".`);

  const datos = [
    curso.fechaInicio && { icon: CalendarDays, label: yaComenzo(curso) ? 'Última edición' : 'Inicio', value: `${formatDate(curso.fechaInicio)}${yaComenzo(curso) ? ' (ya comenzó: consultá la próxima)' : ''}` },
    curso.modalidad && { icon: MonitorPlay, label: 'Modalidad', value: curso.modalidad },
    curso.duracion && { icon: Clock, label: 'Duración y horario', value: curso.duracion },
    curso.costo && { icon: CircleDollarSign, label: 'Costo', value: curso.costo },
  ].filter(Boolean) as { icon: typeof CalendarDays; label: string; value: string }[];

  return (
    <>
      <Seo
        title={curso.titulo}
        description={excerpt(`${curso.subtitulo}. ${toPlainText(curso.descripcion)}`, 158)}
        image={`/og/especializaciones/${curso.slug}.jpg`}
        jsonLd={[
          {
            '@type': 'Course',
            name: curso.titulo,
            description: excerpt(toPlainText(curso.descripcion) || curso.subtitulo, 300),
            url: absoluteUrl(`/especializaciones/${curso.slug}`),
            image: curso.imagen ? absoluteUrl(curso.imagen) : undefined,
            inLanguage: 'es',
            provider: { '@type': 'EducationalOrganization', name: sitio.nombreLargo, sameAs: sitio.url },
            instructor: dis.map((d) => ({ '@type': 'Person', name: nombreCompleto(d), url: absoluteUrl(`/disertantes/${d.slug}`) })),
            syllabusSections: curso.temario.map((t) => ({ '@type': 'Syllabus', name: t.tema, description: t.subtemas.join('; ') })),
            ...(curso.fechaInicio
              ? {
                  hasCourseInstance: {
                    '@type': 'CourseInstance',
                    courseMode: /online|zoom|meet|virtual/i.test(curso.modalidad ?? '') ? 'online' : 'onsite',
                    startDate: curso.fechaInicio,
                  },
                }
              : {}),
          },
          breadcrumbJsonLd([
            { name: 'Inicio', path: '/' },
            { name: 'Especializaciones', path: '/especializaciones' },
            { name: curso.titulo, path: `/especializaciones/${curso.slug}` },
          ]),
        ]}
      />

      <PageHero
        image={curso.imagen}
        align="start"
        title={curso.titulo}
        subtitle={curso.subtitulo}
        breadcrumbs={[{ name: 'Inicio', path: '/' }, { name: 'Especializaciones', path: '/especializaciones' }, { name: curso.titulo }]}
        actions={
          <>
            <Button href={consulta} variant="primary" icon="external" onClick={() => track('whatsapp_click', { origen: 'curso', curso: curso.titulo })}>
              Consultar cupos
            </Button>
            {curso.temario.length > 0 && (
              <Button href="#temario" variant="outline-light" icon="none">
                Ver temario
              </Button>
            )}
          </>
        }
      >
        <div className={styles.badges}>
          {etiquetasCurso(curso).map((e) => (
            <Badge key={e.texto} tone={e.tono}>
              {e.texto}
            </Badge>
          ))}
          {dis.length > 0 && <Badge tone="light">Con {dis.map(nombreCompleto).join(' y ')}</Badge>}
        </div>
      </PageHero>

      <Section width="wide">
        <div className={styles.layout}>
          <div className={styles.main}>
            {curso.descripcion && (
              <Reveal as="section" aria-labelledby="desc-title">
                <h2 id="desc-title" className={styles.h2}>
                  Sobre el curso
                </h2>
                <Prose text={curso.descripcion} lead />
              </Reveal>
            )}

            {curso.temario.length > 0 && (
              <Reveal as="section" aria-labelledby="temario" className={styles.block}>
                <h2 id="temario" className={styles.h2}>
                  Temario
                </h2>
                <Accordion
                  variant="card"
                  defaultOpen={[0]}
                  items={curso.temario.map((t, i) => ({
                    title: (
                      <>
                        <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span> {t.tema}
                      </>
                    ),
                    meta: t.subtemas.length ? `${t.subtemas.length} temas` : undefined,
                    content: t.subtemas.length ? (
                      <ol className={styles.subtemas}>
                        {t.subtemas.map((s, j) => (
                          <li key={j}>
                            <span>
                              {i + 1}.{j + 1}
                            </span>
                            <p>{s}</p>
                          </li>
                        ))}
                      </ol>
                    ) : null,
                  }))}
                />
              </Reveal>
            )}

            {(curso.importante || curso.condiciones) && (
              <Reveal as="section" className={styles.block} aria-label="Condiciones de aprobación">
                {curso.condiciones && (
                  <div className={styles.callout}>
                    <ClipboardCheck aria-hidden />
                    <div>
                      <h3>Condiciones de aprobación</h3>
                      <Prose text={curso.condiciones} />
                    </div>
                  </div>
                )}
                {curso.importante && (
                  <div className={[styles.callout, styles.warn].join(' ')}>
                    <AlertTriangle aria-hidden />
                    <div>
                      <h3>Importante</h3>
                      <Prose text={curso.importante} />
                    </div>
                  </div>
                )}
              </Reveal>
            )}
          </div>

          <aside className={styles.aside} aria-label="Datos del curso">
            <div className={styles.card}>
              <h2 className={styles.asideTitle}>Datos del curso</h2>
              {datos.length ? (
                <dl className={styles.datos}>
                  {datos.map(({ icon: Icon, label, value }) => (
                    <div key={label}>
                      <Icon aria-hidden />
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className={styles.muted}>Próximamente publicaremos fechas y modalidad. Consultanos para reservar tu lugar.</p>
              )}
              <Button href={consulta} block icon="external" onClick={() => track('whatsapp_click', { origen: 'curso_aside', curso: curso.titulo })}>
                Consultar por WhatsApp
              </Button>
            </div>

            {dis.length > 0 && (
              <div className={styles.card}>
                <h2 className={styles.asideTitle}>{dis.length > 1 ? 'Disertantes' : 'Disertante'}</h2>
                <ul className={styles.dis} role="list">
                  {dis.map((d) => (
                    <li key={d.slug}>
                      <Link to={`/disertantes/${d.slug}`}>
                        {d.foto && <img src={d.foto} alt="" width={56} height={56} loading="lazy" />}
                        <span>
                          <strong>{nombreCompleto(d)}</strong>
                          <small>{d.especialidad}</small>
                          <em>Ver currículum →</em>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Section>

      <Section tone="tint" width="wide" labelledBy="rel-title">
        <SectionHeader id="rel-title" title="Otras *especializaciones*" />
        <RevealGroup className={styles.related}>
          {relacionados.map((c) => (
            <RevealItem key={c.slug}>
              <CourseCard curso={c} />
            </RevealItem>
          ))}
        </RevealGroup>
        <div className={styles.center}>
          <Button to="/especializaciones#cursos" variant="outline">
            Ver todas
          </Button>
        </div>
      </Section>
    </>
  );
}
