import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import { useConsent } from './ConsentContext';
import styles from './CookieBanner.module.scss';

const CATEGORIAS = [
  {
    key: 'necesarias',
    titulo: 'Estrictamente necesarias',
    texto: 'Guardan tus preferencias de cookies y el funcionamiento básico del sitio. No se pueden desactivar.',
    fija: true,
  },
  {
    key: 'analitica',
    titulo: 'Analítica',
    texto: 'Google Analytics 4 nos ayuda a entender qué páginas se visitan para mejorar el sitio. Los datos son anónimos (IP anonimizada).',
  },
  {
    key: 'publicidad',
    titulo: 'Publicidad',
    texto: 'Google Tag Manager puede activar etiquetas de campañas para medir la difusión de inscripciones en redes sociales.',
  },
] as const;

export default function CookieBanner() {
  const { decided, consent, save, settingsOpen, openSettings, closeSettings } = useConsent();
  const [draft, setDraft] = useState(consent);

  useEffect(() => setDraft(consent), [consent, settingsOpen]);

  return (
    <>
      {!decided && !settingsOpen && (
        <div className={styles.banner} role="region" aria-label="Aviso de cookies">
          <Cookie className={styles.icon} size={28} aria-hidden />
          <p className={styles.text}>
            Usamos cookies propias y de terceros para analizar el uso del sitio y mejorar tu experiencia. Podés aceptarlas,
            rechazarlas o configurarlas. <Link to="/privacidad">Política de privacidad</Link>.
          </p>
          <div className={styles.actions}>
            <Button variant="ghost" size="sm" icon="none" onClick={openSettings}>
              Configurar
            </Button>
            <Button variant="outline" size="sm" icon="none" onClick={() => save({ analitica: false, publicidad: false })}>
              Rechazar
            </Button>
            <Button size="sm" icon="none" onClick={() => save({ analitica: true, publicidad: true })}>
              Aceptar
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={settingsOpen}
        onClose={closeSettings}
        title="Centro de privacidad"
        footer={
          <>
            <Button variant="outline" size="sm" icon="none" onClick={() => save(draft)}>
              Guardar selección
            </Button>
            <Button size="sm" icon="none" onClick={() => save({ analitica: true, publicidad: true })}>
              Aceptar todas
            </Button>
          </>
        }
      >
        <div className={styles.list}>
          {CATEGORIAS.map((c) => {
            const fija = 'fija' in c && c.fija;
            const checked = fija ? true : draft[c.key as 'analitica' | 'publicidad'];
            return (
              <label key={c.key} className={styles.row}>
                <span className={styles.rowText}>
                  <strong>{c.titulo}</strong>
                  <span>{c.texto}</span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  className={styles.switch}
                  checked={checked}
                  disabled={fija}
                  onChange={(e) => setDraft((d) => ({ ...d, [c.key]: e.target.checked }))}
                />
              </label>
            );
          })}
        </div>
      </Dialog>
    </>
  );
}
