import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { AnimatePresence, m } from 'motion/react';
import { BadgeCheck, CircleAlert, ShieldCheck } from 'lucide-react';
import Seo from '@/components/seo/Seo';
import Section from '@/components/ui/Section';
import { formatDate } from '@/lib/format';
import { EASE_EMPHASIZED, EASE_EXIT } from '@/lib/motion';
import styles from './VerificarPage.module.scss';

/** Entrada del resultado: se llega escaneando el QR, es un momento que merece aparecer (no de golpe). */
const resultadoAnim = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE_EMPHASIZED } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: EASE_EXIT } },
};

type Resultado =
  | { estado: 'valido'; codigo: string; nombre: string; actividad: string; fecha: string }
  | { estado: 'invalido'; codigo: string }
  | { estado: 'error'; mensaje: string };

const FORMATO = /^ISEF-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/** Arregla lo que se tipea a mano: minúsculas, espacios, sin guiones. */
function normalizarCodigo(s: string) {
  const t = s.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const sinPrefijo = t.startsWith('ISEF') ? t.slice(4) : t;
  return sinPrefijo.length === 8 ? `ISEF-${sinPrefijo.slice(0, 4)}-${sinPrefijo.slice(4)}` : s.trim().toUpperCase();
}

async function consultar(codigo: string): Promise<Resultado> {
  try {
    const r = await fetch(`/api/verificar?c=${encodeURIComponent(codigo)}`, { cache: 'no-store' });
    if (!(r.headers.get('content-type') ?? '').includes('application/json')) return { estado: 'error', mensaje: 'La verificación funciona en el sitio publicado.' };
    const d = (await r.json()) as { valido?: boolean; nombre?: string; actividad?: string; fecha?: string; error?: string };
    if (!r.ok) return { estado: 'error', mensaje: d.error ?? 'No se pudo verificar ahora. Probá de nuevo en un rato.' };
    return d.valido ? { estado: 'valido', codigo, nombre: d.nombre ?? '', actividad: d.actividad ?? '', fecha: d.fecha ?? '' } : { estado: 'invalido', codigo };
  } catch {
    return { estado: 'error', mensaje: 'Sin conexión. Probá de nuevo.' };
  }
}

/** /verificar?c=ISEF-XXXX-XXXX → confirma que un certificado lo emitió el instituto (a esta página lleva el QR). */
export function Component() {
  const [params, setParams] = useSearchParams();
  const c = params.get('c') ?? '';
  const [input, setInput] = useState(c);
  const [res, setRes] = useState<Resultado | null>(null);
  const [cargando, setCargando] = useState(false);
  // Volver a apretar «Verificar» con el mismo código reintenta (después de «Sin conexión», por ejemplo)
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    setInput(c);
    if (!c) {
      setRes(null);
      return;
    }
    const codigo = normalizarCodigo(c);
    if (!FORMATO.test(codigo)) {
      setRes({ estado: 'error', mensaje: 'El código tiene la forma ISEF-XXXX-XXXX (está abajo a la izquierda del certificado).' });
      return;
    }
    let vivo = true;
    setCargando(true);
    void consultar(codigo).then((r) => {
      if (!vivo) return;
      setRes(r);
      setCargando(false);
    });
    return () => {
      vivo = false;
    };
  }, [c, intento]);

  const error = res?.estado === 'error';

  return (
    <>
      <Seo title="Verificar un certificado" noindex />
      <Section width="narrow" className={styles.page}>
        <ShieldCheck size={40} className={styles.icono} aria-hidden />
        <h1 className={styles.title}>Verificar un certificado</h1>
        <p className={styles.lead}>Ingresá el código que figura en el certificado (o escaneá su QR) para confirmar que lo emitió el instituto.</p>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (cargando) return;
            const v = normalizarCodigo(input);
            setParams(v ? { c: v } : {});
            if (v === c) setIntento((i) => i + 1);
          }}
        >
          <label htmlFor="codigo" className={styles.label}>
            Código del certificado
          </label>
          <div className={styles.fields}>
            <input
              id="codigo"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ISEF-XXXX-XXXX"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-describedby={error ? 'codigo-ayuda codigo-error' : 'codigo-ayuda'}
              aria-invalid={error || undefined}
            />
            {/* aria-disabled (no disabled): el botón no pierde el foco mientras consulta */}
            <button type="submit" aria-disabled={cargando || undefined}>
              {cargando ? 'Verificando…' : 'Verificar'}
            </button>
          </div>
          <p id="codigo-ayuda" className={styles.ayuda}>
            Está abajo a la izquierda del certificado.
          </p>
        </form>

        <div aria-live="polite" className={cargando ? styles.pending : undefined}>
          <AnimatePresence mode="wait" initial={false}>
            {res?.estado === 'valido' && (
              <m.div key={`valido-${res.codigo}`} className={`${styles.resultado} ${styles.valido}`} {...resultadoAnim}>
                <m.span
                  className={styles.sello}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1, transition: { duration: 0.5, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] } }}
                >
                  <BadgeCheck size={28} aria-hidden />
                </m.span>
                <div>
                  <p className={styles.estado}>Certificado válido</p>
                  <p className={styles.nombre}>{res.nombre}</p>
                  <p>{res.actividad}</p>
                  <p className={styles.meta}>
                    Fecha del certificado: {formatDate(res.fecha)} · Código {res.codigo}
                  </p>
                </div>
              </m.div>
            )}
            {res?.estado === 'invalido' && (
              <m.div key={`invalido-${res.codigo}`} className={`${styles.resultado} ${styles.invalido}`} {...resultadoAnim}>
                <CircleAlert size={28} aria-hidden />
                <div>
                  <p className={styles.estado}>No encontramos ese código</p>
                  <p>Revisá que esté bien escrito. Si el problema sigue, escribinos y lo revisamos.</p>
                </div>
              </m.div>
            )}
            {res?.estado === 'error' && (
              <m.p key={`error-${res.mensaje}-${intento}`} id="codigo-error" className={styles.error} {...resultadoAnim}>
                <CircleAlert size={18} aria-hidden /> {res.mensaje}
              </m.p>
            )}
          </AnimatePresence>
        </div>
      </Section>
    </>
  );
}
