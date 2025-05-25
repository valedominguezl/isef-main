import React, { useEffect, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ScrollProvider } from './components/funciones/context/ScrollContext.jsx';
import { LoadingProvider } from './components/funciones/context/LoadingContext.jsx';
import { CookiesProvider, useCookies } from '@/components/funciones/context/CookiesContext';
import LoadingBar from './components/funciones/loadingBar/LoadingBar.jsx';
import WhatsAppButton from './components/funciones/whatsApp/WhatsAppButton.jsx';
import TagManager from 'react-gtm-module';
import CookieBanner from './components/funciones/cookies/CookieBanner.jsx';
import router from './routes.jsx';
import './index.scss';

// Función para inicializar el consentimiento en gtag y GTM
const initializeGtag = (consent) => {
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      'analytics_storage': consent.rendimiento ? 'granted' : 'denied',
      'ad_storage': consent.seguridad ? 'granted' : 'denied',
      'ad_user_data': consent.seguridad ? 'granted' : 'denied',
      'ad_personalization': consent.seguridad ? 'granted' : 'denied',
    });
  }

  // Evitar múltiples inicializaciones de GTM
  if (consent.seguridad && !window._gtmInitialized) {
    TagManager.initialize({ gtmId: 'GTM-KFMMQ36H' });
    window._gtmInitialized = true;
  }
};

const AppContent = () => {
  const { consent } = useCookies();

  // Efecto para cargar gtag.js solo una vez
  useEffect(() => {
    if (!window.gtag) {
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-L4QFYTY1XM';
      script.async = true;

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag(){ window.dataLayer.push(arguments); }
        window.gtag = gtag;

        window.gtag('js', new Date());
        window.gtag('config', 'G-L4QFYTY1XM', { anonymize_ip: true });

        // Aplicar el consentimiento inicial
        initializeGtag(consent);
      };

      script.onerror = () => console.error('Error al cargar gtag.js');
      document.head.appendChild(script);
    }
  }, []);

  // Efecto para actualizar el consentimiento si cambia
  useEffect(() => {
    if (window.gtag) {
      initializeGtag(consent);
    }
  }, [consent]);

  return (
    <HelmetProvider>
      <LoadingProvider>
        <ScrollProvider>
          <LoadingBar />
          <RouterProvider router={router} />
          <WhatsAppButton />
          <CookieBanner activateTracking={initializeGtag} />
        </ScrollProvider>
      </LoadingProvider>
    </HelmetProvider>
  );
};

const App = () => (
  <CookiesProvider>
    <AppContent />
  </CookiesProvider>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
