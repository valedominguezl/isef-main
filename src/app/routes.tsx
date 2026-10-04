import { Navigate, type RouteObject } from 'react-router-dom';
import Layout, { type RouteHandle } from './Layout';
import RouteError from '@/pages/RouteError';

const solid: RouteHandle = { nav: 'solid' };

/** URLs del sitio anterior → nuevas (también como 301 en public/.htaccess). */
export const LEGACY_REDIRECTS: Record<string, string> = {
  Carrera: '/carrera',
  Inscripciones: '/inscripciones',
  Especializaciones: '/especializaciones',
  Aranceles: '/aranceles',
  Noticias: '/novedades',
  Cookies: '/privacidad',
  Institucional: '/contacto',
  'Institucional/Contacto': '/contacto',
  'Institucional/Historia': '/carrera',
  TestHiit: '/test-hiit',
};

/**
 * Rutas del sitio. Cada página se carga bajo demanda (`lazy`) y se prerenderiza en el build
 * (ver scripts/prerender.ts). Las URLs viejas con mayúsculas redirigen con 301 desde .htaccess.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      ...Object.entries(LEGACY_REDIRECTS).map(([from, to]) => ({ path: from, caseSensitive: true, element: <Navigate to={to} replace /> })),
      { index: true, lazy: () => import('@/pages/home/HomePage') },
      { path: 'carrera', lazy: () => import('@/pages/carrera/CarreraPage') },
      { path: 'especializaciones', lazy: () => import('@/pages/especializaciones/EspecializacionesPage') },
      { path: 'especializaciones/:slug', lazy: () => import('@/pages/especializaciones/CursoPage') },
      { path: 'disertantes/:slug', lazy: () => import('@/pages/disertantes/DisertantePage') },
      { path: 'novedades', lazy: () => import('@/pages/novedades/NovedadesPage') },
      { path: 'novedades/:slug', lazy: () => import('@/pages/novedades/NovedadPage') },
      { path: 'inscripciones', lazy: () => import('@/pages/inscripciones/InscripcionesPage') },
      { path: 'contacto', lazy: () => import('@/pages/contacto/ContactoPage') },
      { path: 'aranceles', lazy: () => import('@/pages/aranceles/ArancelesPage') },
      { path: 'privacidad', lazy: () => import('@/pages/privacidad/PrivacidadPage') },
      { path: 'buscar', handle: solid, lazy: () => import('@/pages/buscar/BuscarPage') },
      { path: 'test-hiit', handle: { ...solid, hideWhatsApp: true }, lazy: () => import('@/pages/test-hiit/TestHiitPage') },
      { path: 'hijos.htm', lazy: () => import('@/pages/conferencias/ConferenciasPage') },
      { path: 'admin/*', handle: { bare: true }, lazy: () => import('@/admin/AdminPage') },
      { path: '*', handle: solid, lazy: () => import('@/pages/NotFoundPage') },
    ],
  },
];

/** Rutas que solo funcionan en el navegador (no se prerenderizan con contenido). */
export const CLIENT_ONLY = ['/admin', '/test-hiit', '/hijos.htm'];
