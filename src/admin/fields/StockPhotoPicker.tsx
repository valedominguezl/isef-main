import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, ScanSearch, Search } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { isAbort, type FotoStock } from '../api';
import { Button } from '../ui/Button';
import Modal from '../ui/Modal';
import styles from '../Admin.module.scss';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Búsqueda con la que abre (p. ej. las palabras que sugirió la IA). Vacía: espera a que se escriba. */
  query: string;
  /** Procesa y deja la foto elegida como cualquier foto subida. Si falla, el error se muestra acá. */
  onPick: (foto: Blob) => Promise<void>;
}

type Estado = { tipo: 'inicio' } | { tipo: 'buscando' } | { tipo: 'listo'; fotos: FotoStock[] } | { tipo: 'error'; mensaje: string };

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Buscador de fotos gratuitas (Pexels / dominio público). */
export default function StockPhotoPicker({ open, onClose, query, onPick }: Props) {
  const { api } = useAdmin();
  const [q, setQ] = useState(query);
  const [estado, setEstado] = useState<Estado>({ tipo: 'inicio' });
  const [elegida, setElegida] = useState<string | null>(null);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const pedido = useRef<AbortController | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const buscar = async (texto: string) => {
    const t = texto.trim();
    if (!t) return;
    pedido.current?.abort();
    const ctrl = new AbortController();
    pedido.current = ctrl;
    setErrorFoto(null);
    setEstado({ tipo: 'buscando' });
    try {
      setEstado({ tipo: 'listo', fotos: await api.buscarFotos(t, ctrl.signal) });
    } catch (e) {
      if (!isAbort(e)) setEstado({ tipo: 'error', mensaje: (e as Error).message });
    }
  };

  // Cada vez que se abre: arranca con la búsqueda sugerida (si hay)
  useEffect(() => {
    if (!open) {
      pedido.current?.abort();
      return;
    }
    setQ(query);
    setElegida(null);
    setErrorFoto(null);
    setEstado({ tipo: 'inicio' });
    if (query.trim()) buscar(query);
  }, [open, query]); // eslint-disable-line react-hooks/exhaustive-deps

  const elegir = async (f: FotoStock) => {
    const ctrl = new AbortController();
    pedido.current?.abort();
    pedido.current = ctrl;
    setElegida(f.url);
    setErrorFoto(null);
    try {
      await onPick(await api.descargarFoto(f.url, ctrl.signal));
      onClose();
    } catch (e) {
      if (!isAbort(e)) setErrorFoto((e as Error).message || 'No se pudo usar esa foto. Probá con otra.');
    } finally {
      setElegida(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Buscar foto gratis" icon={ScanSearch} wide initialFocus={input}>
      <form
        className={styles.stockSearch}
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          buscar(q);
        }}
      >
        <label className={styles.search}>
          <Search size={16} aria-hidden />
          <input ref={input} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej.: running track, gym, yoga" aria-label="Qué foto buscar" />
        </label>
        <Button type="submit" variant="primary" icon={Search} disabled={!q.trim() || estado.tipo === 'buscando'}>
          Buscar
        </Button>
      </form>

      {errorFoto && (
        <p className={styles.error} role="alert">
          {errorFoto}
        </p>
      )}

      <div aria-live="polite" aria-busy={estado.tipo === 'buscando'}>
        {estado.tipo === 'buscando' && (
          <ul className={styles.stockGrid} aria-label="Buscando fotos…">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i}>
                <span className={[styles.sk, styles.stockSk].join(' ')} />
              </li>
            ))}
          </ul>
        )}
        {estado.tipo === 'error' && (
          <p className={styles.error} role="alert">
            {estado.mensaje}
          </p>
        )}
        {estado.tipo === 'listo' && !estado.fotos.length && <p className={styles.stockEmpty}>No encontramos fotos. Probá con otras palabras.</p>}
        {estado.tipo === 'listo' && estado.fotos.length > 0 && (
          <ul className={styles.stockGrid}>
            {estado.fotos.map((f) => {
              const credito = [capital(f.fuente), f.autor].filter(Boolean).join(' · ');
              const cargando = elegida === f.url;
              return (
                <li key={f.url}>
                  <button type="button" className={styles.stockFoto} onClick={() => elegir(f)} disabled={elegida !== null} aria-label={`Usar foto: ${credito}`} aria-busy={cargando}>
                    <img src={f.miniatura} alt="" loading="lazy" />
                    {cargando && (
                      <span className={styles.stockBusy}>
                        <LoaderCircle size={24} className={styles.spin} aria-hidden />
                      </span>
                    )}
                  </button>
                  <small className={styles.stockCredit} title={credito}>
                    {credito}
                  </small>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
