import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { ExternalLink, Menu, Search, X } from 'lucide-react';
import logo from '@/assets/logo.webp';
import { sitio, inscripcionesVigentes } from '@/content';
import { useSearch } from '@/features/search/SearchContext';
import { DURATION, EASE_EMPHASIZED, EASE_EXIT } from '@/lib/motion';
import { useModalFocus } from '@/lib/useModalFocus';
import { socialIcon, socialLabel } from '../ui/Icons';
import Button from '../ui/Button';
import { MAIN_NAV, SECONDARY_NAV } from './nav';
import InscripcionesAviso from './InscripcionesAviso';
import styles from './Navbar.module.scss';

export type NavTheme = 'overlay' | 'solid';

/** Curva del menú (tipo cajón de iOS): el círculo arranca rápido y se asienta suave. */
const EASE_MENU = [0.32, 0.72, 0, 1] as const;
const CIRCLE_FROM = 'circle(0px at calc(100% + 120px) -120px)';
const CIRCLE_TO = 'circle(170vmax at calc(100% + 120px) -120px)';

/** Entrada escalonada de lo que hay dentro del menú (links, botones y pie). */
const menuItem = {
  hidden: { opacity: 0, transform: 'translateY(16px)' },
  show: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.7, ease: EASE_EMPHASIZED } },
};
/** Con «reducir movimiento»: solo fundido (el `transform` como texto no lo anula MotionConfig). */
const menuItemFade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: menuItem.show.transition },
};
/** Igual, con la demora como `custom` (botones y pie, después del último link). */
const conDemora = (v: typeof menuItem | typeof menuItemFade) => ({
  hidden: v.hidden,
  show: (delay: number) => ({ ...v.show, transition: { ...v.show.transition, delay } }),
});
const MENU_DELAY = 0.2;
const MENU_STAGGER = 0.06;

/**
 * Como el sitio original: transparente sobre la foto de cabecera ('overlay') o blanca en páginas
 * de fondo claro ('solid'); pasada la cabecera toma el degradé de marca. Se esconde al bajar y
 * vuelve al subir.
 */
