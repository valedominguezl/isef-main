import { sitio } from '@/content';
import { useConsent } from '@/features/consent/ConsentContext';
import Seo from '@/components/seo/Seo';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';
import styles from './PrivacidadPage.module.scss';

const ACTUALIZADO = '4 de octubre de 2026';

export function Component() {
  const { openSettings } = useConsent();
  return (
    <>
      <Seo title="Política de privacidad y cookies" description={`Cómo el ${sitio.nombre} trata tus datos personales y qué cookies utiliza este sitio.`} />
      <PageHero title="Política de privacidad y cookies" subtitle="Cómo protegemos tu privacidad y tus datos personales" breadcrumbs={[{ name: 'Inicio', path: '/' }, { name: 'Privacidad' }]} />
      <Section width="prose">
        <article className={styles.doc}>
          <p>
            <strong>Última actualización: {ACTUALIZADO}</strong>
          </p>
          <p>
            En el {sitio.nombreLargo} nos comprometemos a proteger tu privacidad, conforme a la Ley 25.326 de Protección de los Datos Personales
            de la República Argentina. Esta política explica qué información se recopila al usar este sitio y cómo podés controlarla.
          </p>

          <h2>1. Qué datos recopilamos</h2>
          <p>
            Este sitio <strong>no tiene formularios ni cuentas de usuario</strong> y no recopila datos personales identificables. Cuando nos
            escribís por WhatsApp o correo electrónico, esos datos se rigen por las políticas de esos servicios y solo los usamos para
            responderte.
          </p>

          <h2>2. Qué son las cookies</h2>
          <p>Las cookies son pequeños archivos que el navegador guarda para recordar información entre visitas.</p>

          <h2>3. Cookies que usamos</h2>
          <ul>
            <li>
              <strong>Necesarias:</strong> guardan tu elección de cookies en el almacenamiento local del navegador. No se pueden desactivar.
            </li>
            <li>
              <strong>Analítica (opcional):</strong> Google Analytics 4 (<code>_ga</code>, <code>_ga_*</code>) con IP anonimizada, para saber
              qué páginas se visitan y mejorar el sitio. Solo se activa si la aceptás.
            </li>
            <li>
              <strong>Publicidad (opcional):</strong> Google Tag Manager puede activar etiquetas para medir campañas de difusión de inscripciones.
              Solo se activa si la aceptás.
            </li>
          </ul>
          <p>
            Los mapas de Google de la página de contacto se cargan <strong>solo si hacés clic</strong> en ellos; a partir de ese momento rige la
            política de privacidad de Google.
          </p>

          <h2>4. Cómo gestionar tus preferencias</h2>
          <p>Podés cambiar tu elección en cualquier momento:</p>
          <Button onClick={openSettings} icon="none">
            Abrir el centro de privacidad
          </Button>
          <p>También podés borrar o bloquear las cookies desde la configuración de tu navegador.</p>

          <h2>5. Tus derechos</h2>
          <p>
            Podés solicitar acceso, rectificación o supresión de tus datos personales escribiendo a{' '}
            <a href={`mailto:${sitio.email}`}>{sitio.email}</a>. La Agencia de Acceso a la Información Pública, órgano de control de la Ley 25.326,
            atiende denuncias y reclamos relacionados con el incumplimiento de las normas sobre protección de datos personales.
          </p>

          <h2>6. Cambios en esta política</h2>
          <p>Cualquier cambio se publicará en esta página con su fecha de actualización.</p>
        </article>
      </Section>
    </>
  );
}
