import { Link } from 'react-router';
import { AlertTriangle, ArrowRight, GraduationCap, Newspaper, Plus, Users } from 'lucide-react';
import { useEntries } from '../useEntries';
import InscripcionesCard from './InscripcionesCard';
import { Sk } from './Skeleton';
import styles from '../Admin.module.scss';

export default function Dashboard() {
  const { entries: nov } = useEntries('content/novedades');
  const { entries: cur } = useEntries('content/cursos');
  const { entries: dis } = useEntries('content/disertantes');
  const { entries: cvs } = useEntries('content/cv');

  // Chequeos de salud del contenido
  const alerts: { text: string; to: string }[] = [];
  cur?.forEach((c) => {
    if (!c.data.imagen) alerts.push({ text: `"${c.data.titulo}" no tiene imagen.`, to: `/admin/c/cursos/${c.slug}` });
  });
  dis?.forEach((d) => {
    const cv = cvs?.find((x) => x.slug === d.slug);
    const n = ((cv?.data.secciones as { items: unknown[] }[]) ?? []).reduce((a, s) => a + s.items.length, 0);
    if (cvs && n === 0) alerts.push({ text: `${d.data.nombre} no tiene el currículum cargado.`, to: `/admin/c/disertantes/${d.slug}?tab=cv` });
  });
  const lastNov = nov?.map((n) => String(n.data.fecha)).sort().pop();
  if (lastNov && Date.now() - new Date(lastNov).getTime() > 60 * 864e5)
    alerts.push({ text: `La última novedad es del ${lastNov}. ¡Publicá algo nuevo para mantener el sitio activo!`, to: '/admin/c/novedades/nueva' });

  const cards = [
    { label: 'Novedades', n: nov?.length, icon: Newspaper, to: '/admin/c/novedades', add: '/admin/c/novedades/nueva' },
    { label: 'Especializaciones', n: cur?.length, icon: GraduationCap, to: '/admin/c/cursos', add: '/admin/c/cursos/nueva' },
    { label: 'Disertantes', n: dis?.length, icon: Users, to: '/admin/c/disertantes', add: '/admin/c/disertantes/nueva' },
  ];

  return (
    <>
      <div className={styles.pageHead}>
        <h1>Hola</h1>
      </div>
      <InscripcionesCard />
      <div className={styles.stats}>
        {cards.map(({ label, n, icon: Icon, to, add }) => (
          <div key={label} className={styles.statCard}>
            <Icon size={22} />
            <strong>{n ?? <Sk w={48} h={36} />}</strong>
            <span>{label}</span>
            <div>
              <Link to={to}>
                Ver <ArrowRight size={14} />
              </Link>
              <Link to={add}>
                <Plus size={14} /> Agregar
              </Link>
            </div>
          </div>
        ))}
      </div>
      <section className={styles.panel}>
        <h2>
          <AlertTriangle size={18} /> Para revisar {alerts.length > 0 && <span className={styles.badge}>{alerts.length}</span>}
        </h2>
        {!cur || !dis || !nov ? (
          <div className={styles.skStack} aria-busy="true">
            <Sk w="70%" h={14} />
            <Sk w="55%" h={14} />
          </div>
        ) : alerts.length ? (
          <ul className={styles.alerts}>
            {alerts.map((a, i) => (
              <li key={i}>
                <Link to={a.to}>
                  {a.text} <ArrowRight size={14} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.help}>Todo en orden.</p>
        )}
      </section>
    </>
  );
}
