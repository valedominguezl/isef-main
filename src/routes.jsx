import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './layout.jsx';
import Home from '@/mainComponents/Home.jsx';
import Aranceles from '@/mainComponents/Aranceles.jsx';
import Inscripciones from '@/mainComponents/Inscripciones.jsx';
import Carrera from '@/mainComponents/Carrera.jsx';
import Especializaciones from '@/mainComponents/Especializaciones.jsx';
import Institucional from '@/mainComponents/Institucional.jsx';
import Contacto from '@/mainComponents/Institucional/Contacto.jsx';
import Historia from '@/mainComponents/Institucional/Historia.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'Aranceles', element: <Aranceles /> },
      { path: 'Inscripciones', element: <Inscripciones /> },
      { path: 'Carrera', element: <Carrera /> },
      { path: 'Especializaciones', element: <Especializaciones /> },
      {
        path: 'Institucional',
        element: <Institucional />,
        children: [
          { path: 'Contacto', element: <Contacto /> },
          { path: 'Historia', element: <Historia /> },
        ],
      },
    ],
  },
  {
    path: '*',  // Ruta comodín 
    element: <Navigate to="/" />, 
  },
]);

export default router;
