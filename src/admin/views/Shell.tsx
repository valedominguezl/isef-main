import { useCallback, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { CheckCircle2, CircleDashed, ExternalLink, LayoutDashboard, LogOut, UploadCloud, XCircle } from 'lucide-react';
import logo from '@/assets/logo.webp';
import { useAdmin } from '../AdminContext';
import { COLLECTIONS, SINGLETONS } from '../config';
import { PAGINAS, PAGINA_KEYS } from '../paginasConfig';
import { Button } from '../ui/Button';
import { ConfirmProvider } from '../ui/ConfirmDialog';
import { ToastProvider } from '../ui/Toaster';
import PendingDrawer from './PendingDrawer';
import styles from '../Admin.module.scss';

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
  const { logout, pending } = useAdmin();
  const [drawer, setDrawer] = useState(false);
  const openPending = useCallback(() => setDrawer(true), []);
  const { pathname } = useLocation();
  const link = ({ isActive }: { isActive: boolean }) => (isActive ? styles.navActive : undefined);

  return (
    <ConfirmProvider>
    <ToastProvider onOpenPending={openPending}>
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
          {COLLECTIONS.filter((c) => !c.hidden).map(({ key, label, icon: Icon }) => (
            <NavLink key={key} to={`/admin/c/${key}`} className={link}>
              <Icon size={18} aria-hidden /> {label}
            </NavLink>
          ))}
          <p className={styles.navGroup}>Páginas</p>
          {PAGINAS.map(({ key, nav, icon: Icon, label }) => (
            <NavLink key={key} to={`/admin/s/${key}`} className={link} title={label}>
              <Icon size={18} aria-hidden /> {nav}
            </NavLink>
          ))}
          <p className={styles.navGroup}>Configuración</p>
          {SINGLETONS.filter((s) => !PAGINA_KEYS.has(s.key)).map(({ key, label, icon: Icon }) => (
            <NavLink key={key} to={`/admin/s/${key}`} className={link}>
              <Icon size={18} aria-hidden /> {label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.sideFoot}>
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink size={18} aria-hidden /> Ver el sitio
          </a>
          <button type="button" onClick={logout}>
            <LogOut size={18} aria-hidden /> Salir
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <DeployPill />
          <Button variant={pending.length ? 'primary' : 'secondary'} icon={pending.length ? UploadCloud : CheckCircle2} onClick={openPending}>
            {pending.length ? `Publicar ${pending.length} cambio${pending.length > 1 ? 's' : ''}` : 'Sin cambios pendientes'}
          </Button>
        </header>
        {/* Entrada suave de cada pantalla (la barra lateral y la superior no se mueven) */}
        <div key={pathname} className={`${styles.content} ${styles.viewIn}`}>
          {children}
        </div>
      </div>
      <PendingDrawer open={drawer} onClose={() => setDrawer(false)} />
    </div>
    </ToastProvider>
    </ConfirmProvider>
  );
}
