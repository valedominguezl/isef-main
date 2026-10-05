import { useState } from 'react';
import { KeyRound, Laptop } from 'lucide-react';
import logo from '@/assets/logo.webp';
import { useAdmin } from '../AdminContext';
import styles from '../Admin.module.scss';

/** Ingreso simple: contraseña + recordar. (La "contraseña" es la clave de acceso al repositorio; no se explica acá a propósito.) */
export default function Login() {
  const { login, useLocal } = useAdmin();
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className={styles.login}>
      <form
        className={styles.loginCard}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            await login(password, remember);
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <img src={logo} alt="" width={56} height={56} />
        <h1>Panel de administración</h1>
        <label className={styles.label} htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <label className={styles.checkRow}>
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Recordarme
        </label>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button type="submit" className={styles.btnPrimary} disabled={busy || !password}>
          <KeyRound size={18} /> {busy ? 'Ingresando…' : 'Ingresar'}
        </button>
        {import.meta.env.DEV && (
          <button type="button" className={styles.btnGhost} onClick={useLocal}>
            <Laptop size={16} /> Usar modo local (escribe en tu disco)
          </button>
        )}
      </form>
    </div>
  );
}
