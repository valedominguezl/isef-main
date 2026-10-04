import { Link } from 'react-router-dom';
import { Clock, ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import logo from '@/assets/logo.webp';
import { sitio } from '@/content';
import { useConsent } from '@/features/consent/ConsentContext';
import { formatPhone, whatsappUrl } from '@/lib/format';
import { socialIcon } from '../ui/Icons';
import { MAIN_NAV, SECONDARY_NAV } from './nav';
import styles from './Footer.module.scss';

export default function Footer() {
  const { openSettings } = useConsent();
  const year = new Date().getFullYear();

  return (
    <footer className={`${styles.footer} on-dark`}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <Link to="/" className={styles.brand}>
            <img src={logo} alt="" width={48} height={48} loading="lazy" />
            <span>
              <strong>{sitio.nombre}</strong>
              <small>Profesorado de Educación Física · Desde {sitio.fundacion}</small>
            </span>
          </Link>
          <ul className={styles.social} role="list" aria-label="Redes sociales">
            {sitio.redes.map((r) => {
              const Icon = socialIcon[r.red];
              return (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" aria-label={`${r.red === 'facebook' ? 'Facebook' : 'Instagram'}: ${r.etiqueta}`} title={r.etiqueta}>
                    <Icon size={20} />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <nav aria-label="Secciones" className={styles.col}>
          <h2 className={styles.title}>Secciones</h2>
          <ul role="list">
            {MAIN_NAV.map((i) => (
              <li key={i.to}>
                <Link to={i.to}>{i.label}</Link>
              </li>
            ))}
            {SECONDARY_NAV.filter((i) => !i.to.includes('privacidad')).map((i) => (
              <li key={i.to}>
                {i.external ? (
                  <a href={i.to} target="_blank" rel="noopener noreferrer">
                    {i.label} <ExternalLink size={12} aria-hidden />
                  </a>
                ) : (
                  <Link to={i.to}>{i.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {sitio.sedes.map((s) => (
          <address key={s.nombre} className={styles.col}>
            <h2 className={styles.title}>
              {s.nombre} <small>· {s.tipo}</small>
            </h2>
            <ul role="list" className={styles.contact}>
              <li>
                <MapPin size={16} aria-hidden />
                <a href={s.mapaUrl} target="_blank" rel="noopener noreferrer">
                  {s.direccion}
                </a>
              </li>
              <li>
                <Phone size={16} aria-hidden />
                <a href={whatsappUrl(s.telefono)} target="_blank" rel="noopener noreferrer">
                  {formatPhone(s.telefono)}
                </a>
              </li>
              <li>
                <Mail size={16} aria-hidden />
                <a href={`mailto:${sitio.email}`}>{sitio.email}</a>
              </li>
              <li>
                <Clock size={16} aria-hidden />
                <span>{s.horario}</span>
              </li>
            </ul>
          </address>
        ))}
      </div>

      <div className={styles.bottom}>
        <p>
          © {year} {sitio.nombreLargo}. Todos los derechos reservados.
        </p>
        <div className={styles.legal}>
          <Link to="/contacto">Todos los teléfonos</Link>
          <Link to="/privacidad">Política de privacidad</Link>
          <button type="button" onClick={openSettings}>
            Configurar cookies
          </button>
        </div>
      </div>
    </footer>
  );
}
