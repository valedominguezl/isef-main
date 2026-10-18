/**
 * Curvas y duraciones de Motion: las mismas que los tokens de src/styles/tokens.scss
 * (mantener sincronizados). Motion recibe segundos y arreglos, CSS recibe ms y cubic-bezier.
 */

/** --ease-emphasized: suave, sin arranque brusco (entradas y desplazamientos). */
export const EASE_EMPHASIZED = [0.25, 0.46, 0.45, 0.94] as const;
/** --ease-exit: salidas (arranca lento y se va rápido). */
export const EASE_EXIT = [0.4, 0, 1, 1] as const;
/** --ease-out: respuesta inmediata de la interfaz. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** --duration-fast / base / slow / reveal, en segundos. */
export const DURATION = { fast: 0.15, base: 0.3, slow: 0.5, reveal: 1.1 } as const;
