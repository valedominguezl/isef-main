import { sitio } from '@/content';
import { track } from '@/lib/analytics';
import { whatsappUrl } from '@/lib/format';
import { WhatsAppIcon } from '../ui/Icons';
import styles from './WhatsAppButton.module.scss';

export default function WhatsAppButton() {
  return (
    <aside aria-label="Consultas por WhatsApp">
    <a
      className={`${styles.btn} no-print`}
      href={whatsappUrl(sitio.whatsapp, 'Hola! Quisiera hacer una consulta sobre el I.S.E.F.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      onClick={() => track('whatsapp_click', { origen: 'flotante' })}
    >
      <WhatsAppIcon size={30} />
      <span className={styles.label}>¿Consultas?</span>
    </a>
    </aside>
  );
}
