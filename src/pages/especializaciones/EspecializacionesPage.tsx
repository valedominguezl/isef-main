import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import heroImg from '@/assets/media/especializaciones/main.webp';
import heroSm from '@/assets/media/especializaciones/main-800.webp';
import introImg from '@/assets/media/especializaciones/intro.webp';
import { cursos, disertantes, nombreCompleto } from '@/content';
import { normalize } from '@/lib/format';
import { toPlainText } from '@/lib/markdown';
import Seo, { breadcrumbJsonLd } from '@/components/seo/Seo';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import Feature from '@/components/ui/Feature';
import Reveal, { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import CourseCard from '@/components/cards/CourseCard';
import SpeakerCard from '@/components/cards/SpeakerCard';
import styles from './EspecializacionesPage.module.scss';

const searchable = cursos.map((c) => ({
  curso: c,
  text: normalize(
    [c.titulo, c.subtitulo, toPlainText(c.descripcion), c.modalidad, ...c.temario.flatMap((t) => [t.tema, ...t.subtemas]), ...c.disertantes.map((d) => disertantes.find((x) => x.slug === d)?.nombre ?? '')].join(' '),
  ),
}));

export function Component() {
  const [q, setQ] = useState('');
  const [dis, setDis] = useState<string | null>(null);
  const list = useMemo(() => {
    const terms = normalize(q.trim()).split(/\s+/).filter(Boolean);
    return searchable.filter((s) => (!dis || s.curso.disertantes.includes(dis)) && terms.every((t) => s.text.includes(t))).map((s) => s.curso);
  }, [q, dis]);
  const conCursos = disertantes.filter((d) => cursos.some((c) => c.disertantes.includes(d.slug)));

  return (
    <>
      <Seo
        title="Especializaciones y cursos"
        description="Cursos y talleres gratuitos para alumnos del profesorado, dictados por científicos de renombre: neurociencias, nutrición deportiva, fuerza, salud, inteligencia artificial y más."
        image={heroImg}
        jsonLd={[
          {
            '@type': 'ItemList',
            name: 'Especializaciones del I.S.E.F. San Luis',
            itemListElement: cursos.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: `https://isefsanluis.net/especializaciones/${c.slug}`, name: c.titulo })),
          },
          breadcrumbJsonLd([
            { name: 'Inicio', path: '/' },
            { name: 'Especializaciones', path: '/especializaciones' },
          ]),
        ]}
      />
      <PageHero
        imageSmall={heroSm}
        image={heroImg}
        size="lg"
        title="Especializaciones"
        subtitle="Conocé lo que nos hace únicos"
        breadcrumbs={[{ name: 'Inicio', path: '/' }, { name: 'Especializaciones' }]}
      />

      <Section>
        <Feature eyebrow="I.S.E.F. San Luis · Te hacemos destacar" title="Siempre con las *últimas novedades*" image={introImg} imageAlt="Clase de especialización">
          <p>
            La <strong>intervención sobre las enfermedades debe empezar en la niñez</strong>: la obesidad se relaciona con un mayor riesgo de
            desarrollar trece tipos de cáncer, entre ellos el <strong>cáncer de mama</strong> en mujeres posmenopáusicas, de colon, de páncreas o
            de <strong>tiroides</strong>.
          </p>
          <p>
            Las neurociencias, pilar de esta formación, te brindan herramientas para comprender <strong>cómo el cerebro responde al ejercicio</strong>{' '}
            y cómo influye en el desarrollo cognitivo, emocional y físico de cada etapa.
          </p>
          <p>
            Con talleres dictados por <strong>científicos de renombre internacional</strong> combinamos ciencias del deporte y neurociencias en{' '}
            <strong>temáticas actualizadas</strong>. Por eso, en el I.S.E.F. San Luis, te abrimos <strong>caminos nunca antes pensados</strong>.
          </p>
        </Feature>
      </Section>

      <Section id="disertantes" tone="tint" width="wide" labelledBy="dis-title">
        <SectionHeader
          id="dis-title"
          align="center"
          title="Conocé a los *disertantes*"
          lead={
            <p>
              Ellos son quienes impulsan tu carrera para que estés <strong>a la altura de los estándares internacionales</strong>. Todos sus
              currículums siguen el mismo formato.
            </p>
          }
        />
        <RevealGroup className={styles.speakers}>
          {disertantes.map((d) => (
            <RevealItem key={d.slug}>
              <SpeakerCard disertante={d} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section id="cursos" width="wide" labelledBy="cursos-title">
        <SectionHeader id="cursos-title" align="center" title="Nuestras *especializaciones*" lead="Toda la información detallada de cada curso: temario, modalidad, fechas y disertantes." />

        <Reveal className={styles.filters}>
          <label className={styles.search}>
            <Search size={18} aria-hidden />
            <span className="sr-only">Buscar cursos</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por tema, disertante o contenido del temario…" />
          </label>
          <div className={styles.chips} role="group" aria-label="Filtrar por disertante">
            <button type="button" aria-pressed={!dis} onClick={() => setDis(null)}>
              Todos
            </button>
            {conCursos.map((d) => (
              <button key={d.slug} type="button" aria-pressed={dis === d.slug} onClick={() => setDis(dis === d.slug ? null : d.slug)}>
                {nombreCompleto(d)}
              </button>
            ))}
          </div>
        </Reveal>

        <p className={styles.count} aria-live="polite">
          {list.length === cursos.length ? `${list.length} cursos` : `${list.length} de ${cursos.length} cursos`}
          {(q || dis) && (
            <button
              type="button"
              onClick={() => {
                setQ('');
                setDis(null);
              }}
            >
              <X size={14} aria-hidden /> Limpiar filtros
            </button>
          )}
        </p>

        {list.length ? (
          <ul className={styles.grid} role="list" key={dis ?? "todos"}>
            {list.map((c, i) => (
              <li key={c.slug} style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                <CourseCard curso={c} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>¡Disculpá! No encontramos cursos sobre eso. Probá con otra palabra.</p>
        )}
      </Section>
    </>
  );
}
