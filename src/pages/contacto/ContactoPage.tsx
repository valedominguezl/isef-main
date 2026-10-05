import { ArrowUpRight } from 'lucide-react';
import { sitio } from '@/content';
import { formatPhone, whatsappUrl } from '@/lib/format';
import Seo, { breadcrumbJsonLd } from '@/components/seo/Seo';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import CardGrid from '@/components/ui/CardGrid';
import SedeCard from '@/components/cards/SedeCard';
import styles from './ContactoPage.module.scss';

/** Mapa de Google Maps embebido (diferido: se carga al acercarse a la vista). */
function Mapa({ src, title }: { src: string; title: string }) {
  return <iframe src={src} title={title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className={styles.map} />;
}

/** Una fila por número: el directorio se lee como tabla y cada fila lleva a ese WhatsApp. */
const filas = sitio.telefonos.flatMap((t) => t.numeros.map((n) => ({ ...t, numero: n })));

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
        <RevealGroup as="ul" className={styles.directory}>
          {filas.map((t) => (
            <RevealItem key={t.numero} as="li">
              <a
                className={styles.row}
                href={whatsappUrl(t.numero)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t.area}${t.sede ? ` (${t.sede})` : ''}: escribir por WhatsApp al ${formatPhone(t.numero)}`}
              >
                <span className={styles.area}>
                  {t.area}
                  {t.sede && <span className={styles.sede}> · {t.sede}</span>}
                </span>
                <span className={styles.desc} title={t.descripcion}>
                  {t.descripcion}
                </span>
                <span className={styles.num}>{formatPhone(t.numero)}</span>
                <span className={styles.go} aria-hidden>
                  <ArrowUpRight size={18} />
                </span>
              </a>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section id="sedes" tone="tint" width="wide" labelledBy="sedes-title">
        <SectionHeader id="sedes-title" title="Nuestras *sedes*" lead="Cómo llegar a cada una." />
        <CardGrid reveal cols={2}>
          {sitio.sedes.map((s) => (
            <RevealItem key={s.nombre}>
              <SedeCard sede={s} media={<Mapa src={s.mapaEmbed} title={`Mapa de la sede ${s.nombre}`} />} />
            </RevealItem>
          ))}
        </CardGrid>
      </Section>
    </>
  );
}
