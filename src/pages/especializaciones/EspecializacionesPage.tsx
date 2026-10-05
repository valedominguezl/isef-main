import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
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
import Reveal, { RevealItem } from '@/components/ui/Reveal';
import CourseCard from '@/components/cards/CourseCard';
import SpeakerCard from '@/components/cards/SpeakerCard';
import Button from '@/components/ui/Button';
import SearchField from '@/components/ui/SearchField';
import ChipGroup from '@/components/ui/Chips';
import CardGrid from '@/components/ui/CardGrid';
import { useDebounced } from '@/lib/useDebounced';
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
  const [todosDis, setTodosDis] = useState(false);
  const DIS_INICIALES = 3;
  const query = useDebounced(q);
  const list = useMemo(() => {
    const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
    return searchable.filter((s) => (!dis || s.curso.disertantes.includes(dis)) && terms.every((t) => s.text.includes(t))).map((s) => s.curso);
  }, [query, dis]);
  const conCursos = disertantes.filter((d) => cursos.some((c) => c.disertantes.includes(d.slug)));

  return (
    <>
      <Seo
        title="Especializaciones y cursos"
        description="Cursos y talleres gratuitos para alumnos con científicos de renombre: neurociencias, nutrición deportiva, fuerza, salud e inteligencia artificial."
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
        <Feature title="Siempre con las *últimas novedades*" image={introImg} imageAlt="Clase de especialización">
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
              Ellos son quienes impulsan tu carrera para que estés <strong>a la altura de los estándares internacionales</strong>.
            </p>
          }
        />
        <CardGrid reveal dense>
          {disertantes.slice(0, DIS_INICIALES).map((d) => (
            <RevealItem key={d.slug}>
              <SpeakerCard disertante={d} />
            </RevealItem>
          ))}
        </CardGrid>
        {/* El resto aparece al pedirlo, con la misma entrada escalonada */}
        {todosDis && (
          <CardGrid reveal dense className={styles.speakersMore}>
            {disertantes.slice(DIS_INICIALES).map((d) => (
              <RevealItem key={d.slug}>
                <SpeakerCard disertante={d} />
              </RevealItem>
            ))}
          </CardGrid>
        )}
        {!todosDis && disertantes.length > DIS_INICIALES && (
          <div className={styles.more}>
            <Button variant="outline" icon="none" leading={<Plus size={18} aria-hidden />} onClick={() => setTodosDis(true)}>
              Ver más disertantes ({disertantes.length - DIS_INICIALES})
            </Button>
          </div>
        )}
      </Section>

      <Section id="cursos" width="wide" labelledBy="cursos-title">
        <SectionHeader id="cursos-title" align="center" title="Nuestras *especializaciones*" lead="Toda la información detallada de cada curso: temario, modalidad, fechas y disertantes." />

        <Reveal className={styles.filters}>
          <SearchField value={q} onChange={setQ} pending={q !== query} label="Buscar cursos" placeholder="Buscar por tema, disertante o contenido del temario…" />
          <ChipGroup
            label="Filtrar por disertante"
            align="center"
            value={dis}
            onChange={setDis}
            all={{ label: 'Todos' }}
            options={conCursos.map((d) => ({ value: d.slug, label: nombreCompleto(d) }))}
          />
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
          <CardGrid as="ul" role="list" className={[styles.results, q !== query && styles.pending].filter(Boolean).join(' ')} key={`${dis ?? 'todos'}|${query}`}>
            {list.map((c, i) => (
              <li key={c.slug} style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}>
                <CourseCard curso={c} />
              </li>
            ))}
          </CardGrid>
        ) : (
          <p className={styles.empty}>¡Disculpá! No encontramos cursos sobre eso. Probá con otra palabra.</p>
        )}
      </Section>
    </>
  );
}
