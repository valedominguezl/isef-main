import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { routes } from '@/app/routes';

export { contentDocs } from '@/features/search/buildDocs';
export { cursos, disertantes, novedades, sitio, aranceles } from '@/content';

/**
 * React 19 escribe al principio del HTML las etiquetas que sube al <head> (<title>, <meta>, <link>
 * y las precargas de imágenes). Se separan para que el prerender las ponga en el <head>; al hidratar,
 * React las reconoce ahí.
 */
const HOISTED = /^(?:<title\b[^>]*>[^<]*<\/title>|<(?:meta|link)\b[^>]*>)*/;

/** Renderiza una URL a HTML (usado por scripts/prerender.ts). */
export async function render(url: string) {
  const handler = createStaticHandler(routes);
  const request = new Request(`https://isefsanluis.net${url}`);
  const context = await handler.query(request);
  if (context instanceof Response) throw context;

  const router = createStaticRouter(handler.dataRoutes, context);
  const out = renderToString(
    <StrictMode>
      <HelmetProvider>
        <StaticRouterProvider router={router} context={context} />
      </HelmetProvider>
    </StrictMode>,
  );
  const head = out.match(HOISTED)![0];
  return { html: out.slice(head.length), head, status: context.statusCode };
}
