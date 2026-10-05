import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Plus, Search } from 'lucide-react';
import { normalize } from '@/lib/format';
import { useAdmin } from '../AdminContext';
import { getCollection } from '../config';
import { useEntries } from '../useEntries';
import { SkeletonRows } from './Skeleton';
import QuickToggles from './QuickToggles';
import { useLinkedQuick } from './useLinkedQuick';
import styles from '../Admin.module.scss';

export default function CollectionList() {
  const { key = '' } = useParams();
  const col = getCollection(key);
  const { entries, error } = useEntries(col?.dir);
  const { pending, mediaUrl, stage } = useAdmin();
  const [q, setQ] = useState('');
  const linkedQuick = useLinkedQuick(col);

  const list = useMemo(() => {
    if (!entries || !col) return [];
    const n = normalize(q);
    const sorted = [...entries].sort((a, b) => (col.sort ? col.sort(a.data, b.data) : String(a.data[col.titleField]).localeCompare(String(b.data[col.titleField]))));
    return sorted.filter((e) => !n || normalize(JSON.stringify(e.data)).includes(n));
  }, [entries, col, q]);

  if (!col) return <p>Colección desconocida.</p>;
  /** Cambia una opción básica desde la lista: queda como cambio pendiente (se publica con "Publicar"). */
  const toggle = (e: { path: string; data: Record<string, unknown> }, name: string, value: boolean) =>
    stage([{ path: e.path, content: `${JSON.stringify({ ...e.data, [name]: value }, null, 2)}
`, encoding: 'utf8', label: String(e.data[col.titleField] ?? '') }]);
  const imgField = col.fields.find((f) => f.type === 'image')?.name;

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1>{col.label}</h1>
          <p className={styles.help}>{entries ? `${entries.length} en total` : ' '}</p>
        </div>
        <Link to={`/admin/c/${col.key}/nueva`} className={styles.btnPrimary}>
          <Plus size={18} /> {col.newLabel}
        </Link>
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
                    <QuickToggles compact toggles={col.quick} data={e.data} onChange={(name, v) => toggle(e, name, v)} />
                  );
                })()}
            </li>
          );
        })}
      </ul>
    </>
  );
}
