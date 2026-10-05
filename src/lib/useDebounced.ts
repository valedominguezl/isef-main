import { useEffect, useState } from 'react';

/** Espera a que se deje de escribir: el valor se actualiza `delay` ms después del último cambio (vacío = inmediato). */
export function useDebounced<T>(value: T, delay = 350): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const empty = typeof value === 'string' && !value.trim();
    const t = setTimeout(() => setSettled(value), empty ? 0 : delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return settled;
}
