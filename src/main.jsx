import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ScrollProvider } from '@/components/funciones/context/ScrollContext.jsx';
import { LoadingProvider } from '@/components/funciones/context/LoadingContext';
import LoadingBar from '@/components/funciones/loadingBar/LoadingBar';
import WhatsAppButton from '@/components/funciones/whatsApp/WhatsAppButton.jsx';
import ReactGA from 'react-ga4';
import router from './routes.jsx'; 
import './index.scss';

// Inicializa Google Analytics 4
ReactGA.initialize('G-L4QFYTY1XM');

router.subscribe(({ location }) => {
  ReactGA.send({ hitType: 'pageview', page: location.pathname });
});

// Renderiza la aplicación
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <LoadingProvider>
        <ScrollProvider>
          <LoadingBar />
          <RouterProvider router={router} />
          <WhatsAppButton />
        </ScrollProvider>
      </LoadingProvider>
    </HelmetProvider>
  </StrictMode>
);
