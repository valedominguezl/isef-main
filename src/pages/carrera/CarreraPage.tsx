import { BadgeCheck, CalendarDays, Clock, GraduationCap, Hourglass, MapPin } from 'lucide-react';
import heroImg from '@/assets/media/carrera/main.webp';
import heroSm from '@/assets/media/carrera/main-800.webp';
import introImg from '@/assets/media/carrera/intro.webp';
import gabineteImg from '@/assets/media/carrera/gabinete.webp';
import sanLuisLogo from '@/assets/validez/sanLuis.webp';
import argentinaLogo from '@/assets/validez/argentina.webp';
import mercosurLogo from '@/assets/validez/mercosur.webp';
import { cursos, galeria, plan } from '@/content';
import { altFoto } from '@/content/paginas';
import { Bloque, usePagina } from '@/features/vista-previa/vistaPrevia';
import { Markdown } from '@/lib/markdown';
import Seo, { breadcrumbJsonLd } from '@/components/seo/Seo';
import Prose from '@/components/ui/Prose';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import Feature from '@/components/ui/Feature';
import Button from '@/components/ui/Button';
import Accordion from '@/components/ui/Accordion';
import Reveal, { RevealItem } from '@/components/ui/Reveal';
import CardGrid from '@/components/ui/CardGrid';
import Carousel from '@/components/ui/Carousel';
import MediaGallery from '@/components/ui/MediaGallery';
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

export function Component() {
  const enCarrera = cursos.filter((c) => c.mostrarEnCarrera);
  /** Textos y fotos editables desde /admin → Páginas → La carrera. */
  const textos = usePagina('carrera');
  return (
    <>
      <Seo
        title="La carrera: Profesorado de Educación Física"
        description={`Profesorado de Educación Física de ${plan.duracion}, presencial y con título oficial de validez nacional. Plan de estudios, salida laboral y especializaciones.`}
        image={textos.hero.imagen ?? heroImg}
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
      <Bloque id="hero">
      <PageHero
        imageSmall={textos.hero.imagen ? undefined : heroSm}
        image={textos.hero.imagen ?? heroImg}
        size="lg"
        title={textos.hero.titulo}
        subtitle={textos.hero.subtitulo}
        breadcrumbs={[{ name: 'Inicio', path: '/' }, { name: 'La carrera' }]}
      />
      </Bloque>

      <Bloque id="intro">
      <Section>
        <Feature
          title={textos.intro.titulo}
          image={textos.intro.imagen ?? introImg}
          video={textos.intro.video}
          imageAlt={altFoto(textos.intro, 'Profesor de educación física trabajando con alumnos')}
          actions={<Button to="/especializaciones">Ver talleres</Button>}
        >
          <Prose text={textos.intro.texto} />
        </Feature>
      </Section>
      </Bloque>

      <Bloque id="especializaciones">
      {enCarrera.length > 0 && (
        <Section tone="tint" width="wide" labelledBy="esp-title">
          <SectionHeader id="esp-title" title={textos.especializaciones.titulo} lead={<Markdown text={textos.especializaciones.texto} />} />
          <Reveal>
            <Carousel label="Especializaciones destacadas">
              {enCarrera.map((c) => (
                <CourseCard key={c.slug} curso={c} />
              ))}
            </Carousel>
          </Reveal>
        </Section>
      )}
      </Bloque>

      <Bloque id="datos">
      <Section labelledBy="datos-title">
        <SectionHeader id="datos-title" title={textos.datos.titulo} />
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
      </Bloque>

      <Bloque id="validez">
      <Section tone="dark" labelledBy="validez-title">
        <div className={styles.validez}>
          <SectionHeader
            id="validez-title"
            eyebrow={plan.resolucion}
            title={textos.validez.titulo}
            lead={<Markdown text={textos.validez.texto} />}
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
      </Bloque>

      <Bloque id="plan">
      <Section id="plan" tone="tint" labelledBy="plan-title">
        <SectionHeader
          id="plan-title"
          title={textos.plan.titulo}
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
      </Bloque>

      <Bloque id="gabinete">
      <Section image={textos.gabinete.imagen ?? gabineteImg} width="prose" labelledBy="gabinete-title">
        <SectionHeader id="gabinete-title" align="center" title={textos.gabinete.titulo} lead={<Markdown text={textos.gabinete.texto} />} />
      </Section>
      </Bloque>

      <Bloque id="explora">
      <Section width="wide" labelledBy="explora-title">
        <SectionHeader
          id="explora-title"
          title={textos.explora.titulo}
          lead={<Markdown text={textos.explora.texto} />}
        />
        <Reveal>
          <MediaGallery label="Galería de lugares de práctica" items={galeria.imagenes.map((g) => ({ ...g, titulo: g.lugar }))} />
        </Reveal>
      </Section>
      </Bloque>
    </>
  );
}
