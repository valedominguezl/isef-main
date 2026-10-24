import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { AnimatePresence, m } from 'motion/react';
import { CheckCircle2, CircleDashed, ExternalLink, LayoutDashboard, LogOut, Menu, UploadCloud, X, XCircle } from 'lucide-react';
import logo from '@/assets/logo.webp';
import { DURATION, EASE_OUT, exit } from '@/lib/motion';
import { useModalFocus } from '@/lib/useModalFocus';
import { useAdmin } from '../AdminContext';
import { COLLECTIONS, SINGLETONS } from '../config';
import { PAGINAS, PAGINA_KEYS } from '../paginasConfig';
import { Button, IconButton } from '../ui/Button';
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
      {running ? <CircleDashed size={14} className={styles.spin} aria-hidden /> : ok ? <CheckCircle2 size={14} aria-hidden /> : <XCircle size={14} aria-hidden />}
      {running ? 'Publicando en el sitio…' : ok ? 'Sitio actualizado' : 'El último deploy falló'}
      <span className="sr-only"> (detalle en GitHub, se abre en otra pestaña)</span>
    </a>
  );
}

/** Secciones del panel (barra lateral, fila deslizable del celular y cajón del menú completo). */
function PanelNav({ label }: { label: string }) {
  const link = ({ isActive }: { isActive: boolean }) => (isActive ? styles.navActive : undefined);
  return (
    <nav aria-label={label}>
      <NavLink to="/admin" end className={link}>
        <LayoutDashboard size={18} aria-hidden /> Inicio
      </NavLink>
      <p className={styles.navGroup}>Principal</p>
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
  );
}

function SideFoot() {
  const { logout } = useAdmin();
  return (
    <div className={styles.sideFoot}>
      <a href="/" target="_blank" rel="noreferrer">
        <ExternalLink size={18} aria-hidden /> Ver el sitio
        <span className="sr-only"> (se abre en otra pestaña)</span>
      </a>
      <button type="button" onClick={logout}>
        <LogOut size={18} aria-hidden /> Salir
      </button>
    </div>
  );
}

const Brand = () => (
  <Link to="/admin" className={styles.brand}>
    <img src={logo} alt="" width={36} height={36} />
    <span>
      <strong>I.S.E.F.</strong>
      <small>Administración</small>
    </span>
  </Link>
);

/**
 * Celular: el menú completo (con sus grupos, «Ver el sitio» y «Salir») como cajón desde la izquierda.
 * Lo de atrás queda inerte, Escape lo cierra y el foco vuelve al botón ☰.
 */
function MenuCajon({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useModalFocus(open, ref);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>('[aria-current="page"], a')?.focus());
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <m.div
          className={styles.menuCajonFondo}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: DURATION.base, ease: EASE_OUT } }}
          exit={{ opacity: 0, transition: exit() }}
        >
          <m.aside
            ref={ref}
            className={`${styles.sidebar} ${styles.menuCajon}`}
            role="dialog"
            aria-modal="true"
            aria-label="Menú del panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0, transition: { duration: DURATION.base, ease: EASE_OUT } }}
            exit={{ x: '-100%', transition: exit() }}
          >
            <div className={styles.sideTop}>
              <Brand />
              <IconButton icon={X} label="Cerrar el menú" size={20} onClick={onClose} className={styles.menuToggle} />
            </div>
            <PanelNav label="Panel" />
            <SideFoot />
          </m.aside>
        </m.div>
      )}
    </AnimatePresence>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  const { pending } = useAdmin();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const cerrarMenu = useCallback(() => setMenu(false), []);
  const openPending = useCallback(() => setDrawer(true), []);
  const { pathname } = useLocation();
  const fila = useRef<HTMLDivElement>(null);

  // Al cambiar de pantalla: se cierra el menú y la fila deslizable muestra la sección actual
  useEffect(() => {
    setMenu(false);
    fila.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [pathname]);

  return (
    <ConfirmProvider>
    <ToastProvider onOpenPending={openPending}>
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <Brand />
          {/* Solo en celular/tablet: abre el menú completo (la fila de abajo es el atajo) */}
          <IconButton icon={Menu} label="Abrir el menú completo" size={20} onClick={() => setMenu(true)} aria-expanded={menu} className={styles.menuToggle} />
        </div>
        <div ref={fila} className={styles.navFila}>
          <PanelNav label="Panel" />
        </div>
        <SideFoot />
      </aside>
      <MenuCajon open={menu} onClose={cerrarMenu} />

      <div className={styles.main}>
        <header className={styles.topbar}>
          {/* Siempre montado: el paso de «Publicando…» a «Sitio actualizado» se anuncia */}
          <span role="status">
            <DeployPill />
          </span>
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