export default function Navbar({ theme = 'overlay' }: { theme?: NavTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [hidden, setHidden] = useState(false);
  // La página no tiene foto de cabecera (p. ej. un 404 dentro de una ruta con foto): se trata como 'solid'
  const [lightTop, setLightTop] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const { open: openSearch } = useSearch();
  const reduceMotion = useReducedMotion();
  useModalFocus(menuOpen, menu, { restoreFocus: false });
  // Tecla del atajo según el sistema (el HTML prerenderizado dice «Ctrl K»; en Mac cambia al cargar)
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);

  useEffect(() => setMenuOpen(false), [pathname]);

  // Al cerrar el menú (sin cambiar de página) el foco vuelve al botón "Menú"
  const menuBtn = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    // (el foco estaba adentro del menú, que se desmonta al terminar la animación de salida)
    const enMenu = document.activeElement === document.body || document.getElementById('menu-movil')?.contains(document.activeElement);
    if (wasOpen.current && !menuOpen && enMenu) menuBtn.current?.focus();
    wasOpen.current = menuOpen;
  }, [menuOpen]);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const navH = header.current?.offsetHeight ?? 72;
      // La cabecera de la página es el primer bloque visible de <main>: no cuentan la capa de AmbientShapes
      // (aria-hidden, ocupa todo el alto) ni el <script> JSON-LD de cada página. El degradé aparece cuando la barra la deja atrás
      const hero = document.getElementById('contenido')?.querySelector(':scope > :not([aria-hidden], script, style, template)');
      setPastHero(hero ? hero.getBoundingClientRect().bottom <= navH : y > 700);
      setLightTop(hero?.getAttribute('data-surface') === 'light');
      if (y <= navH) setHidden(false);
      else if (Math.abs(y - lastY) > 4) setHidden(y > lastY);
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  // Con inscripciones abiertas, «Inscribite ya» (abajo) reemplaza al link
  const menuLinks = [{ label: 'Inicio', to: '/' }, ...MAIN_NAV.filter((item) => !(item.to === '/inscripciones' && inscripcionesVigentes()))];
  const menuTail = MENU_DELAY + MENU_STAGGER * menuLinks.length;
  const item = reduceMotion ? menuItemFade : menuItem;
  const tailItem = conDemora(item);

  const solid = theme === 'solid' || lightTop;
  const tone = pastHero ? styles.brandBg : solid ? styles.light : styles.clear;
  const onLight = !pastHero && solid;

  useEffect(() => {
    if (!menuOpen) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    html.dataset.menu = 'abierto'; // el aviso de cookies se oculta: el menú es translúcido y se vería detrás
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      html.style.overflow = prev;
      delete html.dataset.menu;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        ref={header}
        className={[styles.header, tone, hidden && !menuOpen && styles.hidden, 'no-print'].filter(Boolean).join(' ')}
        onFocusCapture={() => setHidden(false)}
      >
        <InscripcionesAviso />
        <nav className={styles.nav} aria-label="Principal">
          <Link to="/" className={styles.brand} aria-label={`${sitio.nombre} — Inicio`}>
            <img src={logo} alt="" width={48} height={48} />
            <span>{sitio.nombre}</span>
          </Link>

          <ul className={styles.links} role="list">
            {MAIN_NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  data-label={item.label}
                  className={({ isActive }) => [styles.link, isActive && styles.active].filter(Boolean).join(' ')}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <button type="button" className={styles.search} onClick={openSearch} aria-label="Buscar en el sitio" aria-keyshortcuts="Control+K Meta+K">
              <Search size={20} aria-hidden />
              <span className={styles.searchLabel}>Buscar</span>
              <kbd className={styles.kbd} aria-hidden>
                {mac ? '⌘K' : 'Ctrl K'}
              </kbd>
            </button>
            {inscripcionesVigentes() && (
              <Button to="/inscripciones" size="sm" icon="none" variant={pastHero ? 'light' : 'primary'} className={styles.cta}>
                Inscribite
              </Button>
            )}
            <Button
              href={sitio.campusUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              variant={onLight ? 'outline' : 'outline-light'}
              icon="none"
              className={styles.campus}
            >
              Campus virtual
            </Button>
            <button
              ref={menuBtn}
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
            ref={menu}
            id="menu-movil"
            className={`${styles.menu} on-dark`}
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            // Círculo que crece desde fuera de la pantalla (arriba a la derecha): no se ve el punto de origen.
            // Cierra más rápido de lo que abre. Con «reducir movimiento», solo fundido.
            {...(reduceMotion
              ? {
                  initial: { opacity: 0 },
                  animate: { opacity: 1, transition: { duration: DURATION.base } },
                  exit: { opacity: 0, transition: { duration: 0.2, ease: EASE_EXIT } },
                }
              : {
                  initial: { clipPath: CIRCLE_FROM },
                  animate: { clipPath: CIRCLE_TO, transition: { duration: 0.7, ease: EASE_MENU } },
                  exit: { clipPath: CIRCLE_FROM, transition: { duration: 0.45, ease: EASE_MENU } },
                })}
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
              variants={{ show: { transition: { staggerChildren: MENU_STAGGER, delayChildren: MENU_DELAY } } }}
            >
              {menuLinks.map((link) => (
                <m.li key={link.to} variants={item}>
                  <NavLink to={link.to} end={link.to === '/'} className={({ isActive }) => (isActive ? styles.menuActive : undefined)}>
                    {link.label}
                  </NavLink>
                </m.li>
              ))}
            </m.ul>
            {/* Botones y pie siguen el escalonado de los links (antes aparecían de golpe con el círculo) */}
            <m.div className={styles.menuCtas} initial="hidden" animate="show" variants={tailItem} custom={menuTail}>
              {inscripcionesVigentes() && (
                <Button to="/inscripciones" variant="light" size="lg" leading={<span aria-hidden>🚀</span>}>
                  Inscribite ya
                </Button>
              )}
              <Button href={sitio.campusUrl} target="_blank" rel="noopener noreferrer" variant="outline-light" size="lg" icon="none">
                Campus virtual
              </Button>
            </m.div>
            <m.div className={styles.menuFooter} initial="hidden" animate="show" variants={tailItem} custom={menuTail + MENU_STAGGER}>
              <ul className={styles.menuSecondary} role="list">
                {SECONDARY_NAV.filter((item) => item.to !== sitio.campusUrl).map((item) => (
                  <li key={item.to}>
                    {item.external ? (
                      <a href={item.to} target="_blank" rel="noopener noreferrer">
                        {item.label} <ExternalLink size={14} aria-hidden />
                        <span className="sr-only"> (se abre en otra pestaña)</span>
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
                      <a href={r.url} target="_blank" rel="noopener noreferrer" aria-label={`${socialLabel[r.red]}: ${r.etiqueta} (se abre en otra pestaña)`}>
                        <Icon size={20} />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
