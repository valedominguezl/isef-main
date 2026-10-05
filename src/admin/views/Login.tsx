import { useId, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { ChevronDown, KeyRound, Laptop } from 'lucide-react';
import logo from '@/assets/logo.webp';
import { REPO, useAdmin } from '../AdminContext';
import styles from '../Admin.module.scss';

export default function Login() {
  const { login, useLocal } = useAdmin();
  const [token, setToken] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [howto, setHowto] = useState(false);
  const howtoId = useId();

  return (
    <div className={styles.login}>
      <form
        className={styles.loginCard}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            await login(token, remember);
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <img src={logo} alt="" width={56} height={56} />
        <h1>Panel de administración</h1>
        <p className={styles.help}>
          Ingresá con tu token de GitHub del repositorio{' '}
          <code>
            {REPO.owner}/{REPO.repo}
          </code>
          . Los cambios se publican en el sitio en 1 o 2 minutos.
        </p>
        <label className={styles.label} htmlFor="token">
          Token de acceso
        </label>
        <input
          id="token"
          type="password"
          className={styles.input}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="github_pat_…"
          autoComplete="current-password"
          required
        />
        <label className={styles.checkRow}>
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Recordarme en este dispositivo
        </label>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button type="submit" className={styles.btnPrimary} disabled={busy || !token}>
          <KeyRound size={18} /> {busy ? 'Verificando…' : 'Ingresar'}
        </button>
        {import.meta.env.DEV && (
          <button type="button" className={styles.btnGhost} onClick={useLocal}>
            <Laptop size={16} /> Usar modo local (escribe en tu disco)
          </button>
        )}
        {/* Instructivo plegable: abre y cierra con altura + fundido */}
        <div className={styles.howto}>
          <button type="button" aria-expanded={howto} aria-controls={howtoId} onClick={() => setHowto((v) => !v)}>
            ¿Cómo creo el token? <ChevronDown size={16} aria-hidden />
          </button>
          <AnimatePresence initial={false}>
            {howto && (
              <m.div
                id={howtoId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }}
                exit={{ height: 0, opacity: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
              >
                <ol>
                  <li>
                    Entrá a{' '}
                    <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
                      GitHub → Fine-grained tokens
                    </a>
                    .
                  </li>
                  <li>
                    En <em>Repository access</em> elegí <strong>Only select repositories</strong> → <code>{REPO.repo}</code>.
                  </li>
                  <li>
                    En <em>Permissions</em>: <strong>Contents: Read and write</strong> y <strong>Actions: Read-only</strong>.
                  </li>
                  <li>Generalo, copialo y pegalo acá. Guardalo en un lugar seguro: GitHub no lo vuelve a mostrar.</li>
                </ol>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}
