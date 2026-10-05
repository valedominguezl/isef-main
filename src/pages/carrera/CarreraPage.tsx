import { useState } from 'react';
import { BadgeCheck, CalendarDays, ChevronLeft, ChevronRight, Clock, GraduationCap, Hourglass, MapPin, Maximize2 } from 'lucide-react';
import heroImg from '@/assets/media/carrera/main.webp';
import heroSm from '@/assets/media/carrera/main-800.webp';
import introImg from '@/assets/media/carrera/intro.webp';
import gabineteImg from '@/assets/media/carrera/gabinete.webp';
import sanLuisLogo from '@/assets/validez/sanLuis.webp';
import argentinaLogo from '@/assets/validez/argentina.webp';
import mercosurLogo from '@/assets/validez/mercosur.webp';
import { cursos, galeria, plan } from '@/content';
import Seo, { breadcrumbJsonLd } from '@/components/seo/Seo';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import Feature from '@/components/ui/Feature';
import Button from '@/components/ui/Button';
import Carousel from '@/components/ui/Carousel';
import Accordion from '@/components/ui/Accordion';
import Dialog from '@/components/ui/Dialog';
import Reveal, { RevealItem } from '@/components/ui/Reveal';
import CardGrid from '@/components/ui/CardGrid';
import IconButton from '@/components/ui/IconButton';
import CourseCard from '@/components/cards/CourseCard';
import styles from './CarreraPage.module.scss';

const DATOS = [
  { icon: GraduationCap, label: 'Título', value: 'Profesor/a de Educación Física' },
  { icon: Hourglass, label: 'Duración', value: plan.duracion },
  { icon: MapPin, label: 'Modalidad', value: 'Presencial' },
  { icon: CalendarDays, label: 'Cursado', value: 'De lunes a viernes' },
  { icon: Clock, label: 'Horario', value: 'De 07:30 a 13:30 h' },
  { icon: BadgeCheck, label: 'Validez', value: 'Nacional y MERCOSUR' },
];

