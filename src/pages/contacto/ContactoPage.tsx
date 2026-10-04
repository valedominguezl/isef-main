import { useState } from 'react';
import { Clock, ExternalLink, MapPin, MessageCircle } from 'lucide-react';
import { sitio } from '@/content';
import { formatPhone, whatsappUrl } from '@/lib/format';
import Seo, { breadcrumbJsonLd } from '@/components/seo/Seo';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';
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

      <Section labelledBy="tel-title" width="wide">
        <SectionHeader id="tel-title" title="Teléfonos *de contacto*" lead="Todos los números funcionan por WhatsApp." />
        <RevealGroup className={styles.grid}>
          {sitio.telefonos.map((t) => (
            <RevealItem key={t.area + (t.sede ?? '')} as="article" className={styles.card}>
              <MessageCircle className={styles.icon} aria-hidden />
              <div>
                {t.sede && <p className={styles.sede}>{t.sede}</p>}
                <h3>{t.area}</h3>
              </div>
              <p className={styles.desc}>{t.descripcion}</p>
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
            <RevealItem key={s.nombre} as="article" className={styles.sedeCard}>
              <div className={`${styles.sedeHead} on-dark`}>
                <p>{s.tipo}</p>
                <h3>{s.nombre}</h3>
              </div>
              <Mapa src={s.mapaEmbed} title={`Mapa de la sede ${s.nombre}`} />
              <div className={styles.sedeBody}>
                <p>
                  <MapPin size={18} aria-hidden /> {s.direccion}
                </p>
                <p>
                  <Clock size={18} aria-hidden /> {s.horario}
                </p>
                <Button href={s.mapaUrl} variant="outline" size="sm" icon="external">
                  Cómo llegar
                </Button>
                {s.facebook && (
                  <a href={s.facebook} target="_blank" rel="noopener noreferrer" className={styles.fb}>
                    Facebook de la sede <ExternalLink size={14} aria-hidden />
                  </a>
                )}
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
    </>
  );
}
