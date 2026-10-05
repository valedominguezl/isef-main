import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Plus, Search } from 'lucide-react';
import { normalize } from '@/lib/format';
import { useAdmin } from '../AdminContext';
import { getCollection, type QuickToggle } from '../config';
import { useEntries } from '../useEntries';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toaster';
import { SkeletonRows } from './Skeleton';
import QuickToggles, { avisoDe, quickValue } from './QuickToggles';
import { useLinkedQuick } from './useLinkedQuick';
import NuevoCursoIa from './CursoIa';
import styles from '../Admin.module.scss';

export default function CollectionList() {
  const { key = '' } = useParams();
  const col = getCollection(key);
  const { entries, error } = useEntries(col?.dir);
  const { pending, mediaUrl, stage } = useAdmin();
  const [q, setQ] = useState('');
  const linkedQuick = useLinkedQuick(col);
  const toast = useToast();

  if (!col) return <p>Colección desconocida.</p>;

  /**
   * Orden igual que en el sitio: Destacado → Activo → Inactivo (los ocultos quedan en su grupo).
   * Dentro de cada grupo manda el orden propio de la colección. Una novedad de un curso usa el estado del curso.
   */
  const conGrupos = col.quick?.some((t) => t.name === 'destacado' || t.name === 'activo');
  const grupo = (data: Record<string, unknown>) => {
    if (!conGrupos) return 0;
    const ln = linkedQuick(data);
    const valor = (name: string) => {
      const t = ln?.toggles.find((x) => x.name === name) ?? col.quick?.find((x) => x.name === name);
      return t ? quickValue(t, ln?.data ?? data) : name === 'activo';
    };
    return valor('destacado') ? 0 : valor('activo') ? 1 : 2;
  };
  const porColeccion = (a: Record<string, unknown>, b: Record<string, unknown>) =>
    col.sort ? col.sort(a, b) : String(a[col.titleField]).localeCompare(String(b[col.titleField]));
  const n = normalize(q);
  const list = (entries ?? [])
    .map((e) => ({ e, g: grupo(e.data) }))
    .sort((a, b) => a.g - b.g || porColeccion(a.e.data, b.e.data))
    .map(({ e }) => e)
    .filter((e) => !n || normalize(JSON.stringify(e.data)).includes(n));
  /** Cambia una opción básica desde la lista: queda como cambio pendiente (se publica con "Publicar") y se puede deshacer. */
  const toggle = (e: { path: string; data: Record<string, unknown> }, t: QuickToggle, value: boolean) => {
    const title = String(e.data[col.titleField] ?? '');
    const undo = stage([{ path: e.path, content: `${JSON.stringify({ ...e.data, [t.name]: value }, null, 2)}\n`, encoding: 'utf8', label: title }]);
    toast.show({ text: avisoDe(t, value, title), undo });
  };
  const imgField = col.fields.find((f) => f.type === 'image')?.name;

  return (
    <>
      <div className={styles.pageHead}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon} aria-hidden>
            <col.icon size={22} />
          </span>
          <div>
            <h1>{col.label}</h1>
            <p className={styles.help}>{entries ? `${entries.length} en total` : ' '}</p>
          </div>
        </div>
        <div className={styles.headActions}>
          {col.key === 'cursos' && <NuevoCursoIa />}
          <Button variant="primary" icon={Plus} to={`/admin/c/${col.key}/nueva`}>
            {col.newLabel}
          </Button>
        </div>
      </div>
      <label className={styles.search}>
        <Search size={16} aria-hidden />
        <input type="search" placeholder={`Buscar en ${col.label.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" />
      </label>
      {error && <p className={styles.error}>{error}</p>}
      {!entries && !error && <SkeletonRows />}
      <ul className={styles.rows}>
        {list.map((e) => {
          const isPending = pending.some((p) => p.path === e.path);
          const img = imgField ? mediaUrl(e.data[imgField] as string | undefined) : undefined;
          return (
            <li key={e.slug}>
              <Link to={`/admin/c/${col.key}/${e.slug}`}>
                <span className={styles.thumb}>{img && <img src={img} alt="" loading="lazy" />}</span>
                <span className={styles.rowText}>
                  <strong>{String(e.data[col.titleField] ?? e.slug)}</strong>
                  <small>{col.subtitle?.(e.data)}</small>
                </span>
                {isPending && <span className={styles.tagWarn}>Sin publicar</span>}
              </Link>
              {col.quick &&
                (() => {
                  const ln = linkedQuick(e.data);
                  return ln ? (
                    <QuickToggles compact toggles={ln.toggles} data={ln.data} onChange={ln.onChange} sincronizado={ln.titulo} />
                  ) : (
                    <QuickToggles compact toggles={col.quick} data={e.data} onChange={(t, v) => toggle(e, t, v)} />
                  );
                })()}
            </li>
          );
        })}
      </ul>
    </>
  );
}
