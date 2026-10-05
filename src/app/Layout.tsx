import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation, useMatches } from 'react-router';
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react';
import Navbar, { type NavTheme } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import NavigationProgress from '@/components/layout/NavigationProgress';
import CookieBanner from '@/features/consent/CookieBanner';
import { ConsentProvider } from '@/features/consent/ConsentContext';
import { SearchProvider } from '@/features/search/SearchContext';
import Seo, { organizationJsonLd, safeJson } from '@/components/seo/Seo';
import { trackPageView } from '@/lib/analytics';
import { Helmet } from 'react-helmet-async';

export interface RouteHandle {
  nav?: NavTheme;
  /** Oculta navbar/footer (p. ej. admin). */
  bare?: boolean;
  hideWhatsApp?: boolean;
}

/** Desplaza a #ancla al navegar (también en la primera carga). */
function useHashScroll() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (tries++ < 20) setTimeout(tick, 100);
    };
    tick();
  }, [hash, pathname]);
}

export default function Layout() {
  const matches = useMatches();
  const handle = (matches[matches.length - 1]?.handle ?? {}) as RouteHandle;
  const { pathname } = useLocation();
  useHashScroll();

  useEffect(() => {
    // Espera a que Helmet actualice el <title>
    const t = setTimeout(() => trackPageView(pathname), 50);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion="user">
      <ConsentProvider>
        <SearchProvider>
          <Seo />
          <Helmet>
            <script type="application/ld+json">{safeJson({ '@context': 'https://schema.org', ...organizationJsonLd() })}</script>
          </Helmet>
          <a href="#contenido" className="skip-link">
            Saltar al contenido
          </a>
          <NavigationProgress />
          {!handle.bare && <Navbar theme={handle.nav ?? 'overlay'} />}
          <main id="contenido" tabIndex={-1}>
            <Outlet />
          </main>
          {!handle.bare && <Footer />}
          {!handle.bare && !handle.hideWhatsApp && <WhatsAppButton />}
          {!handle.bare && <CookieBanner />}
          <ScrollRestoration getKey={(location) => location.pathname} />
        </SearchProvider>
      </ConsentProvider>
    </MotionConfig>
    </LazyMotion>
  );
}
