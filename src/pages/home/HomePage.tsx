import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Mail, MapPin, Phone, Search } from 'lucide-react';
import heroImg from '@/assets/media/home/hero.webp';
import heroSm from '@/assets/media/home/hero-800.webp';
import introImg from '@/assets/media/home/intro.webp';
import especImg from '@/assets/media/home/especializaciones.webp';
import fondoImg from '@/assets/media/fx/fondo.webp';
import { aranceles, cursos, faq, novedades, sitio } from '@/content';
import { formatPhone, normalize, whatsappUrl } from '@/lib/format';
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
import Reveal, { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { socialIcon } from '@/components/ui/Icons';
import NewsCard from '@/components/cards/NewsCard';
import CourseCard from '@/components/cards/CourseCard';
import styles from './HomePage.module.scss';

function Faq() {
  const [q, setQ] = useState('');
  const [showAll, setShowAll] = useState(false);
  const items = useMemo(() => {
    const n = normalize(q.trim());
    return faq.preguntas
      .map((p, i) => ({ ...p, i }))
      .filter((p) => !n || normalize(`${p.pregunta} ${toPlainText(p.respuesta)}`).includes(n));
  }, [q]);
  const visible = q || showAll ? items : items.slice(0, 6);

  return (
    <Section id="faq" tone="tint" width="default" labelledBy="faq-title">
      <SectionHeader id="faq-title" title="Preguntas *frecuentes*" align="center" lead="Lo que más nos consultan antes de inscribirse." />
      <div className={styles.faqSearch}>
        <Search size={18} aria-hidden />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar en las preguntas…" aria-label="Buscar en las preguntas frecuentes" />
      </div>
      {visible.length ? (
        <Accordion
          className={styles.faqList}
          variant="brand"
          items={visible.map((p) => ({ id: `faq-${p.i}`, title: p.pregunta, content: <Markdown text={p.respuesta} /> }))}
        />
      ) : (
        <p className={styles.faqEmpty}>
          No encontramos preguntas sobre eso. <a href={whatsappUrl(sitio.whatsapp)}>Escribinos por WhatsApp</a> y te respondemos.
        </p>
      )}
      {!q && !showAll && items.length > 6 && (
        <div className={styles.center}>
          <Button variant="outline" icon="none" onClick={() => setShowAll(true)}>
            Ver todas las preguntas ({items.length})
          </Button>
        </div>
      )}
    </Section>
  );
}

export function Component() {
  const destacados = cursos.slice(0, 3);
  const ultimas = novedades.slice(0, 6);

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
        imageSmall={heroSm}
        size="full"
        align="start"
        image={heroImg}
        eyebrow="Profesorado de Educación Física · San Luis y Villa Mercedes"
        title={`Desde ${sitio.fundacion}, *abriendo caminos*`}
        subtitle="Título oficial con validez nacional, especializaciones gratuitas con científicos de renombre internacional y la cuota más baja del país."
        actions={
          <>
            {sitio.inscripciones.abiertas && (
              <Button to="/inscripciones" variant="primary" size="lg">
                {sitio.inscripciones.texto}
              </Button>
            )}
            <Button to="/carrera" variant="outline-light" size="lg">
              Conocé la carrera
            </Button>
          </>
        }
      >
        <ul className={styles.heroSocial} role="list" aria-label="Redes sociales">
          {sitio.redes.map((r) => {
            const Icon = socialIcon[r.red];
            return (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  <Icon size={18} /> {r.etiqueta}
                </a>
              </li>
            );
          })}
        </ul>
      </PageHero>

      {/* Datos */}
      <Section tone="brand" spacing="sm" width="wide" labelledBy="datos-title">
        <h2 id="datos-title" className="sr-only">
          El I.S.E.F. en números
        </h2>
        <RevealGroup className={styles.stats}>
          {sitio.estadisticas.map((s) => (
            <RevealItem key={s.etiqueta} className={styles.stat}>
              <strong>
                <CountUp to={s.valor} prefix={s.prefijo} />
              </strong>
              <span className={styles.statLabel}>{s.etiqueta}</span>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Bienvenida */}
      <Section>
        <Feature
          eyebrow="I.S.E.F. San Luis · Profesorado de educación física"
          title="Bienvenido al *I.S.E.F.*"
          image={introImg}
          imageAlt="Estudiantes del profesorado en clase"
          actions={<Button to="/carrera">Enterate más</Button>}
        >
          <p>
            En un pueblo con educación reina la armonía, los afectos, la contención. En un pueblo con educación, construir un futuro exitoso es
            posible. En el I.S.E.F. San Luis, con un equipo de excelentes docentes, te damos las herramientas para lograrlo:{' '}
            <strong>30 años educando con amor</strong> y preparándote para una <strong>gran cantidad de campos laborales</strong> dentro y fuera
            del sistema educativo.
          </p>
          <p>
            No tenés que irte a otra provincia, lejos de tu familia y de quienes pueden acompañarte. Se trata de{' '}
            <strong>ser feliz mientras estudiás junto a los tuyos</strong>, formándote con las mejores herramientas para{' '}
            <strong>ejercer en la provincia, en el país, en Latinoamérica o en el resto del mundo</strong>.
          </p>
        </Feature>
      </Section>

      {/* Novedades */}
      {ultimas.length > 0 && (
        <Section tone="tint" width="wide" labelledBy="novedades-title">
          <div className={styles.headRow}>
            <SectionHeader
              id="novedades-title"
              title="Las *últimas noticias*"
              lead="Enterate qué hay de nuevo en el profesorado: especializaciones, novedades institucionales y más."
            />
            <Button to="/novedades" variant="outline" className={styles.headAction}>
              Ver todas
            </Button>
          </div>
          <Reveal>
            <Carousel label="Últimas novedades">
              {ultimas.map((n) => (
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
          eyebrow="I.S.E.F. San Luis · Lo que nos hace distintos"
          title="Las *especializaciones*"
          image={especImg}
          imageAlt="Clase práctica de especialización"
          actions={<Button to="/especializaciones">Ver todas las especializaciones</Button>}
        >
          <p>
            Te formamos en <strong>neurociencias</strong>, actividad física en enfermedades crónicas no transmisibles, adulto mayor, menopausia,
            nutrición deportiva y muchas áreas más, de la mano de <strong>científicos de renombre internacional</strong>. Herramientas para
            aplicar en el sistema educativo como prevención, pero también en clubes, gimnasios y centros de salud.
          </p>
          <p>
            Las neurociencias vinculan la salud mental con la salud física. En este campo, el profesor de educación física puede{' '}
            <strong>trabajar en equipos interdisciplinarios</strong> con psicólogos, psiquiatras, neurólogos, gerontólogos y más.
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
      <Section image={fondoImg} width="prose" labelledBy="cuota-title" spacing="lg">
        <SectionHeader
          id="cuota-title"
          align="center"
          eyebrow="I.S.E.F. San Luis · Pensamos en vos"
          title="La cuota más *competitiva*"
          lead={
            <p>
              En el I.S.E.F. San Luis <strong>no te cobramos gastos adicionales</strong>: constancias, certificaciones, cuota aguinaldo,
              matrícula y pileta de natación no tienen costo. Por eso tenemos <strong>la cuota más baja de todo el país</strong>.
            </p>
          }
        >
          <div className={styles.center}>
            {aranceles.visible ? (
              <Button to="/aranceles" variant="outline-light">
                Ver aranceles
              </Button>
            ) : (
              <Button href={whatsappUrl(sitio.whatsapp, 'Hola! Quisiera saber el valor de la cuota.')} variant="outline-light" icon="external">
                Consultar valores
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
              Encontranos en la <strong>sede principal</strong> de la Ciudad de San Luis y en la <strong>extensión áulica</strong> de Villa Mercedes.
              Todos los teléfonos están en <Link to="/contacto">contacto</Link>.
            </p>
          }
        />
        <RevealGroup className={styles.sedes}>
          {sitio.sedes.map((s) => (
            <RevealItem key={s.nombre} as="article" className={styles.sede}>
              <div className={`${styles.sedeHead} on-dark`}>
                <p>{s.tipo}</p>
                <h3>{s.nombre}</h3>
              </div>
              <ul role="list" className={styles.sedeList}>
                <li>
                  <MapPin aria-hidden />
                  <a href={s.mapaUrl} target="_blank" rel="noopener noreferrer">
                    {s.direccion}
                  </a>
                </li>
                <li>
                  <Phone aria-hidden />
                  <a href={whatsappUrl(s.telefono)} target="_blank" rel="noopener noreferrer">
                    {formatPhone(s.telefono)}
                  </a>
                </li>
                <li>
                  <Mail aria-hidden />
                  <a href={`mailto:${sitio.email}`}>{sitio.email}</a>
                </li>
                <li>
                  <Clock aria-hidden />
                  <strong>{s.horario}</strong>
                </li>
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Faq />

      {/* CTA final */}
      <Section tone="dark" width="default" spacing="sm">
        <Reveal className={styles.cta}>
          <div>
            <h2>
              ¿Querés ser <span className="em-accent">profe</span>?
            </h2>
            <p>Te acompañamos en todo el proceso de inscripción. Escribinos y te respondemos a la brevedad.</p>
          </div>
          <div className={styles.ctaActions}>
            <Button to="/inscripciones" variant="light">
              Cómo inscribirme
            </Button>
            <Button href={whatsappUrl(sitio.whatsapp, 'Hola! Quiero información para inscribirme.')} variant="outline-light" icon="external">
              WhatsApp
            </Button>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
