import { useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BookOpen, CheckCircle2, CircleDashed, ExternalLink, GraduationCap, LayoutDashboard, LogOut, Newspaper, Settings2, UploadCloud, Users, XCircle } from 'lucide-react';
import logo from '@/assets/logo.webp';
import { useAdmin } from '../AdminContext';
import { SINGLETONS } from '../config';
import PendingDrawer from './PendingDrawer';
import styles from '../Admin.module.scss';

const ICONS: Record<string, typeof Newspaper> = { novedades: Newspaper, cursos: GraduationCap, disertantes: Users };

function DeployPill() {
  const { deploy, mode } = useAdmin();
  if (mode === 'local') return <span className={styles.pill}>Modo local · los cambios se escriben en tu disco</span>;
  if (!deploy) return null;
  const running = deploy.status !== 'completed';
  const ok = deploy.conclusion === 'success';
  return (
    <a href={deploy.url} target="_blank" rel="noreferrer" className={[styles.pill, running ? styles.pillRun : ok ? styles.pillOk : styles.pillBad].join(' ')}>
      {running ? <CircleDashed size={14} className={styles.spin} /> : ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      {running ? 'Publicando en el sitio…' : ok ? 'Sitio actualizado' : 'El último deploy falló'}
    </a>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  const { user, logout, pending } = useAdmin();
  const [drawer, setDrawer] = useState(false);
  const { pathname } = useLocation();
  const link = ({ isActive }: { isActive: boolean }) => (isActive ? styles.navActive : undefined);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to="/admin" className={styles.brand}>
          <img src={logo} alt="" width={36} height={36} />
          <span>
            <strong>I.S.E.F.</strong>
            <small>Administración</small>
          </span>
        </Link>
        <nav aria-label="Panel">
          <NavLink to="/admin" end className={link}>
            <LayoutDashboard size={18} /> Inicio
          </NavLink>
          <p className={styles.navGroup}>Contenido</p>
          {(['novedades', 'cursos', 'disertantes'] as const).map((k) => {
            const Icon = ICONS[k];
            return (
              <NavLink key={k} to={`/admin/c/${k}`} className={link}>
                <Icon size={18} /> {k === 'cursos' ? 'Especializaciones' : k[0].toUpperCase() + k.slice(1)}
              </NavLink>
            );
          })}
          <p className={styles.navGroup}>Configuración</p>
          {SINGLETONS.map((s) => (
            <NavLink key={s.key} to={`/admin/s/${s.key}`} className={link}>
              {s.key === 'sitio' ? <Settings2 size={18} /> : <BookOpen size={18} />} {s.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.sideFoot}>
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> Ver el sitio
          </a>
          <button type="button" onClick={logout}>
            <LogOut size={16} /> Salir ({user})
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <DeployPill />
          <button type="button" className={pending.length ? styles.btnPrimary : styles.btnSecondary} onClick={() => setDrawer(true)}>
            <UploadCloud size={18} />
            {pending.length ? `Publicar ${pending.length} cambio${pending.length > 1 ? 's' : ''}` : 'Sin cambios pendientes'}
          </button>
        </header>
        {/* Entrada suave de cada pantalla (la barra lateral y la superior no se mueven) */}
        <div key={pathname} className={`${styles.content} ${styles.viewIn}`}>
          {children}
        </div>
      </div>
      <PendingDrawer open={drawer} onClose={() => setDrawer(false)} />
    </div>
  );
}
