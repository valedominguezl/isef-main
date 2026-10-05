import { isRouteErrorResponse, useRouteError } from 'react-router';

/** Error inesperado de una ruta (por ejemplo, un chunk que no se pudo descargar tras un deploy). */
export default function RouteError() {
  const error = useRouteError();
  const chunk = error instanceof Error && /dynamically imported module|Importing a module script failed/i.test(error.message);
  if (chunk && typeof window !== 'undefined' && !sessionStorage.getItem('isef-reloaded')) {
    sessionStorage.setItem('isef-reloaded', '1');
    window.location.reload();
    return null;
  }
  return (
    <div style={{ padding: '20vh 1.5rem', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
      <h1>Algo salió mal</h1>
      <p style={{ margin: '1rem auto', maxWidth: '40ch' }}>
        {isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : 'Ocurrió un error inesperado al cargar la página.'}
      </p>
      <a href="/">Volver al inicio</a>
    </div>
  );
}
