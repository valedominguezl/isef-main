import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useLocation } from 'react-router';
import { m } from 'motion/react';
import styles from './AmbientShapes.module.scss';

type Kind = 'circle' | 'pill';
interface Shape {
  kind: Kind;
  side: 'left' | 'right';
  /** Centro vertical, en px desde el borde superior de <main>. */
  cy: number;
  /** Ancho de la forma (la píldora mide ancho × 0,35). */
  w: number;
  /** Cuánto queda fuera de la pantalla, en px. */
  out: number;
}

const PAD = 32; // aire entre el halo y el borde de la zona clara
const GLOW = { circle: 1.5, pill: 1.1 }; // diámetro del halo respecto del ancho de la forma
const GLOW_SHIFT = 0.06; // el halo se corre apenas hacia el centro de la página
type Rect = { top: number; bottom: number; left: number; right: number };
const OFFSCREEN = { desktop: 0.55, mobile: 0.62 }; // parte de la forma que queda fuera de la pantalla

/**
 * Zonas claras = secciones claras (data-surface="light") contiguas. Las formas y sus halos se ubican
 * completos dentro de una zona: nunca quedan cortados por el borde de una banda oscura o una foto.
 */
function layout(main: HTMLElement, mobile: boolean): Shape[] {
  const base = main.getBoundingClientRect().top;
  const secs = [...main.querySelectorAll<HTMLElement>('[data-surface]')]
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top - base, bottom: r.bottom - base, light: el.dataset.surface === 'light' };
    })
    .sort((a, b) => a.top - b.top);

  const zones: { top: number; bottom: number }[] = [];
  for (const s of secs) {
    const last = zones.at(-1);
    if (!s.light) continue;
    if (last && s.top - last.bottom < 4) last.bottom = Math.max(last.bottom, s.bottom);
    else zones.push({ top: s.top, bottom: s.bottom });
  }

  // Una sola pasada por los elementos de las secciones claras: sticky + superficies con fondo propio
  const stickies: HTMLElement[] = [];
  const painted: HTMLElement[] = [];
  for (const el of main.querySelectorAll<HTMLElement>('[data-surface="light"] *')) {
    const cs = getComputedStyle(el);
    if (cs.position === 'sticky') stickies.push(el);
    const box = el.getBoundingClientRect();
    if (box.width < 100 || box.height < 40) continue;
    const media = el instanceof HTMLImageElement || el instanceof HTMLVideoElement || el instanceof HTMLIFrameElement;
    const alpha = Number(cs.backgroundColor.match(/[\d.]+/g)?.[3] ?? 1);
    if (media || (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && alpha > 0.3) || cs.backgroundImage !== 'none') painted.push(el);
  }
  // Lo que es sticky se mueve con el scroll: ocupa todo el alto de su contenedor
  const rectOf = (el: Element) => {
    const r = el.getBoundingClientRect();
    const sticky = stickies.find((s) => s.contains(el));
    const range = sticky?.parentElement?.getBoundingClientRect();
    return { top: (range ?? r).top - base, bottom: (range ?? r).bottom - base, left: r.left, right: r.right };
  };

  // Botones y enlaces: ninguna forma pasa por debajo de algo que se pueda tocar (32 px de aire:
  // cubre también el corrimiento de las entradas de Reveal, que se miden antes de terminar)
  const vw = document.documentElement.clientWidth;
  const obstacles = [...main.querySelectorAll('a, button')].map((el) => {
    const r = rectOf(el);
    return { top: r.top - 32, bottom: r.bottom + 32, left: r.left - 32, right: r.right + 32 };
  });
  // Superficies con fondo propio (tarjetas, paneles, fotos): taparían la forma o su halo con un corte recto
  // 24 px de más arriba/abajo: cubre el corrimiento de las entradas de Reveal
  const surfaces: Rect[] = painted.map((el) => {
    const r = rectOf(el);
    return { top: r.top - 24, bottom: r.bottom + 24, left: r.left, right: r.right };
  });
  const hitsCircle = (o: Rect, cx: number, cy: number, rad: number) => {
    const dx = cx - Math.max(o.left, Math.min(cx, o.right));
    const dy = cy - Math.max(o.top, Math.min(cy, o.bottom));
    return dx * dx + dy * dy < rad * rad;
  };
  const collides = (side: 'left' | 'right', cy: number, w: number, out: number, kind: Kind) => {
    const half = (kind === 'circle' ? w : w * 0.66) / 2; // la píldora rotada ocupa ≈ 0,66 × su ancho en alto
    const [l, r] = side === 'left' ? [0, w - out] : [vw - (w - out), vw];
    if (obstacles.some((o) => o.right > l && o.left < r && o.bottom > cy - half && o.top < cy + half)) return true;
    // Forma y halo (el 20 % exterior del halo es casi transparente y se ignora)
    const cx = side === 'left' ? w / 2 - out : vw + out - w / 2;
    const gx = cx + (side === 'left' ? 1 : -1) * w * GLOW_SHIFT;
    const glowR = ((w * GLOW[kind]) / 2) * 0.8;
    return surfaces.some((o) => hitsCircle(o, gx, cy, glowR) || (o.right > l - 24 && o.left < r + 24 && o.bottom > cy - half - 24 && o.top < cy + half + 24));
  };

  const scale = mobile ? 0.55 : 1;
  const step = mobile ? 1100 : 700; // aire entre formas del mismo costado (en el celular, más espaciadas)
  const shapes: Shape[] = [];
  // Recorre cada zona de a 40 px buscando huecos libres: prueba el costado que toca (alternando),
  // después el otro, y tamaños/salidas de pantalla cada vez más discretos. Entre formas, `step` de aire.
  const last = { left: -Infinity, right: -Infinity, any: -Infinity };
  let k = 0;
  for (const z of zones) {
    for (let cy = z.top + PAD; cy < z.bottom - PAD; cy += 40) {
      const kind: Kind = k % 2 ? 'pill' : 'circle';
      const preferred = k % 2 ? 'left' : 'right';
      const base = (kind === 'circle' ? (k % 4 === 0 ? 500 : 420) : 460) * scale;
      let placed: Shape | undefined;
      if (cy - last.any < step / 2) continue;
      for (const side of [preferred, preferred === 'left' ? 'right' : 'left'] as const) {
        if (cy - last[side] < step) continue;
        for (const size of [1, 0.8, 0.65]) {
          // La forma se achica para que su halo entre completo en la zona (nunca se corta)
          const fit = ((Math.min(cy - z.top, z.bottom - cy) - PAD) * 2) / GLOW[kind];
          const w = Math.min(base * size, fit);
          if (w < 220 * scale) continue;
          for (const extra of [0, 0.15]) {
            const out = w * ((mobile ? OFFSCREEN.mobile : OFFSCREEN.desktop) + extra);
            if (!collides(side, cy, w, out, kind)) {
              placed = { kind, side, cy, w, out };
              break;
            }
          }
          if (placed) break;
        }
        if (placed) break;
      }
      if (!placed) continue;
      shapes.push(placed);
      last[placed.side] = last.any = cy;
      k++;
    }
  }
  return shapes;
}

