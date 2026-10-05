import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Clock, GraduationCap, Landmark, ShieldCheck, Wallet } from 'lucide-react';
import heroImg from '@/assets/media/home/hero.webp';
import heroSm from '@/assets/media/home/hero-800.webp';
import introImg from '@/assets/media/home/intro.webp';
import especImg from '@/assets/media/home/especializaciones.webp';
import cuotaImg from '@/assets/media/aranceles/main.webp';
import { aranceles, cursos, faq, inscripciones, novedadesRecientes, plan, sitio, inscripcionesVigentes } from '@/content';
import { normalize, whatsappUrl } from '@/lib/format';
import { Markdown, toPlainText } from '@/lib/markdown';
import Seo from '@/components/seo/Seo';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import Feature from '@/components/ui/Feature';
import Button from '@/components/ui/Button';
import Carousel from '@/components/ui/Carousel';
import Accordion from '@/components/ui/Accordion';
import CountUp from '@/components/ui/CountUp';
import SearchField from '@/components/ui/SearchField';
import { useDebounced } from '@/lib/useDebounced';
import Reveal, { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import NewsCard from '@/components/cards/NewsCard';
import CourseCard from '@/components/cards/CourseCard';
import SedeCard from '@/components/cards/SedeCard';
import styles from './HomePage.module.scss';

/** Íconos de fondo de cada número (mismo orden que sitio.estadisticas). */
const STAT_ICONS = [ShieldCheck, Landmark, GraduationCap];

function Faq() {
  const [q, setQ] = useState('');
  const [showAll, setShowAll] = useState(false);
  const query = useDebounced(q);
  const items = useMemo(() => {
    const n = normalize(query.trim());
    return faq.preguntas
      .map((p, i) => ({ ...p, i }))
      .filter((p) => !n || normalize(`${p.pregunta} ${toPlainText(p.respuesta)}`).includes(n));
  }, [query]);
  const visible = query || showAll ? items : items.slice(0, 6);

  return (
    <Section id="faq" tone="tint" width="default" labelledBy="faq-title">
      <SectionHeader id="faq-title" title="Preguntas *frecuentes*" align="center" lead="Lo que más nos consultan antes de inscribirse." />
      <SearchField
        className={styles.faqSearch}
        value={q}
        onChange={setQ}
        pending={q !== query}
        label="Buscar en las preguntas frecuentes"
        placeholder="Buscar en las preguntas…"
      />
      {visible.length ? (
        <Accordion
          key={query}
          className={[styles.faqList, q !== query && styles.pending].filter(Boolean).join(' ')}
          variant="card"
          items={visible.map((p) => ({ id: `faq-${p.i}`, title: p.pregunta, content: <Markdown text={p.respuesta} /> }))}
        />
      ) : (
        <p className={styles.faqEmpty}>
          No encontramos preguntas sobre eso. <a href={whatsappUrl(sitio.whatsapp)}>Escribinos por WhatsApp</a> y te respondemos.
        </p>
      )}
      {!query && items.length > 6 && (
        <div className={styles.center}>
          <Button variant="outline" icon="none" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
            {showAll ? 'Ver menos preguntas' : `Ver todas las preguntas (${items.length})`}
          </Button>
        </div>
      )}
    </Section>
  );
}

export function Component() {
  const destacados = cursos.slice(0, 3);
  const recientes = novedadesRecientes().slice(0, 6);
  const consultaCuota = whatsappUrl(sitio.whatsapp, 'Hola! Quisiera saber el valor de la cuota.');

  return (
    <>
      <Seo
        jsonLd={{
          '@type': 'FAQPage',
          mainEntity: faq.preguntas.map((p) => ({
            '@type': 'Question',
            name: p.pregunta,
            acceptedAnswer: { '@type': 'Answer', text: toPlainText(p.respuesta) },
          })),
        }}
      />

      <PageHero
        size="full"
        align="start"
        image={heroImg}
        imageSmall={heroSm}
        title={`Desde ${sitio.fundacion}, *abriendo caminos*`}
        subtitle="Título oficial con validez nacional, especializaciones gratuitas con científicos de renombre internacional y la cuota más baja del país."
        actions={
          inscripcionesVigentes() ? (
            <Button to="/inscripciones" variant="outline-light" size="lg" leading={<span aria-hidden>🚀</span>}>
              {sitio.inscripciones.texto}
            </Button>
          ) : (
            <Button to="/carrera" variant="outline-light" size="lg">
              Conocé la carrera
            </Button>
          )
        }
      />

      {/* Datos */}
      <Section tone="brand" spacing="sm" width="wide" labelledBy="datos-title">
        <h2 id="datos-title" className="sr-only">
          El I.S.E.F. en números
        </h2>
        <RevealGroup className={styles.stats}>
          {sitio.estadisticas.map((s, i) => {
            const Icon = STAT_ICONS[i % STAT_ICONS.length];
            return (
            <RevealItem key={s.etiqueta} className={styles.stat}>
              <Icon className={styles.statIcon} aria-hidden />
              <strong>
                <CountUp to={s.valor} prefix={s.prefijo} />
              </strong>
              <span className={styles.statLabel}>{s.etiqueta}</span>
            </RevealItem>
            );
          })}
        </RevealGroup>
      </Section>

      {/* Inscripción: lo que la persona viene a buscar (los pasos están en /inscripciones) */}
      <Section id="inscribite" labelledBy="insc-title">
        <div className={styles.enroll}>
          <SectionHeader id="insc-title" title="*Inscribite* en el profesorado" lead="Todo lo que necesitás saber para empezar a cursar." />
          <div className={styles.enrollBody}>
              <dl className={styles.facts}>
                <div>
                  <CalendarClock aria-hidden />
                  <dt>Plazo para presentar requisitos</dt>
                  <dd>Hasta el {inscripciones.fechaLimiteRequisitos}</dd>
                </div>
                <div>
                  <Clock aria-hidden />
                  <dt>Cursado</dt>
                  <dd>{plan.duracion}, presencial · lunes a viernes de 07:30 a 13:30 h</dd>
                </div>
                <div>
                  <Wallet aria-hidden />
                  <dt>Cuota</dt>
                  <dd>
                    Sin matrícula ni gastos extra ·{' '}
                    <a href={consultaCuota} target="_blank" rel="noopener noreferrer">
                      consultá el valor por WhatsApp
                    </a>
                  </dd>
                </div>
              </dl>
            <Reveal className={styles.enrollCta}>
              <Button to="/inscripciones" size="lg">
                Inscribite
              </Button>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Bienvenida */}
      <Section tone="tint">
        <Feature
          title="Te damos la bienvenida al *I.S.E.F.*"
          image={introImg}
          imageAlt="Vista aérea del predio del profesorado con las sierras de San Luis"
          actions={<Button to="/carrera">Conocé la carrera</Button>}
        >
          <p>
            Hace más de 30 años que formamos profes en San Luis. Estudiás cerca de los tuyos, con docentes que te acompañan y con herramientas
            para trabajar <strong>dentro y fuera de la escuela</strong>: clubes, gimnasios, centros de salud y alto rendimiento.
          </p>
        </Feature>
      </Section>

      {/* Novedades: solo si hay algo de los últimos 90 días */}
      {recientes.length > 0 && (
        <Section width="wide" labelledBy="novedades-title">
          <div className={styles.headRow}>
            <SectionHeader id="novedades-title" title="Las *últimas noticias*" lead="Cursos nuevos, eventos y novedades del profesorado." />
            <Button to="/novedades" variant="outline" className={styles.headAction}>
              Ver todas
            </Button>
          </div>
          <Reveal>
            <Carousel label="Últimas novedades">
              {recientes.map((n) => (
                <NewsCard key={n.slug} novedad={n} />
              ))}
            </Carousel>
          </Reveal>
        </Section>
      )}

      {/* Especializaciones */}
      <Section width="wide">
        <Feature
          reverse
          title="Las *especializaciones*"
          image={especImg}
          imageFit="cutout"
          imageAlt="Clase práctica de entrenamiento de la fuerza"
          actions={<Button to="/especializaciones">Ver todas las especializaciones</Button>}
        >
          <p>
            Cursos <strong>gratuitos para alumnos</strong> con científicos de renombre internacional: neurociencias, nutrición deportiva, adulto
            mayor, enfermedades crónicas, inteligencia artificial y más. Te preparan para trabajar en equipos interdisciplinarios con médicos,
            psicólogos y kinesiólogos.
          </p>
        </Feature>
        <RevealGroup className={styles.courses}>
          {destacados.map((c) => (
            <RevealItem key={c.slug}>
              <CourseCard curso={c} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Cuota */}
      <Section image={cuotaImg} width="prose" labelledBy="cuota-title" spacing="lg">
        <SectionHeader
          id="cuota-title"
          align="center"
          title="La cuota más *competitiva*"
          lead={
            <p>
              <strong>No te cobramos gastos adicionales</strong>: constancias, certificaciones, cuota aguinaldo, matrícula y pileta de natación no
              tienen costo. Por eso tenemos <strong>la cuota más baja de todo el país</strong>.
            </p>
          }
        >
          <div className={styles.center}>
            {aranceles.visible ? (
              <Button to="/aranceles" variant="outline-light">
                Ver aranceles
              </Button>
            ) : (
              <Button href={consultaCuota} variant="outline-light" icon="external">
                Consultar por WhatsApp
              </Button>
            )}
          </div>
        </SectionHeader>
      </Section>

      {/* Sedes */}
      <Section id="sedes" labelledBy="sedes-title">
        <SectionHeader
          id="sedes-title"
          align="center"
          title="Conocé *nuestras sedes*"
          lead={
            <p>
              Cursá en la <strong>Ciudad de San Luis</strong> o en <strong>Villa Mercedes</strong>. Todos los teléfonos por área están en{' '}
              <Link to="/contacto">contacto</Link>.
            </p>
          }
        />
        <RevealGroup className={styles.sedes}>
          {sitio.sedes.map((s) => (
            <RevealItem key={s.nombre}>
              <SedeCard sede={s} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Faq />

    </>
  );
}
