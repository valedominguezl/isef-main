import { useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { normalize } from '@/lib/format';
import adm from '../Admin.module.scss';
import s from './Combobox.module.scss';

interface Props {
  id: string;
  value: string;
  onChange: (v: string) => void;
  opciones: string[];
  placeholder?: string;
  /** Texto bajo la lista cuando lo escrito no coincide con ninguna opción. */
  libre?: string;
  /** aria-invalid / aria-describedby / aria-required del campo (ayuda y error conectados). */
  a11y?: Record<string, string | boolean | undefined>;
}

/**
 * Campo de texto con lista desplegable: se elige una opción o se escribe cualquier otra cosa.
 * La lista muestra todas las opciones al abrir y se filtra al escribir (el <datalist> del navegador
 * solo muestra las que coinciden con lo escrito, así que con un valor cargado no mostraba nada).
 */
export default function Combobox({ id, value, onChange, opciones, placeholder, libre = 'Se usa lo que escribiste.', a11y }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState(-1);
  // Al abrir se muestran todas; al escribir, se filtra
  const [filtrar, setFiltrar] = useState(false);
  const lista = useId();
  const input = useRef<HTMLInputElement>(null);
  const n = normalize(value.trim());
  const visibles = filtrar && n ? opciones.filter((o) => normalize(o).includes(n)) : opciones;
  const exacta = opciones.some((o) => normalize(o) === n);

  const elegir = (o: string) => {
    onChange(o);
    setAbierto(false);
    setFiltrar(false);
    setActiva(-1);
  };

  return (
    <div className={s.caja}>
      <input
        ref={input}
        id={id}
        className={adm.input}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        {...a11y}
        role="combobox"
        aria-expanded={abierto}
        aria-controls={lista}
        aria-autocomplete="list"
        aria-activedescendant={abierto && activa >= 0 ? `${lista}-${activa}` : undefined}
        // Se abre con clic, al escribir o con ↓ (no al recibir el foco: al cerrar un diálogo el foco vuelve acá)
        onClick={() => setAbierto(true)}
        onBlur={() => {
          setAbierto(false);
          setFiltrar(false);
        }}
        onChange={(e) => {
          onChange(e.target.value);
          setAbierto(true);
          setFiltrar(true);
          setActiva(-1);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setAbierto(true);
            setActiva((a) => Math.min(a + 1, visibles.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiva((a) => Math.max(a - 1, 0));
          } else if (e.key === 'Enter' && abierto && activa >= 0 && visibles[activa]) {
            e.preventDefault();
            elegir(visibles[activa]);
          } else if (e.key === 'Escape' && abierto) {
            e.preventDefault();
            setAbierto(false);
          }
        }}
      />
      <button
        type="button"
        className={s.boton}
        tabIndex={-1}
        aria-label={abierto ? 'Cerrar la lista' : 'Ver la lista'}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          setFiltrar(false);
          setAbierto((a) => !a);
          input.current?.focus();
        }}
      >
        <ChevronDown size={18} aria-hidden data-abierto={abierto || undefined} />
      </button>
      {abierto && (visibles.length > 0 || (n && !exacta)) && (
        <ul id={lista} role="listbox" className={s.lista} onMouseDown={(e) => e.preventDefault()}>
          {visibles.map((o, i) => (
            <li key={o} id={`${lista}-${i}`} role="option" aria-selected={normalize(o) === n} data-activa={i === activa || undefined} onClick={() => elegir(o)}>
              {o}
            </li>
          ))}
          {n && !exacta && <li className={s.libre}>{visibles.length ? `O dejá «${value.trim()}»: ${libre.toLowerCase()}` : libre}</li>}
        </ul>
      )}
    </div>
  );
}
