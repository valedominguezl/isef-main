import styles from '../Admin.module.scss';

/** Bloque gris con brillo: ocupa el lugar del contenido mientras carga (sin saltos ni pantallas vacías). */
export function Sk({ w = '100%', h = 16, r }: { w?: number | string; h?: number | string; r?: number | string }) {
  return <span className={styles.sk} style={{ width: w, height: h, borderRadius: r }} aria-hidden />;
}

export function SkeletonHead() {
  return (
    <div className={styles.pageHead} aria-hidden>
      <div className={styles.skStack}>
        <Sk w={260} h={34} />
        <Sk w={180} h={14} />
      </div>
      <Sk w={150} h={42} r={10} />
    </div>
  );
}

export function SkeletonRows({ n = 6 }: { n?: number }) {
  return (
    <ul className={styles.rows} aria-busy="true" aria-label="Cargando">
      {Array.from({ length: n }, (_, i) => (
        <li key={i}>
          <span className={styles.skRow}>
            <Sk w={56} h={42} r={8} />
            <span className={styles.skStack}>
              <Sk w={`${60 - (i % 3) * 10}%`} h={16} />
              <Sk w="35%" h={12} />
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function SkeletonForm({ sections = 3 }: { sections?: number }) {
  return (
    <div className={styles.form} aria-busy="true" aria-label="Cargando">
      {Array.from({ length: sections }, (_, i) => (
        <div key={i} className={styles.skCard}>
          <Sk w={180} h={18} />
          <Sk h={44} r={10} />
          <Sk w="70%" h={44} r={10} />
        </div>
      ))}
    </div>
  );
}

/** Esqueleto del panel completo (mientras se verifica la sesión). */
export function SkeletonShell() {
  return (
    <div className={styles.shell} aria-busy="true" aria-label="Cargando el panel">
      <aside className={styles.sidebar}>
        <div className={styles.skSide}>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className={styles.skSideItem} />
          ))}
        </div>
      </aside>
      <div className={styles.main}>
        <header className={styles.topbar} />
        <div className={styles.content}>
          <SkeletonHead />
          <SkeletonForm sections={2} />
        </div>
      </div>
    </div>
  );
}
