import { FilePen, Receipt, Stethoscope } from 'lucide-react';
import heroImg from '@/assets/media/inscripciones/main.webp';
import heroSm from '@/assets/media/inscripciones/main-800.webp';
import { Fragment } from 'react';
import { Link } from 'react-router';
import { faq, inscripciones, sitio, inscripcionesVigentes } from '@/content';
import { Bloque, usePagina } from '@/features/vista-previa/vistaPrevia';
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

/** Ícono de cada paso (planilla, exámenes médicos, pago), como en el sitio original. */
const STEP_ICONS = [FilePen, Stethoscope, Receipt];

/** Título sobre la banda violeta: el *resaltado* va en negrita (no en color, que no contrasta). */
const negrita = (titulo: string) =>
  titulo.split(/(\*[^*]+\*)/g).map((parte, i) =>
    parte.length > 2 && parte.startsWith('*') && parte.endsWith('*') ? <strong key={i}>{parte.slice(1, -1)}</strong> : <Fragment key={i}>{parte}</Fragment>,
  );

export function Component() {
  /** Textos y fotos editables desde /admin → Páginas → Inscripciones. */
  const textos = usePagina('inscripciones');
  const preguntas = faq.preguntas.filter((p) => /inscrib|requisit|secundario|cuota|present/i.test(p.pregunta));
  return (
    <>
      <Seo
        title="Inscripciones"
        description={`Cómo inscribirte al Profesorado de Educación Física: ficha de inscripción, exámenes médicos y reserva de banco. Plazo para presentar requisitos: ${inscripciones.fechaLimiteRequisitos}.`}
        image={textos.hero.imagen ?? heroImg}
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
      <Bloque id="hero">
      <PageHero
        imageSmall={textos.hero.imagen ? undefined : heroSm}
        image={textos.hero.imagen ?? heroImg}
        title={textos.hero.titulo}
        subtitle={inscripcionesVigentes() ? sitio.inscripciones.texto : textos.hero.subtitulo}
        breadcrumbs={[{ name: 'Inicio', path: '/' }, { name: 'Inscripciones' }]}
      />
      </Bloque>

      <Bloque id="requisitos">
      <Section labelledBy="req-title">
        <SectionHeader id="req-title" title={textos.requisitos.titulo} lead={<Markdown text={inscripciones.intro} />} />
        <RevealGroup className={styles.steps} as="ol">
          {inscripciones.pasos.map((p, i) => {
            const Icon = STEP_ICONS[i % STEP_ICONS.length];
            return (
            <RevealItem key={p.titulo} as="li" className={styles.step}>
              <div className={styles.stepHead}>
                <span className={styles.stepIcon} aria-hidden>
                  <Icon />
                </span>
                <span className={styles.stepNum}>Paso {i + 1}</span>
              </div>
              <h3>{p.titulo}</h3>
              <Markdown text={p.descripcion} className={styles.stepText} />
              {p.archivo && (
                <Button
                  href={p.archivo}
                  download
                  icon="download"
                  onClick={() => track('file_download', { archivo: p.archivo })}
                >
                  {p.archivoTexto ?? 'Descargar'}
                </Button>
              )}
              {/* Sin archivo para descargar (p. ej. reservar el banco): se consulta por WhatsApp */}
              {!p.archivo && (
                <Button
                  href={whatsappUrl(sitio.whatsapp, `Hola! Quiero consultar por: ${p.titulo.toLowerCase()}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  icon="external"
                  onClick={() => track('whatsapp_click', { origen: 'inscripciones_paso' })}
                >
                  Consultar por WhatsApp
                </Button>
              )}
            </RevealItem>
            );
          })}
        </RevealGroup>
        <p className={styles.where}>
          Presentá la documentación en la <Link to="/contacto#sedes">sede que te corresponda</Link> antes del{' '}
          <strong>{inscripciones.fechaLimiteRequisitos}</strong>.
        </p>
      </Section>
      </Bloque>

      <Bloque id="secundario">
      <Section tone="brand" labelledBy="sec-title">
        <div className={styles.secundario}>
          <Reveal>
            <h2 id="sec-title">{negrita(textos.secundario.titulo)}</h2>
            <Markdown text={inscripciones.secundario} className={styles.secText} />
          </Reveal>
          <Reveal className={styles.calendar} delay={0.15} aria-hidden>
            <span>{inscripciones.fechaLimiteSecundario.mes}</span>
            <strong>{inscripciones.fechaLimiteSecundario.dia}</strong>
          </Reveal>
        </div>
      </Section>
      </Bloque>

      <Bloque id="mayores25">
      <Section labelledBy="m25-title">
        <SectionHeader id="m25-title" title={textos.mayores25.titulo} lead={<Markdown text={inscripciones.mayores25.descripcion} />} />
        <Reveal className={styles.files}>
          {inscripciones.mayores25.archivos.map((a) => (
            <Button key={a.url} href={a.url} download icon="download" onClick={() => track('file_download', { archivo: a.url })}>
              {a.texto}
            </Button>
          ))}
        </Reveal>
      </Section>
      </Bloque>

      <Bloque id="dudas">
      {preguntas.length > 0 && (
        <Section tone="tint" labelledBy="dudas-title">
          <SectionHeader id="dudas-title" title={textos.dudas.titulo} align="center" />
          {/* Misma grilla de tarjetas a dos columnas que las preguntas del inicio */}
          <Accordion variant="card" className={styles.faqList} items={preguntas.map((p) => ({ title: p.pregunta, content: <Markdown text={p.respuesta} /> }))} />
          <div className={styles.center}>
            <Button href={whatsappUrl(sitio.whatsapp, 'Hola! Tengo una consulta sobre la inscripción.')} variant="outline" icon="external">
              ¿Otra consulta? Escribinos
            </Button>
          </div>
        </Section>
      )}
      </Bloque>
    </>
  );
}
