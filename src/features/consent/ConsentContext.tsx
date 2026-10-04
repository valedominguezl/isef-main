import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { applyConsent, type ConsentState } from '@/lib/analytics';

const KEY = 'isef-consent-v2';

interface Ctx {
  consent: ConsentState;
  decided: boolean;
  settingsOpen: boolean;
  save: (c: ConsentState) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

const ConsentContext = createContext<Ctx | null>(null);

function read(): { consent: ConsentState; decided: boolean } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { consent: JSON.parse(raw) as ConsentState, decided: true };
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

  const save = useCallback((c: ConsentState) => {
    setConsent(c);
    setDecided(true);
    setSettingsOpen(false);
    try {
      localStorage.setItem(KEY, JSON.stringify(c));
    } catch {
      /* noop */
    }
    applyConsent(c);
  }, []);

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
