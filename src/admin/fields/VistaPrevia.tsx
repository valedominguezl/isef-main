import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Monitor, Smartphone, type LucideIcon } from 'lucide-react';
import type { PaginaKey } from '@/content/schema';
import type { MensajeVista } from '@/features/vista-previa/vistaPrevia';
import { useDebounced } from '@/lib/useDebounced';
import { useAdmin } from '../AdminContext';
import styles from '../Admin.module.scss';

/** Página que se edita: con esto cada bloque muestra su vista previa. */
export type PaginaVista = { pagina: PaginaKey; sitePath: string };

type Obj = Record<string, unknown>;

/** Tamaños de pantalla de referencia (los más comunes en las visitas). */
const COMPUTADORA = { ancho: 1440, alto: 900 };
const CELULAR = { ancho: 390, alto: 844 };

/**
 * Campos de un bloque de una página con su vista previa abajo, a todo el ancho: la página real del
 * sitio en un iframe, del tamaño de una pantalla de computadora y de una de celular, con lo que se
 * está escribiendo y el bloque arriba de la pantalla (ver src/features/vista-previa).
 */
export default function ConVistaPrevia({ pagina, sitePath, bloque, datos, children }: PaginaVista & { bloque: string; datos: Obj; children: ReactNode }) {
  const { mediaUrl } = useAdmin();
  const d = useDebounced(datos, 250);
  const mensaje = useMemo<MensajeVista>(() => {
    // Una foto subida y sin publicar todavía no está en el sitio: va como data: URL
    const imagen = typeof d.imagen === 'string' ? mediaUrl(d.imagen) : undefined;
    return { tipo: 'isef-vista-datos', pagina, datos: { [bloque]: { ...d, imagen } } };
  }, [d, pagina, bloque, mediaUrl]);
  const src = `${sitePath}?vista-previa=${encodeURIComponent(bloque)}`;

  return (
    <div className={styles.vistaBloque}>
      <div className={styles.vistaCampos}>{children}</div>
      <aside className={styles.vista} aria-label="Vista previa">
        <p className={styles.previewLabel}>Así se ve en el sitio</p>
        <div className={styles.vistaPantallas}>
          <Pantalla icon={Monitor} nombre="Computadora" {...COMPUTADORA} src={src} ruta={sitePath} mensaje={mensaje} />
          <Pantalla icon={Smartphone} nombre="Celular" celular {...CELULAR} src={src} ruta={sitePath} mensaje={mensaje} />
        </div>
      </aside>
    </div>
  );
}

interface PantallaProps {
  icon: LucideIcon;
  nombre: string;
  ancho: number;
  alto: number;
  celular?: boolean;
  src: string;
  /** Dirección que se muestra en la barra del navegador (computadora). */
  ruta: string;
  mensaje: MensajeVista;
}

/** Una pantalla del tamaño dado, a escala del ancho disponible; se estira si el bloque no entra. */
function Pantalla({ icon: Icon, nombre, ancho, alto, celular, src, ruta, mensaje }: PantallaProps) {
  const marco = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [escala, setEscala] = useState(0);
  // Alto del bloque desde el borde de arriba de la pantalla: null mientras carga, 0 si hoy no se muestra
  const [contenido, setContenido] = useState<number | null>(null);
  // El último borrador, para mandarlo apenas la página avisa que está lista
  const ultimo = useRef(mensaje);
  useEffect(() => {
    ultimo.current = mensaje;
    frame.current?.contentWindow?.postMessage(mensaje, window.location.origin);
  }, [mensaje]);

  useEffect(() => {
    const el = marco.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setEscala(e.contentRect.width / ancho));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ancho]);

  useEffect(() => {
    const onMensaje = (e: MessageEvent<MensajeVista>) => {
      const win = frame.current?.contentWindow;
      if (!win || e.source !== win || e.origin !== window.location.origin) return;
      if (e.data?.tipo === 'isef-vista-lista') win.postMessage(ultimo.current, window.location.origin);
      if (e.data?.tipo === 'isef-vista-alto') setContenido(e.data.alto);
    };
    window.addEventListener('message', onMensaje);
    return () => window.removeEventListener('message', onMensaje);
  }, []);

  // Siempre una pantalla entera (las cabeceras se dimensionan con el alto de la ventana, svh); más alta
  // solo si el bloque no entra en una
  const altoFrame = Math.max(alto, contenido ?? 0);

  return (
    <figure className={[styles.pantalla, celular && styles.pantallaCelular].filter(Boolean).join(' ')}>
      <figcaption>
        <Icon size={14} aria-hidden /> {nombre}
      </figcaption>
      {!celular && (
        <div className={styles.navegador} aria-hidden>
          <span />
          <span />
          <span />
          <p>isefsanluis.net{ruta === '/' ? '' : ruta}</p>
        </div>
      )}
      <div
        ref={marco}
        className={styles.pantallaMarco}
        data-estado={contenido == null ? 'cargando' : contenido === 0 ? 'vacio' : undefined}
        style={contenido === 0 ? undefined : { height: Math.round(altoFrame * escala) }}
      >
        {/* Solo para mirar: sin foco ni clics (los links de la página no tienen que abrirse acá) */}
        <iframe
          ref={frame}
          src={src}
          title={`Vista previa en ${nombre.toLowerCase()}`}
          tabIndex={-1}
          aria-hidden
          inert
          loading="lazy"
          style={{ width: ancho, height: altoFrame, transform: `scale(${escala})` }}
        />
        {contenido === 0 && <p>Este bloque hoy no se muestra en el sitio.</p>}
      </div>
    </figure>
  );
}
