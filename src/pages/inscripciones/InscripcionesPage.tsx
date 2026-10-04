import heroImg from '@/assets/media/inscripciones/main.webp';
import heroSm from '@/assets/media/inscripciones/main-800.webp';
import { aranceles, faq, inscripciones, sitio } from '@/content';
import { whatsappUrl } from '@/lib/format';
import { Markdown, toPlainText } from '@/lib/markdown';
import { track } from '@/lib/analytics';
import Seo, { breadcrumbJsonLd } from '@/components/seo/Seo';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import Accordion from '@/components/ui/Accordion';
import Reveal, { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import styles from './InscripcionesPage.module.scss';

export function Component() {
  const preguntas = faq.preguntas.filter((p) => /inscrib|requisit|secundario|cuota|present/i.test(p.pregunta));
  return (
    <>
      <Seo
        title="Inscripciones"
        description={`Cómo inscribirte al Profesorado de Educación Física: ficha de inscripción, exámenes médicos y reserva de banco. Plazo para presentar requisitos: ${inscripciones.fechaLimiteRequisitos}.`}
        image={heroImg}
        jsonLd={[
          {
            '@type': 'HowTo',
            name: 'Cómo inscribirse al I.S.E.F. San Luis',
            step: inscripciones.pasos.map((p, i) => ({ '@type': 'HowToStep', position: i + 1, name: p.titulo, text: toPlainText(p.descripcion) })),
          },
          breadcrumbJsonLd([
            { name: 'Inicio', path: '/' },
            { name: 'Inscripciones', path: '/inscripciones' },
          ]),
        ]}
      />
      <PageHero
        imageSmall={heroSm}
        image={heroImg}
        title="Inscripciones"
        subtitle={sitio.inscripciones.abiertas ? sitio.inscripciones.texto : 'Toda la información para inscribirte'}
        breadcrumbs={[{ name: 'Inicio', path: '/' }, { name: 'Inscripciones' }]}
      />

      <Section labelledBy="req-title">
        <SectionHeader id="req-title" title="Requisitos *a presentar*" lead={<Markdown text={inscripciones.intro} />} />
        <RevealGroup className={styles.steps} as="ol">
          {inscripciones.pasos.map((p, i) => (
            <RevealItem key={p.titulo} as="li" className={styles.step}>
              <span className={styles.stepNum} aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3>{p.titulo}</h3>
              <Markdown text={p.descripcion} className={styles.stepText} />
              {p.archivo && (
                <Button
                  href={p.archivo}
                  download
                  icon="download"
                  variant={i % 2 ? 'accent' : 'primary'}
                  onClick={() => track('file_download', { archivo: p.archivo })}
                >
                  {p.archivoTexto ?? 'Descargar'}
                </Button>
              )}
              {!p.archivo && aranceles.visible && (
                <Button to="/aranceles" variant="dark">
                  Ver aranceles
                </Button>
              )}
            </RevealItem>
          ))}
        </RevealGroup>
        <p className={styles.where}>
          Presentá la documentación en la <a href="/contacto#sedes">sede que te corresponda</a> antes del{' '}
          <strong>{inscripciones.fechaLimiteRequisitos}</strong>.
        </p>
      </Section>

      <Section tone="brand" labelledBy="sec-title">
        <div className={styles.secundario}>
          <Reveal>
            <h2 id="sec-title">
              ¿Recién terminás el <strong>secundario</strong>?
            </h2>
            <span className={styles.line} aria-hidden />
            <Markdown text={inscripciones.secundario} className={styles.secText} />
          </Reveal>
          <Reveal className={styles.calendar} delay={0.15} aria-hidden>
            <span>{inscripciones.fechaLimiteSecundario.mes}</span>
            <strong>{inscripciones.fechaLimiteSecundario.dia}</strong>
          </Reveal>
        </div>
      </Section>

      <Section labelledBy="m25-title">
        <SectionHeader id="m25-title" title="Mayores de *25 años* sin secundario" lead={<Markdown text={inscripciones.mayores25.descripcion} />} />
        <Reveal className={styles.files}>
          {inscripciones.mayores25.archivos.map((a) => (
            <Button key={a.url} href={a.url} download variant="dark" icon="download" onClick={() => track('file_download', { archivo: a.url })}>
              {a.texto}
            </Button>
          ))}
        </Reveal>
      </Section>

      {preguntas.length > 0 && (
        <Section tone="tint" width="prose" labelledBy="dudas-title">
          <SectionHeader id="dudas-title" title="Dudas *frecuentes*" align="center" />
          <Accordion items={preguntas.map((p) => ({ title: p.pregunta, content: <Markdown text={p.respuesta} /> }))} />
          <div className={styles.center}>
            <Button href={whatsappUrl(sitio.whatsapp, 'Hola! Tengo una consulta sobre la inscripción.')} variant="outline" icon="external">
              ¿Otra consulta? Escribinos
            </Button>
          </div>
        </Section>
      )}
    </>
  );
}
