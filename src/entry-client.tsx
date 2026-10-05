import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, matchRoutes } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { HelmetProvider } from 'react-helmet-async';
import { routes } from '@/app/routes';
import '@fontsource-variable/libre-franklin';
import '@fontsource/merriweather/300.css';
import '@fontsource/merriweather/300-italic.css';
import '@fontsource/merriweather/700.css';
import '@/styles/global.scss';

async function start() {
  const container = document.getElementById('root')!;
  const prerendered = Boolean(container.firstElementChild) && !container.dataset.shell;

  // Resolver las rutas lazy de la URL actual antes de hidratar (evita parpadeos/mismatch)
  const matches = matchRoutes(routes, window.location)?.filter((m) => m.route.lazy);
  if (matches?.length) {
    await Promise.all(
      matches.map(async (m) => {
        const mod = await (m.route.lazy as () => Promise<object>)(); // las rutas usan la forma función de lazy
        Object.assign(m.route, { ...mod, lazy: undefined });
      }),
    );
  }

  const router = createBrowserRouter(routes, {
    hydrationData: prerendered ? (window as unknown as { __staticRouterHydrationData?: never }).__staticRouterHydrationData : undefined,
  });

  const app = (
    <StrictMode>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </StrictMode>
  );

  // Etiquetas SEO del prerender (title/meta/link): React 19 pone las suyas en el <head> al montar.
  // Se sacan antes para que no queden duplicadas cuando difieren (404 en otra URL, páginas esqueleto).
  document.head.querySelectorAll('[data-seo]').forEach((n) => n.remove());

  if (prerendered) hydrateRoot(container, app);
  else createRoot(container).render(app);

  markLoadedImages();
}

/**
 * Esqueleto de imágenes: las fotos diferidas muestran un brillo suave hasta cargar (ver global.scss).
 * Se marca data-loaded al terminar para cortar la animación (después de hidratar, para no tocar el HTML prerenderizado antes).
 */
function markLoadedImages() {
  const mark = (img: HTMLImageElement) => img.setAttribute('data-loaded', '');
  const onDone = (e: Event) => e.target instanceof HTMLImageElement && mark(e.target);
  document.addEventListener('load', onDone, true);
  document.addEventListener('error', onDone, true);
  setTimeout(() => document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => img.complete && mark(img)), 0);
}

start();
