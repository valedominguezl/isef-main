import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { applyConsent, type ConsentState } from '@/lib/analytics';

const KEY = 'isef-consent-v2';
/** La elección vence a los 12 meses y se vuelve a preguntar (buena práctica; las guías europeas usan 13). */
const MAX_AGE = 365 * 864e5;

interface Ctx {
  consent: ConsentState;
  decided: boolean;
  settingsOpen: boolean;
  save: (c: ConsentState) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

const ConsentContext = createContext<Ctx | null>(null);

/** Borra _ga, _ga_*, _gid, _gcl_* en el dominio actual y el principal (.isefsanluis.net). */
function removeGoogleCookies() {
  const host = window.location.hostname;
  const domains = ['', host, `.${host.split('.').slice(-2).join('.')}`];
  for (const c of document.cookie.split(';')) {
    const name = c.split('=')[0].trim();
    if (!/^(_ga|_gid|_gat|_gcl)/.test(name)) continue;
    for (const d of domains) document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ''}`;
  }
}

function read(): { consent: ConsentState; decided: boolean } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const { analitica, publicidad, fecha } = JSON.parse(raw) as ConsentState & { fecha?: number };
      // Sin fecha (guardado por una versión anterior) o vencida: se vuelve a preguntar
      if (fecha && Date.now() - fecha < MAX_AGE) return { consent: { analitica, publicidad }, decided: true };
    }
  } catch {
    /* almacenamiento no disponible */
  }
  return { consent: { analitica: false, publicidad: false }, decided: false };
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>({ analitica: false, publicidad: false });
  // `null` hasta montar: evita diferencias entre el HTML prerenderizado y el cliente.
  const [decided, setDecided] = useState<boolean | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const stored = read();
    setConsent(stored.consent);
    setDecided(stored.decided);
    if (stored.decided) applyConsent(stored.consent);
  }, []);

  const save = useCallback(
    (c: ConsentState) => {
      const revoked = (consent.analitica && !c.analitica) || (consent.publicidad && !c.publicidad);
      setConsent(c);
      setDecided(true);
      setSettingsOpen(false);
      try {
        localStorage.setItem(KEY, JSON.stringify({ ...c, fecha: Date.now() }));
      } catch {
        /* noop */
      }
      applyConsent(c);
      // Retirar el consentimiento: borrar las cookies de Google y recargar para descargar las etiquetas ya activas
      if (revoked) {
        removeGoogleCookies();
        window.location.reload();
      }
    },
    [consent],
  );

  const value = useMemo<Ctx>(
    () => ({
      consent,
      decided: decided !== false,
      settingsOpen,
      save,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
    }),
    [consent, decided, settingsOpen, save],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent fuera de ConsentProvider');
  return ctx;
}
