import React from 'react';
import ReactGA from 'react-ga';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ScrollProvider } from '@/components/funciones/context/ScrollContext.jsx';

// Importa el contexto y la barra de carga
import { LoadingProvider } from '@/components/funciones/context/LoadingContext';
import LoadingBar from '@/components/funciones/loadingBar/LoadingBar';

import './index.scss';
import Home from '@/mainComponents/Home.jsx';
import Aranceles from '@/mainComponents/Aranceles.jsx';
import Inscripciones from '@/mainComponents/Inscripciones.jsx';
import Carrera from '@/mainComponents/Carrera.jsx';
import Especializaciones from '@/mainComponents/Especializaciones.jsx';
import Institucional from '@/mainComponents/Institucional.jsx';

import Contacto from '@/mainComponents/Institucional/Contacto.jsx';
import Historia from '@/mainComponents/Institucional/Historia.jsx';

import WhatsAppButton from '@/components/funciones/whatsApp/WhatsAppButton.jsx';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/Aranceles', element: <Aranceles /> },
  { path: '/Inscripciones', element: <Inscripciones /> },
  { path: '/Carrera', element: <Carrera /> },
  { path: '/Especializaciones', element: <Especializaciones /> },
  {
    path: '/Institucional', 
    element: <Institucional />, 
    children: [
      { path: 'Contacto', element: <Contacto /> }, 
      { path: 'Historia', element: <Historia /> },
    ]
  },
]);

ReactGA.initialize('G-L4QFYTY1XM');
ReactGA.pageview(window.location.pathname + window.location.search);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoadingProvider>
      <ScrollProvider>
        <LoadingBar />
        <RouterProvider router={router} />
        <WhatsAppButton />
      </ScrollProvider>
    </LoadingProvider>
  </StrictMode>,
);