const DESKTOP = '(min-width: 1024px) and (hover: hover)';

/** Formas lila con halo que asoman por los costados detrás del contenido (identidad del sitio original). */
export default function AmbientShapes() {
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const main = ref.current?.parentElement;
    if (!main) return;
    const mqMobile = matchMedia('(max-width: 767px)');
    const mqDesktop = matchMedia(DESKTOP);
    let timer = 0;
    let last = '';
    const run = () => {
      const next = layout(main, mqMobile.matches);
      const key = JSON.stringify(next);
      if (key !== last) {
        last = key;
        setShapes(next);
      }
      setDesktop(mqDesktop.matches);
    };
    // Con espera: durante animaciones de alto (acordeones) el tamaño de <main> cambia en cada cuadro
    const update = () => {
      clearTimeout(timer);
      timer = window.setTimeout(run, 150);
    };
    run();
    const ro = new ResizeObserver(update);
    ro.observe(main);
    mqMobile.addEventListener('change', update);
    mqDesktop.addEventListener('change', update);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
      mqMobile.removeEventListener('change', update);
      mqDesktop.removeEventListener('change', update);
    };
  }, [pathname]);

  return (
    <div ref={ref} className={styles.layer} aria-hidden>
      {shapes.map((s, i) => {
        const h = s.kind === 'circle' ? s.w : s.w * 0.35;
        const dir = s.side === 'left' ? 1 : -1;
        const style = {
          top: s.cy - h / 2,
          [s.side]: -s.out,
          width: s.w,
          height: h,
          '--glow': `${s.w * GLOW[s.kind]}px`,
          '--glow-x': `${dir * s.w * GLOW_SHIFT}px`,
          rotate: s.kind === 'pill' ? `${dir * -18}deg` : undefined,
        } as CSSProperties;
        return (
          <m.span
            key={`${pathname}-${i}`}
            className={[styles.shape, styles[s.kind]].join(' ')}
            style={style}
            initial={{ opacity: 0 }}
            animate={desktop ? { opacity: 1, x: [0, dir * 18, 0], y: [0, -14, 0] } : { opacity: 1 }}
            transition={{ duration: 22 + (i % 3) * 6, repeat: Infinity, ease: 'easeInOut', opacity: { duration: 1.2, repeat: 0 } }}
          />
        );
      })}
    </div>
  );
}
