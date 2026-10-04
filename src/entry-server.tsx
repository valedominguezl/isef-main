import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import { routes } from '@/app/routes';

export { contentDocs } from '@/features/search/buildDocs';
export { cursos, disertantes, novedades, sitio, aranceles } from '@/content';

/** Renderiza una URL a HTML (usado por scripts/prerender.ts). */
export async function render(url: string) {
  const handler = createStaticHandler(routes);
  const request = new Request(`https://isefsanluis.net${url}`);
  const context = await handler.query(request);
  if (context instanceof Response) throw context;

  const router = createStaticRouter(handler.dataRoutes, context);
  const helmetContext: { helmet?: HelmetServerState } = {};
  const html = renderToString(
    <StrictMode>
      <HelmetProvider context={helmetContext}>
        <StaticRouterProvider router={router} context={context} />
      </HelmetProvider>
    </StrictMode>,
  );
  return { html, helmet: helmetContext.helmet!, status: context.statusCode };
}
