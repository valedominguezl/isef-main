import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { sitio } from '@/content';
import { formatPhone, whatsappUrl } from '@/lib/format';
import Seo, { breadcrumbJsonLd } from '@/components/seo/Seo';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import SedeCard from '@/components/cards/SedeCard';
import styles from './ContactoPage.module.scss';

/** El iframe de Google Maps se carga recién al hacer clic (privacidad + rendimiento). */
function Mapa({ src, title }: { src: string; title: string }) {
  const [on, setOn] = useState(false);
  return on ? (
    <iframe src={src} title={title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className={styles.map} />
  ) : (
    <button type="button" className={styles.mapPlaceholder} onClick={() => setOn(true)}>
      <MapPin size={28} aria-hidden />
      <span>Mostrar mapa interactivo</span>
      <small>Se cargará Google Maps</small>
    </button>
  );
}

export function Component() {
  return (
    <>
      <Seo
        title="Contacto y sedes"
        description="Teléfonos de rectoría, secretaría académica y secretarías administrativas, y ubicación de las sedes del I.S.E.F. en San Luis y Villa Mercedes."
        jsonLd={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Contacto', path: '/contacto' },
        ])}
      />
      <PageHero title="Contacto" subtitle="Toda la información de nuestras sedes" breadcrumbs={[{ name: 'Inicio', path: '/' }, { name: 'Contacto' }]} />

      <Section labelledBy="tel-title">
        <SectionHeader id="tel-title" title="Teléfonos *de contacto*" lead="Todos los números funcionan por WhatsApp." />
        {/* Directorio: una fila por área, los números a la derecha */}
        <RevealGroup as="ul" className={styles.directory}>
          {sitio.telefonos.map((t) => (
            <RevealItem key={t.area + (t.sede ?? '')} as="li" className={styles.row}>
              <div className={styles.area}>
                <h3>
                  {t.area}
                  {t.sede && <span className={styles.sede}> · {t.sede}</span>}
                </h3>
                <p className={styles.desc}>{t.descripcion}</p>
              </div>
              <ul role="list" className={styles.nums}>
                {t.numeros.map((n) => (
                  <li key={n}>
                    <a href={whatsappUrl(n)} target="_blank" rel="noopener noreferrer">
                      {formatPhone(n)}
                    </a>
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section id="sedes" tone="tint" width="wide" labelledBy="sedes-title">
        <SectionHeader id="sedes-title" title="Nuestras *sedes*" lead="Cómo llegar a cada una." />
        <RevealGroup className={styles.sedes}>
          {sitio.sedes.map((s) => (
            <RevealItem key={s.nombre}>
              <SedeCard sede={s} media={<Mapa src={s.mapaEmbed} title={`Mapa de la sede ${s.nombre}`} />} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
    </>
  );
}
