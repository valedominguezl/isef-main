import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { BadgeCheck, CircleAlert, ShieldCheck } from 'lucide-react';
import Seo from '@/components/seo/Seo';
import Section from '@/components/ui/Section';
import { formatDate } from '@/lib/format';
import styles from './VerificarPage.module.scss';

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
  }, [c]);

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
            const v = normalizarCodigo(input);
            setParams(v ? { c: v } : {});
          }}
        >
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="ISEF-XXXX-XXXX" aria-label="Código del certificado" autoComplete="off" spellCheck={false} />
          <button type="submit" disabled={cargando}>
            {cargando ? 'Verificando…' : 'Verificar'}
          </button>
        </form>

        <div aria-live="polite">
          {res?.estado === 'valido' && (
            <div className={`${styles.resultado} ${styles.valido}`}>
              <BadgeCheck size={28} aria-hidden />
              <div>
                <p className={styles.estado}>Certificado válido</p>
                <p className={styles.nombre}>{res.nombre}</p>
                <p>{res.actividad}</p>
                <p className={styles.meta}>
                  Emitido el {formatDate(res.fecha)} · Código {res.codigo}
                </p>
              </div>
            </div>
          )}
          {res?.estado === 'invalido' && (
            <div className={`${styles.resultado} ${styles.invalido}`}>
              <CircleAlert size={28} aria-hidden />
              <div>
                <p className={styles.estado}>No encontramos ese código</p>
                <p>Revisá que esté bien escrito. Si el problema sigue, escribinos y lo revisamos.</p>
              </div>
            </div>
          )}
          {res?.estado === 'error' && <p className={styles.error}>{res.mensaje}</p>}
        </div>
      </Section>
    </>
  );
}
