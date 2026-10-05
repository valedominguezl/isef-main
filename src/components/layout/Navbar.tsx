import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, m } from 'motion/react';
import { ExternalLink, Menu, Search, X } from 'lucide-react';
import logo from '@/assets/logo.webp';
import { sitio, inscripcionesVigentes } from '@/content';
import { useSearch } from '@/features/search/SearchContext';
import { socialIcon } from '../ui/Icons';
import Button from '../ui/Button';
import { MAIN_NAV, SECONDARY_NAV } from './nav';
import InscripcionesAviso from './InscripcionesAviso';
import styles from './Navbar.module.scss';

export type NavTheme = 'overlay' | 'solid';

/** Barra fija, siempre blanca (no se esconde ni cambia al desplazarse). */
export default function Navbar(_props: { theme?: NavTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { open: openSearch } = useSearch();

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header className={styles.header}>
        <InscripcionesAviso />
        <nav className={styles.nav} aria-label="Principal">
          <Link to="/" className={styles.brand} aria-label={`${sitio.nombre} — Inicio`}>
            <img src={logo} alt="" width={48} height={48} />
            <span>{sitio.nombre}</span>
          </Link>

          <ul className={styles.links} role="list">
            {MAIN_NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => [styles.link, isActive && styles.active].filter(Boolean).join(' ')}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <button type="button" className={styles.search} onClick={openSearch} aria-label="Buscar en el sitio (atajo: /)">
              <Search size={20} aria-hidden />
              <span className={styles.searchLabel}>Buscar</span>
              <kbd className={styles.kbd}>/</kbd>
            </button>
            {inscripcionesVigentes() && (
              <Button to="/inscripciones" size="sm" icon="none" className={styles.cta}>
                Inscribite
              </Button>
            )}
            <Button href={sitio.campusUrl} target="_blank" rel="noopener noreferrer" size="sm" variant="outline" icon="none" className={styles.campus}>
              Campus virtual
            </Button>
            <button
              type="button"
              className={styles.menuBtn}
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
            >
              <Menu size={22} aria-hidden />
              <span>Menú</span>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <m.div
            id="menu-movil"
            className={`${styles.menu} on-dark`}
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            // Círculo que crece desde fuera de la pantalla (arriba a la derecha): no se ve el punto de origen.
            // Cierra más rápido de lo que abre.
            initial={{ clipPath: 'circle(0px at calc(100% + 120px) -120px)' }}
            animate={{ clipPath: 'circle(170vmax at calc(100% + 120px) -120px)', transition: { duration: 0.7, ease: [0.32, 0.72, 0, 1] } }}
            exit={{ clipPath: 'circle(0px at calc(100% + 120px) -120px)', transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] } }}
          >
            <div className={styles.menuTop}>
              <Link to="/" className={styles.brand}>
                <img src={logo} alt="" width={48} height={48} />
                <span>{sitio.nombre}</span>
              </Link>
              <button type="button" className={styles.closeBtn} onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" autoFocus>
                <X size={26} />
              </button>
            </div>
            <m.ul
              className={styles.menuList}
              role="list"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}
            >
              {[{ label: 'Inicio', to: '/' }, ...MAIN_NAV].map((item) => (
                <m.li
                  key={item.to}
                  variants={{
                    hidden: { opacity: 0, transform: 'translateY(16px)' },
                    show: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
                  }}
                >
                  <NavLink to={item.to} end={item.to === '/'} className={({ isActive }) => (isActive ? styles.menuActive : undefined)}>
                    {item.label}
                  </NavLink>
                </m.li>
              ))}
            </m.ul>
            <div className={styles.menuCtas}>
              {inscripcionesVigentes() && (
                <Button to="/inscripciones" variant="light" size="lg" leading={<span aria-hidden>🚀</span>}>
                  Inscribite ya
                </Button>
              )}
              <Button href={sitio.campusUrl} target="_blank" rel="noopener noreferrer" variant="outline-light" size="lg" icon="none">
                Campus virtual
              </Button>
            </div>
            <div className={styles.menuFooter}>
              <ul className={styles.menuSecondary} role="list">
                {SECONDARY_NAV.filter((item) => item.to !== sitio.campusUrl).map((item) => (
                  <li key={item.to}>
                    {item.external ? (
                      <a href={item.to} target="_blank" rel="noopener noreferrer">
                        {item.label} <ExternalLink size={14} aria-hidden />
                      </a>
                    ) : (
                      <Link to={item.to}>{item.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
              <ul className={styles.social} role="list">
                {sitio.redes.map((r) => {
                  const Icon = socialIcon[r.red];
                  return (
                    <li key={r.url}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" aria-label={`${r.red} ${r.etiqueta}`}>
                        <Icon size={20} />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
