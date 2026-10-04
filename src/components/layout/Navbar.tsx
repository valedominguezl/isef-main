import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, m } from 'motion/react';
import { ExternalLink, Menu, Search, X } from 'lucide-react';
import logo from '@/assets/logo.webp';
import { sitio } from '@/content';
import { useSearch } from '@/features/search/SearchContext';
import { socialIcon } from '../ui/Icons';
import Button from '../ui/Button';
import { MAIN_NAV, SECONDARY_NAV } from './nav';
import styles from './Navbar.module.scss';

export type NavTheme = 'overlay' | 'solid';

export default function Navbar({ theme = 'overlay' }: { theme?: NavTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);
  const { pathname } = useLocation();
  const { open: openSearch } = useSearch();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 400 && y > lastY.current + 4);
      if (y < lastY.current - 4 || y < 400) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const solid = theme === 'solid' || scrolled;

  return (
    <>
      <header
        className={[styles.header, solid ? styles.solid : styles.overlay, hidden && !menuOpen && styles.hidden].filter(Boolean).join(' ')}
      >
        <nav className={styles.nav} aria-label="Principal">
          <Link to="/" className={styles.brand} aria-label={`${sitio.nombre} — Inicio`}>
            <img src={logo} alt="" width={40} height={40} />
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
            <a href={sitio.campusUrl} className={styles.campus} target="_blank" rel="noopener noreferrer">
              Campus
            </a>
            {sitio.inscripciones.abiertas && (
              <Button to="/inscripciones" size="sm" icon="none" className={styles.cta}>
                Inscribite
              </Button>
            )}
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
            initial={{ clipPath: 'circle(0% at calc(100% - 48px) 36px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 48px) 36px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 48px) 36px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.menuTop}>
              <Link to="/" className={styles.brand}>
                <img src={logo} alt="" width={40} height={40} />
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
              variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } }}
            >
              {[{ label: 'Inicio', to: '/' }, ...MAIN_NAV].map((item) => (
                <m.li key={item.to} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                  <NavLink to={item.to} end={item.to === '/'} className={({ isActive }) => (isActive ? styles.menuActive : undefined)}>
                    {item.label}
                  </NavLink>
                </m.li>
              ))}
            </m.ul>
            <div className={styles.menuFooter}>
              <ul className={styles.menuSecondary} role="list">
                {SECONDARY_NAV.map((item) => (
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
