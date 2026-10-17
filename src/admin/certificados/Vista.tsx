import { useEffect, useRef, useState } from 'react';
import type { Certificado } from '@/content/schema';
import { generarCertificado, type DatosCertificado } from './pdf';
import s from './Certificados.module.scss';

/** Persona de muestra para ver el modelo antes de tener respuestas. */
export const MUESTRA: DatosCertificado = { nombre: 'María Laura Gómez', dni: '30123456', nota: 95, codigo: 'ISEF-MUES-TRA1' };

/** Completa lo que falta mientras se está cargando la actividad (el PDF nunca sale roto). */
export function certParaVista(c: Partial<Certificado>): Certificado {
  return {
    titulo: c.titulo || 'Certificado',
    tipo: c.tipo ?? 'aprobacion',
    formulario: c.formulario ?? '',
    actividad: c.actividad?.trim() || 'la actividad',
    fecha: /^\d{4}-\d{2}-\d{2}$/.test(c.fecha ?? '') ? c.fecha! : new Date().toISOString().slice(0, 10),
    firmante: c.firmante?.trim() || 'Nombre de quien firma',
    cargo: c.cargo?.trim() || 'Rector',
    ...(c.programa ? { programa: c.programa } : {}),
    ...(c.dictadoPor ? { dictadoPor: c.dictadoPor } : {}),
    ...(c.cargaHoraria ? { cargaHoraria: c.cargaHoraria } : {}),
    ...(c.resolucion ? { resolucion: c.resolucion } : {}),
  };
}

let pdfjs: Promise<typeof import('pdfjs-dist')> | null = null;
const cargarPdfjs = () =>
  (pdfjs ??= Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(([lib, worker]) => {
    lib.GlobalWorkerOptions.workerSrc = worker.default;
    return lib;
  }));

/**
 * Dibuja el PDF real (el mismo que se manda) en un lienzo: lo que se ve es exactamente lo que recibe la persona.
 */
export default function Vista({
  cert,
  datos = MUESTRA,
  firma,
  firmaVersion = 0,
  etiqueta,
}: {
  cert: Certificado;
  datos?: DatosCertificado;
  firma?: ArrayBuffer | null;
  /** Cambia cuando cambia la firma (los bytes no entran en la clave del efecto). */
  firmaVersion?: number;
  etiqueta: string;
}) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const caja = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'error'>('cargando');
  const clave = JSON.stringify([cert, datos, firmaVersion, firma === undefined]);

  useEffect(() => {
    let cancelado = false;
    const t = setTimeout(async () => {
      try {
        const [bytes, lib] = await Promise.all([generarCertificado(cert, datos, firma), cargarPdfjs()]);
        if (cancelado || !lienzo.current || !caja.current) return;
        const tarea = lib.getDocument({ data: bytes });
        const doc = await tarea.promise;
        const page = await doc.getPage(1);
        const base = page.getViewport({ scale: 1 });
        const ancho = caja.current.clientWidth || 600;
        const viewport = page.getViewport({ scale: (ancho * Math.min(window.devicePixelRatio || 1, 2)) / base.width });
        const c = lienzo.current;
        c.width = Math.round(viewport.width);
        c.height = Math.round(viewport.height);
        await page.render({ canvas: c, viewport }).promise;
        void tarea.destroy();
        if (!cancelado) setEstado('listo');
      } catch {
        if (!cancelado) setEstado('error');
      }
    }, 250);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
    // `clave` resume cert y datos (son objetos nuevos en cada render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  return (
    <div ref={caja} className={s.vista} data-estado={estado}>
      <canvas ref={lienzo} role="img" aria-label={etiqueta} />
      {estado === 'error' && <p className={s.vistaError}>No se pudo dibujar la vista previa.</p>}
    </div>
  );
}
