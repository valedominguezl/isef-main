import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { EyeOff, Plus, Search, Star } from 'lucide-react';
import { normalize } from '@/lib/format';
import { useAdmin } from '../AdminContext';
import { getCollection } from '../config';
import { useEntries } from '../useEntries';
import { SkeletonRows } from './Skeleton';
import styles from '../Admin.module.scss';

export default function CollectionList() {
  const { key = '' } = useParams();
  const col = getCollection(key);
  const { entries, error } = useEntries(col?.dir);
  const { pending, mediaUrl } = useAdmin();
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    if (!entries || !col) return [];
    const n = normalize(q);
    const sorted = [...entries].sort((a, b) => (col.sort ? col.sort(a.data, b.data) : String(a.data[col.titleField]).localeCompare(String(b.data[col.titleField]))));
    return sorted.filter((e) => !n || normalize(JSON.stringify(e.data)).includes(n));
  }, [entries, col, q]);

  if (!col) return <p>Colección desconocida.</p>;
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
                {e.data.destacado === true && <Star size={18} fill="currentColor" className={styles.rowStar} aria-label="Destacado" />}
                {e.data.publicado === false && (
                  <span className={styles.tag}>
                    <EyeOff size={12} /> Oculto
                  </span>
                )}
                {isPending && <span className={styles.tagWarn}>Sin publicar</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
