import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import heroImg from '@/assets/media/especializaciones/main.webp';
import heroSm from '@/assets/media/especializaciones/main-800.webp';
import introImg from '@/assets/media/especializaciones/intro.webp';
import { cursos, disertantes, nombreCompleto, paginas } from '@/content';
import { altFoto } from '@/content/paginas';
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
  const searchRef = useRef<HTMLInputElement>(null);
  const masRef = useRef<HTMLDivElement>(null);
  // Al mostrar el resto de los disertantes, el foco pasa al primero nuevo (el botón desaparece)
  useEffect(() => {
    if (todosDis) masRef.current?.querySelector('a')?.focus({ preventScroll: true });
  }, [todosDis]);
  const list = useMemo(() => {
    const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
    return searchable.filter((s) => (!dis || s.curso.disertantes.includes(dis)) && terms.every((t) => s.text.includes(t))).map((s) => s.curso);
  }, [query, dis]);
  // Destacados → este ciclo lectivo (activos) → ediciones anteriores. Con un solo grupo, sin títulos.
  const grupos = useMemo(() => {
    const g = [
      { titulo: 'Destacados', cursos: list.filter((c) => c.destacado === true) },
      { titulo: 'Este ciclo lectivo', cursos: list.filter((c) => c.destacado !== true && c.activo === true) },
      { titulo: 'Ediciones anteriores', cursos: list.filter((c) => c.destacado !== true && c.activo !== true) },
    ].filter((x) => x.cursos.length);
    return g.length > 1 ? g : [{ titulo: null, cursos: list }];
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
        <Feature title={textos.intro.titulo} image={textos.intro.imagen ?? introImg} imageAlt={altFoto(textos.intro, 'Clase de especialización')}>
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
          <div ref={masRef}>
            <CardGrid reveal dense className={styles.speakersMore}>
              {disertantes.slice(DIS_INICIALES).map((d) => (
                <RevealItem key={d.slug}>
                  <SpeakerCard disertante={d} />
                </RevealItem>
              ))}
            </CardGrid>
          </div>
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
          <SearchField inputRef={searchRef} value={q} onChange={setQ} pending={q !== query} label="Buscar cursos" placeholder="Buscar por tema, disertante o contenido del temario…" />
          <ChipGroup
            label="Filtrar por disertante"
            align="center"
            value={dis}
            onChange={setDis}
            all={{ label: 'Todos' }}
            options={conCursos.map((d) => ({ value: d.slug, label: nombreCompleto(d) }))}
          />
        </Reveal>

        {/* Solo el texto es región viva (el botón queda afuera: si no, también se anunciaba) */}
        <div className={styles.count}>
          <p role="status">{list.length === cursos.length ? `${list.length} cursos` : `${list.length} de ${cursos.length} cursos`}</p>
          {(q || dis) && (
            <button
              type="button"
              onClick={() => {
                setQ('');
                setDis(null);
                searchRef.current?.focus(); // el botón desaparece: el foco vuelve al buscador
              }}
            >
              <X size={14} aria-hidden /> Limpiar filtros
            </button>
          )}
        </div>

        {list.length ? (
          grupos.map((g) => (
            <div key={g.titulo ?? 'todos'} className={styles.group}>
              {g.titulo && <h3 className={styles.groupTitle}>{g.titulo}</h3>}
              <CardGrid as="ul" role="list" className={[styles.results, q !== query && styles.pending].filter(Boolean).join(' ')} key={`${dis ?? 'todos'}|${query}`}>
                {g.cursos.map((c, i) => (
                  <li key={c.slug} style={{ '--i': i } as React.CSSProperties}>
                    {/* Con títulos de grupo (h3), cada curso baja a h4 */}
                    <CourseCard curso={c} headingLevel={g.titulo ? 4 : 3} />
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
