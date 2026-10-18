import { createContext, lazy, Suspense, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const SearchOverlay = lazy(() => import('./SearchOverlay'));

interface Ctx {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const SearchContext = createContext<Ctx>({ open: () => {}, close: () => {}, isOpen: false });

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const open = useCallback(() => {
    setMounted(true);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  // Atajo: Ctrl/Cmd + K. Sin atajos de una sola tecla («/»): se disparan sin querer con dictado por voz (WCAG 2.1.4)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/test-hiit')) return;
        e.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);
  return (
    <SearchContext.Provider value={value}>
      {children}
      {mounted && (
        <Suspense fallback={null}>
          <SearchOverlay open={isOpen} onClose={close} />
        </Suspense>
      )}
    </SearchContext.Provider>
  );
}

export const useSearch = () => useContext(SearchContext);
