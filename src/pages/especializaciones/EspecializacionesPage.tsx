import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import heroImg from '@/assets/media/especializaciones/main.webp';
import heroSm from '@/assets/media/especializaciones/main-800.webp';
import introImg from '@/assets/media/especializaciones/intro.webp';
import { cursos, disertantes, nombreCompleto, paginas } from '@/content';
import { normalize } from '@/lib/format';
import { Markdown, toPlainText } from '@/lib/markdown';
import Seo, { breadcrumbJsonLd } from '@/components/seo/Seo';
import Prose from '@/components/ui/Prose';
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

/** Textos y fotos editables desde /admin → Páginas → Especializaciones. */
const textos = paginas.especializaciones;

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
  // Los activos (se dictan este ciclo lectivo) van primero y separados de las ediciones anteriores (si no hay ninguno, una sola lista)
  const grupos = useMemo(() => {
    const actuales = list.filter((c) => c.activo === true);
    if (!actuales.length) return [{ titulo: null, cursos: list }];
    const anteriores = list.filter((c) => c.activo !== true);
    return [
      { titulo: 'Este ciclo lectivo', cursos: actuales },
      ...(anteriores.length ? [{ titulo: 'Ediciones anteriores', cursos: anteriores }] : []),
    ];
  }, [list]);
  const conCursos = disertantes.filter((d) => cursos.some((c) => c.disertantes.includes(d.slug)));

  return (
    <>
      <Seo
        title="Especializaciones y cursos"
        description="Cursos y talleres gratuitos para alumnos con científicos de renombre: neurociencias, nutrición deportiva, fuerza, salud e inteligencia artificial."
        image={textos.hero.imagen ?? heroImg}
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
        imageSmall={textos.hero.imagen ? undefined : heroSm}
        image={textos.hero.imagen ?? heroImg}
        size="lg"
        title={textos.hero.titulo}
        subtitle={textos.hero.subtitulo}
        breadcrumbs={[{ name: 'Inicio', path: '/' }, { name: 'Especializaciones' }]}
      />

      <Section>
        <Feature title={textos.intro.titulo} image={textos.intro.imagen ?? introImg} imageAlt="Clase de especialización">
          <Prose text={textos.intro.texto} />
        </Feature>
      </Section>

      <Section id="disertantes" tone="tint" width="wide" labelledBy="dis-title">
        <SectionHeader id="dis-title" align="center" title={textos.disertantes.titulo} lead={<Markdown text={textos.disertantes.texto} />} />
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
          grupos.map((g) => (
            <div key={g.titulo ?? 'todos'} className={styles.group}>
              {g.titulo && <h3 className={styles.groupTitle}>{g.titulo}</h3>}
              <CardGrid as="ul" role="list" className={[styles.results, q !== query && styles.pending].filter(Boolean).join(' ')} key={`${dis ?? 'todos'}|${query}`}>
                {g.cursos.map((c, i) => (
                  <li key={c.slug} style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}>
                    <CourseCard curso={c} />
                  </li>
                ))}
              </CardGrid>
            </div>
          ))
        ) : (
          <p className={styles.empty}>¡Disculpá! No encontramos cursos sobre eso. Probá con otra palabra.</p>
        )}
      </Section>
    </>
  );
}
