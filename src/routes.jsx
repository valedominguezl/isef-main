import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./layout.jsx";
import Home from "@/mainComponents/Home.jsx";
import Aranceles from "@/mainComponents/Aranceles.jsx";
import Inscripciones from "@/mainComponents/Inscripciones.jsx";
import Carrera from "@/mainComponents/Carrera.jsx";
import Especializaciones from "@/mainComponents/Especializaciones.jsx";
import Cookies from "@/mainComponents/privacyPolicy/PrivacyPolicy.jsx";
import Institucional from "@/mainComponents/Institucional.jsx";
import Contacto from "@/mainComponents/institucional/Contacto.jsx";
import Historia from "@/mainComponents/institucional/Historia.jsx";
import Noticias from "@/mainComponents/Noticias.jsx";

import Conferencias from "@/mainComponents/Conferencias.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },

      // TEMPORAL
      { path: "hijos.htm", element: <Conferencias /> },

      { path: "Aranceles", element: <Aranceles /> },
      { path: "Inscripciones", element: <Inscripciones /> },
      { path: "Carrera", element: <Carrera /> },
      { path: "Especializaciones", element: <Especializaciones /> },
      { path: "Cookies", element: <Cookies /> },
      {
        path: "Institucional",
        element: <Institucional />,
        children: [
          { path: "Contacto", element: <Contacto /> },
          // { path: 'Historia', element: <Historia /> },
        ],
      },
      { path: "Noticias", element: <Noticias /> },
    ],
  },
  {
    path: "*", // Ruta comodín
    element: <Navigate to="/" />,
  },
]);

export default router;
