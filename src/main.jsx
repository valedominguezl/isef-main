import React, { useEffect } from 'react';
import { StrictMode } from 'react';
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

// Función para inicializar gtag.js y GTM basándose en el consentimiento del usuario
const initializeGtag = (consent) => {
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'default', {
      'analytics_storage': consent.rendimiento ? 'granted' : 'denied',
      'ad_storage': consent.seguridad ? 'granted' : 'denied',
      'ad_user_data': consent.seguridad ? 'granted' : 'denied',
      'ad_personalization': consent.seguridad ? 'granted' : 'denied',
    });

    if (consent.seguridad) {
      TagManager.initialize({ gtmId: 'GTM-KFMMQ36H' });
    }
  } else {
    console.warn('gtag.js aún no está cargado.');
  }
};

const AppContent = () => {
  const { consent } = useCookies();

  useEffect(() => {
    // Carga gtag.js independientemente del consentimiento, pero configura según el consentimiento
    if (!window.gtag) {
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-L4QFYTY1XM';
      script.async = true;

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag(){ window.dataLayer.push(arguments); }
        window.gtag = gtag;

        // Establecer consentimiento predeterminado ANTES de cualquier otra configuración
        window.gtag('consent', 'default', {
          'analytics_storage': consent?.rendimiento ? 'granted' : 'denied',
          'ad_storage': consent?.seguridad ? 'granted' : 'denied',
          'ad_user_data': consent?.seguridad ? 'granted' : 'denied',
          'ad_personalization': consent?.seguridad ? 'granted' : 'denied',
        });

        // Inicializar Google Analytics
        window.gtag('js', new Date());
        window.gtag('config', 'G-L4QFYTY1XM', { anonymize_ip: true });

        // Inicializar GTM si es necesario
        if (consent?.seguridad) {
          TagManager.initialize({ gtmId: 'GTM-KFMMQ36H' });
        }
      };

      script.onerror = () => {
        console.error('Error al cargar gtag.js');
      };

      document.head.appendChild(script);
    } else {
      // Si gtag ya está disponible, actualizamos el consentimiento
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