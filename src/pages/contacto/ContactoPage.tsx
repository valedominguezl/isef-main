import { ArrowUpRight } from 'lucide-react';
import { paginas, sitio } from '@/content';
import { Markdown } from '@/lib/markdown';
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

/** Textos y fotos editables desde /admin → Páginas → Contacto (sin foto de cabecera, salvo que se cargue una). */
const textos = paginas.contacto;

export function Component() {
  return (
    <>
      <Seo
        title="Contacto y sedes"
        description="Teléfonos de rectoría, secretaría académica y secretarías administrativas, y ubicación de las sedes del I.S.E.F. en San Luis y Villa Mercedes."
        image={textos.hero.imagen}
        jsonLd={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Contacto', path: '/contacto' },
        ])}
      />
      <PageHero image={textos.hero.imagen} title={textos.hero.titulo} subtitle={textos.hero.subtitulo} breadcrumbs={[{ name: 'Inicio', path: '/' }, { name: 'Contacto' }]} />

      <Section labelledBy="tel-title">
        <SectionHeader id="tel-title" title={textos.telefonos.titulo} lead={<Markdown text={textos.telefonos.texto} />} />
        <RevealGroup as="ul" className={styles.directory}>
          {filas.map((t) => (
            <RevealItem key={t.numero} as="li">
              <a
                className={styles.row}
                href={whatsappUrl(t.numero)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.area}>
                  {t.area}
                  {t.sede && <span className={styles.sede}> · {t.sede}</span>}
                </span>
                <span className={styles.desc} title={t.descripcion}>
                  {t.descripcion}
                </span>
                <span className={styles.num}>{formatPhone(t.numero)}</span>
                <span className="sr-only"> — escribir por WhatsApp (se abre en otra pestaña)</span>
                <span className={styles.go} aria-hidden>
                  <ArrowUpRight size={18} />
                </span>
              </a>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section id="sedes" tone="tint" width="wide" labelledBy="sedes-title">
        <SectionHeader id="sedes-title" title={textos.sedes.titulo} lead={<Markdown text={textos.sedes.texto} />} />
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
