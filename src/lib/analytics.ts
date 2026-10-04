/**
 * Analítica respetando el consentimiento (modo básico: nada se carga hasta aceptar).
 * GA4 → categoría "analítica". GTM (píxeles/remarketing) → categoría "publicidad".
 */
import { sitio } from '@/content';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export interface ConsentState {
  analitica: boolean;
  publicidad: boolean;
}

let gaLoaded = false;
let gtmLoaded = false;

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
  }
}

function loadScript(src: string) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

export function applyConsent(c: ConsentState) {
  if (typeof window === 'undefined' || import.meta.env.DEV) return;
  ensureGtag();
  window.gtag!('consent', gaLoaded || gtmLoaded ? 'update' : 'default', {
    analytics_storage: c.analitica ? 'granted' : 'denied',
    ad_storage: c.publicidad ? 'granted' : 'denied',
    ad_user_data: c.publicidad ? 'granted' : 'denied',
    ad_personalization: c.publicidad ? 'granted' : 'denied',
  });

  if (c.analitica && !gaLoaded) {
    gaLoaded = true;
    window.gtag!('js', new Date());
    window.gtag!('config', sitio.analytics.ga4, { anonymize_ip: true });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${sitio.analytics.ga4}`);
  }
  if (c.publicidad && !gtmLoaded) {
    gtmLoaded = true;
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    loadScript(`https://www.googletagmanager.com/gtm.js?id=${sitio.analytics.gtm}`);
  }
}

/** Evento de analítica. No hace nada si no hubo consentimiento. */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || !gaLoaded || !window.gtag) return;
  window.gtag('event', event, params);
}

export function trackPageView(path: string) {
  if (typeof window === 'undefined' || !gaLoaded || !window.gtag) return;
  window.gtag('event', 'page_view', { page_path: path, page_location: window.location.href, page_title: document.title });
}
