import { ArrowRight, BarChart3, ExternalLink, Info, Settings } from 'lucide-react';
import { useFile } from '../useEntries';
import { Button } from '../ui/Button';
import { Sk } from './Skeleton';
import styles from '../Admin.module.scss';

type Analytics = { ga4?: string; clarity?: string; tablero?: string };

/** Qué significa cada número del tablero, en palabras del equipo (los nombres técnicos van entre paréntesis para buscarlos en GA4). */
const GLOSARIO = [
  { nombre: 'Visitas', evento: 'page_view', texto: 'Veces que se abrió la página de cada curso.' },
  { nombre: 'Clics en la tarjeta', evento: 'curso_ver_mas', texto: 'Veces que alguien tocó un curso en el listado para ver más.' },
  {
    nombre: 'Consultas por WhatsApp',
    evento: 'whatsapp_click',
    texto: 'Veces que tocaron «Consultar» desde un curso. Es lo más parecido a una persona interesada.',
  },
  {
    nombre: 'Búsquedas sin resultados',
    evento: 'search · resultados = 0',
    texto: 'Lo que la gente buscó en el sitio y no encontró: ideas de cursos o información que falta.',
  },
];

/**
 * Estadísticas: el tablero de Looker Studio (enlace cargado en Datos del instituto → Analítica), qué significa
 * cada número y accesos a GA4, Clarity y Cloudflare. No consulta APIs: los datos viven en Google y Microsoft.
 */
export default function Estadisticas() {
  const { data } = useFile('content/sitio.json');
  const a = data ? ((data.analytics as Analytics | undefined) ?? {}) : undefined;

  const herramientas = [
    { label: 'Google Analytics: todas las visitas y de dónde llegan', href: 'https://analytics.google.com/' },
    a?.clarity && {
      label: 'Microsoft Clarity: mapas de calor y grabaciones (dónde tocan y hasta dónde bajan)',
      href: `https://clarity.microsoft.com/projects/view/${a.clarity}/dashboard`,
    },
    { label: 'Cloudflare Web Analytics: visitas totales, sin depender de las cookies', href: 'https://dash.cloudflare.com/?to=/:account/web-analytics' },
  ].filter((x): x is { label: string; href: string } => Boolean(x));

  return (
    <>
      <div className={styles.pageHead}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon} aria-hidden>
            <BarChart3 size={22} />
          </span>
          <div>
            <h1>Estadísticas</h1>
            <p className={styles.help}>Qué cursos despiertan más interés en el sitio.</p>
          </div>
        </div>
      </div>

      <section className={styles.panel}>
        <h2>
          <BarChart3 size={18} aria-hidden /> Interés por curso
        </h2>
        {!a ? (
          <div className={styles.skStack} aria-busy="true">
            <Sk w="60%" h={14} />
            <Sk w={180} h={40} />
          </div>
        ) : a.tablero ? (
          <>
            <p className={styles.statsTexto}>Visitas, clics y consultas de cada curso, más lo que la gente busca en el sitio. Se actualiza solo todos los días.</p>
            <Button variant="primary" icon={ExternalLink} href={a.tablero}>
              Abrir el tablero
            </Button>
          </>
        ) : (
          <>
            <p className={styles.statsTexto}>
              Todavía no está cargado el enlace del tablero. Se pega en <strong>Datos del instituto → Otros datos del sitio → Analítica</strong>.
            </p>
            <Button icon={Settings} to="/admin/s/sitio">
              Ir a Datos del instituto
            </Button>
          </>
        )}
      </section>

      <section className={styles.panel}>
        <h2>
          <Info size={18} aria-hidden /> Cómo leer los números
        </h2>
        <dl className={styles.glosario}>
          {GLOSARIO.map((g) => (
            <div key={g.nombre}>
              <dt>
                {g.nombre} <code>{g.evento}</code>
              </dt>
              <dd>{g.texto}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.statsAviso}>
          Solo cuentan las personas que aceptaron las cookies, así que los números reales son más altos. Sirven para <strong>comparar cursos entre sí</strong>, no
          como totales. Tampoco muestran inscripciones: esas pasan por WhatsApp y el campus. Con pocos datos (por ejemplo 9 contra 14), la diferencia puede ser casualidad.
        </p>
      </section>

      <section className={styles.panel}>
        <h2>
          <ExternalLink size={18} aria-hidden /> Más herramientas
        </h2>
        <ul className={styles.alerts}>
          {herramientas.map((h) => (
            <li key={h.href}>
              <a href={h.href} target="_blank" rel="noreferrer">
                {h.label} <ArrowRight size={14} aria-hidden />
                <span className="sr-only"> (se abre en otra pestaña)</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
