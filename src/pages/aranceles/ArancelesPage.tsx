import heroImg from '@/assets/media/aranceles/main.webp';
import { aranceles, paginas } from '@/content';
import { formatDate } from '@/lib/format';
import { Markdown } from '@/lib/markdown';
import Seo from '@/components/seo/Seo';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import Reveal from '@/components/ui/Reveal';
import { Component as NotFound } from '../NotFoundPage';
import styles from './ArancelesPage.module.scss';

/** Título y foto editables desde /admin → Páginas → Aranceles (la bajada es la nota de Aranceles). */
const textos = paginas.aranceles;

export function Component() {
  if (!aranceles.visible) return <NotFound />;
  return (
    <>
      <Seo title="Aranceles" description={`Valores de inscripción, cuotas y título. ${aranceles.nota}`} image={textos.hero.imagen ?? heroImg} />
      <PageHero image={textos.hero.imagen ?? heroImg} title={textos.hero.titulo} subtitle={aranceles.nota} breadcrumbs={[{ name: 'Inicio', path: '/' }, { name: 'Aranceles' }]} />
      <Section width="default">
        <Reveal className={styles.wrap}>
          <table className={styles.table}>
            <caption>Valores vigentes · actualizado el {formatDate(aranceles.actualizado)}</caption>
            <thead>
              <tr>
                <th scope="col">Concepto</th>
                <th scope="col">Carácter</th>
                <th scope="col">Cuotas</th>
                <th scope="col">Precio</th>
                <th scope="col">Con descuento</th>
              </tr>
            </thead>
            {aranceles.grupos.map((g) => (
              <tbody key={g.nombre}>
                <tr className={styles.group}>
                  <th scope="rowgroup" colSpan={5}>
                    {g.nombre}
                  </th>
                </tr>
                {g.items.map((it) => (
                  <tr key={it.concepto}>
                    <th scope="row">
                      {it.concepto}
                      {it.detalle && <small>{it.detalle}</small>}
                    </th>
                    <td data-label="Carácter">{it.caracter}</td>
                    <td data-label="Cuotas">{it.cuotas ?? '—'}</td>
                    <td data-label="Precio">{it.precio ?? '—'}</td>
                    <td data-label="Con descuento">{it.precioDescuento ? <strong>{it.precioDescuento}</strong> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
          <Markdown text={aranceles.uniforme} className={styles.note} />
        </Reveal>
      </Section>
    </>
  );
}