function Galeria() {
  const [index, setIndex] = useState<number | null>(null);
  const imgs = galeria.imagenes;
  const current = index != null ? imgs[index] : null;
  const step = (d: number) => setIndex((i) => (i == null ? i : (i + d + imgs.length) % imgs.length));

  return (
    <>
      <Carousel label="Galería de lugares de práctica" className={styles.gallery}>
        {imgs.map((g, i) => (
          <figure key={g.imagen} className={styles.photo}>
            <button type="button" onClick={() => setIndex(i)} aria-label={`Ampliar foto: ${g.lugar}`}>
              <img src={g.imagen} alt={g.lugar} loading="lazy" decoding="async" />
              <Maximize2 className={styles.zoom} size={20} aria-hidden />
            </button>
            <figcaption className="on-dark">
              <strong>{g.lugar}</strong>
              {g.credito && <small>{g.credito}</small>}
            </figcaption>
          </figure>
        ))}
      </Carousel>
      <Dialog open={index != null} onClose={() => setIndex(null)} title={current?.lugar ?? 'Galería'} hideTitle size="lg" variant="dark">
        {current && (
          <div
            className={styles.lightbox}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') step(1);
              if (e.key === 'ArrowLeft') step(-1);
            }}
          >
            {/* Marco de proporción fija: el visor no cambia de tamaño entre fotos verticales y horizontales */}
            <div className={styles.frame}>
              <img key={current.imagen} className={styles.swap} src={current.imagen} alt={current.lugar} />
            </div>
            <div className={`${styles.lightboxBar} on-dark`}>
              <IconButton label="Foto anterior" tone="light" onClick={() => step(-1)}>
                <ChevronLeft />
              </IconButton>
              <p>
                <strong>{current.lugar}</strong>
                {current.credito && <small> · {current.credito}</small>}
                <span>
                  {index! + 1} / {imgs.length}
                </span>
              </p>
              <IconButton label="Foto siguiente" tone="light" onClick={() => step(1)}>
                <ChevronRight />
              </IconButton>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}

export function Component() {
  const enCarrera = cursos.filter((c) => c.mostrarEnCarrera);
  return (
    <>
      <Seo
        title="La carrera: Profesorado de Educación Física"
        description={`Profesorado de Educación Física de ${plan.duracion}, presencial y con título oficial de validez nacional. Plan de estudios, salida laboral y especializaciones.`}
        image={heroImg}
        jsonLd={[
          {
            '@type': 'EducationalOccupationalProgram',
            name: plan.titulo,
            description: 'Profesorado de Educación Física con título oficial de validez nacional.',
            provider: { '@id': 'https://isefsanluis.net/#organizacion' },
            timeToComplete: 'P4Y',
            educationalCredentialAwarded: plan.titulo,
            educationalProgramMode: 'in-person',
            numberOfCredits: plan.horasReloj,
          },
          breadcrumbJsonLd([
            { name: 'Inicio', path: '/' },
            { name: 'La carrera', path: '/carrera' },
          ]),
        ]}
      />
      <PageHero
        imageSmall={heroSm}
        image={heroImg}
        size="lg"
        title="Profesorado de *educación física*"
        subtitle="Títulos oficiales de validez nacional"
        breadcrumbs={[{ name: 'Inicio', path: '/' }, { name: 'La carrera' }]}
      />

      <Section>
        <Feature
          title="Te necesitan, *profe*"
          image={introImg}
          imageAlt="Profesor de educación física trabajando con alumnos"
          actions={<Button to="/especializaciones">Ver talleres</Button>}
        >
          <p>
            Gracias al I.S.E.F. San Luis, <strong>sos necesario</strong>. Con los talleres de especialización que te ofrecemos de manera gratuita
            vas a poder ejercer en equipos interdisciplinarios en centros de salud, gimnasios, clubes, clínicas, hospitales y mucho más.
          </p>
          <p>
            Te damos herramientas para que seas capaz de <strong>mucho más que la docencia</strong>: el club, el gimnasio, la pileta, ciclistas,
            maratonistas, artes marciales, danza, patinaje, <strong>centros de alto rendimiento</strong> y la reinserción deportiva junto a
            kinesiólogos. Los egresados del I.S.E.F. están en <strong>todos lados, mucho más allá de las escuelas</strong>.
          </p>
        </Feature>
      </Section>

      {enCarrera.length > 0 && (
        <Section tone="tint" width="wide" labelledBy="esp-title">
          <SectionHeader id="esp-title" title="Algunas de nuestras *especializaciones*" lead="Gratuitas para los alumnos del profesorado." />
          <Reveal>
            <Carousel label="Especializaciones destacadas">
              {enCarrera.map((c) => (
                <CourseCard key={c.slug} curso={c} />
              ))}
            </Carousel>
          </Reveal>
        </Section>
      )}

      <Section labelledBy="datos-title">
        <SectionHeader id="datos-title" title="Información *general*" />
        <CardGrid reveal dense as="ul">
          {DATOS.map(({ icon: Icon, label, value }) => (
            <RevealItem key={label} as="li" className={styles.dato}>
              <Icon className={styles.datoIcon} aria-hidden />
              <span>
                <small>{label}</small>
                <strong>{value}</strong>
              </span>
            </RevealItem>
          ))}
        </CardGrid>
      </Section>

      <Section tone="dark" labelledBy="validez-title">
        <div className={styles.validez}>
          <SectionHeader
            id="validez-title"
            eyebrow={plan.resolucion}
            title="Validez *nacional e internacional*"
            lead={
              <p>
                Tu título te permite trabajar en todo el territorio argentino y en los <strong>países del MERCOSUR</strong>. Consultá la validez
                nacional del título al 4452000, interno 3309, del Ministerio de Educación de San Luis.
              </p>
            }
          />
          <Reveal className={styles.logos}>
            {[
              [sanLuisLogo, 'Gobierno de San Luis'],
              [argentinaLogo, 'República Argentina'],
              [mercosurLogo, 'MERCOSUR'],
            ].map(([src, alt]) => (
              <img key={alt} src={src} alt={alt} loading="lazy" />
            ))}
          </Reveal>
        </div>
      </Section>

      <Section id="plan" tone="tint" labelledBy="plan-title">
        <SectionHeader
          id="plan-title"
          title="Plan de *estudios*"
          lead={
            <p>
              La carrera tiene una <strong>duración estimada de {plan.duracion}</strong>, expresada en{' '}
              <strong>{plan.horasReloj.toLocaleString('es-AR')} horas reloj</strong> o{' '}
              <strong>{plan.horasCatedra.toLocaleString('es-AR')} horas cátedra</strong>.
            </p>
          }
        />
        <Reveal>
          <Accordion
            className={styles.plan}
            variant="brand"
            items={plan.anios.map((a) => ({
              title: a.anio,
              meta: `${a.horasReloj.toLocaleString('es-AR')} horas reloj · ${a.horasCatedra.toLocaleString('es-AR')} horas cátedra`,
              content: (
                <ol className={styles.materias}>
                  {a.materias.map((m) => (
                    <li key={m.nombre}>
                      <strong>{m.nombre}</strong>
                      {(m.tipo || m.horas) && (
                        <span>
                          {m.tipo}
                          {m.tipo && m.horas ? ' · ' : ''}
                          {m.horas ? `${m.horas} h` : ''}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              ),
            }))}
          />
        </Reveal>
      </Section>

      <Section image={gabineteImg} width="prose" labelledBy="gabinete-title">
        <SectionHeader
          id="gabinete-title"
          align="center"
          title="Gabinete de *apoyo psicopedagógico*"
          lead={
            <p>
              Pensando siempre en tu formación, el profesorado dispone de un gabinete de apoyo psicopedagógico <strong>gratuito</strong> para
              acompañarte en el estudio. Así, tus conflictos se transforman en fortalezas y tu paso por esta casa de estudios es una experiencia
              realmente agradable. <strong>Pedí turno en secretaría</strong>.
            </p>
          }
        />
      </Section>

      <Section width="wide" labelledBy="explora-title">
        <SectionHeader
          id="explora-title"
          title="Exploramos *lo lindo que es San Luis*"
          lead={
            <p>
              <strong>“Actividades y deportes regionales”</strong> es un trayecto que integra las disciplinas de naturaleza y tiempo libre de primero a
              cuarto año, y concluye con una <strong>residencia integradora</strong> en el espacio curricular <strong>“Vida en la naturaleza”</strong>.
              Los <strong>campamentos recreativos</strong> incluyen palestra, senderismo, kayak, trekking, rapel, tirolesa, escalada, canotaje,
              mountain bike, montañismo, apnea, hidrospeed y remo en los <strong>lugares más turísticos de San Luis</strong>.
            </p>
          }
        />
        <Reveal>
          <Galeria />
        </Reveal>
      </Section>
    </>
  );
}
