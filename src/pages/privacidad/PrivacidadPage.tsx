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

          <h2>1. Responsable de los datos</h2>
          <p>
            {sitio.nombreLargo}, con domicilio en {sitio.sedes[0]?.direccion}, {sitio.sedes[0]?.ciudad}. Contacto:{' '}
            <a href={`mailto:${sitio.email}`}>{sitio.email}</a>.
          </p>

          <h2>2. Qué datos recopilamos y para qué</h2>
          <p>
            Este sitio <strong>no tiene formularios ni cuentas de usuario</strong> y no recopila datos personales identificables. Cuando nos
            escribís por WhatsApp o correo electrónico, usamos esos datos solo para responderte y no los cedemos a terceros; además se rigen por
            las políticas de esos servicios.
          </p>
          <p>
            Si aceptás la analítica, se registran datos de navegación <strong>no identificatorios</strong> (páginas vistas, dispositivo, ciudad
            aproximada) para mejorar el sitio.
          </p>

          <h2>3. Qué son las cookies</h2>
          <p>Las cookies son pequeños archivos que el navegador guarda para recordar información entre visitas.</p>

          <h2>4. Cookies que usamos</h2>
          <ul>
            <li>
              <strong>Necesarias:</strong> guardan tu elección de cookies en el almacenamiento local del navegador durante 12 meses; después te
              volvemos a preguntar. No se pueden desactivar.
            </li>
            <li>
              <strong>Analítica (opcional):</strong> Google Analytics 4 (<code>_ga</code>, <code>_ga_*</code>) con IP anonimizada, para saber
              qué páginas se visitan y mejorar el sitio. Se conservan hasta 14 meses. Solo se activa si la aceptás.
            </li>
            <li>
              <strong>Publicidad (opcional):</strong> Google Tag Manager puede activar etiquetas para medir campañas de difusión de inscripciones.
              Solo se activa si la aceptás.
            </li>
          </ul>
          <p>
            La página de contacto muestra mapas de Google embebidos; al verlos rige la{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">política de privacidad de Google</a>.
          </p>

          <h2>5. Transferencia internacional</h2>
          <p>
            Google Analytics y Google Tag Manager son servicios de Google LLC, que puede procesar los datos en servidores fuera de la Argentina
            (por ejemplo, en Estados Unidos). Solo ocurre si aceptás esas categorías.
          </p>

          <h2>6. Cómo gestionar tus preferencias</h2>
          <p>Podés cambiar tu elección en cualquier momento. Si retirás un consentimiento, borramos las cookies de Google de este sitio:</p>
          <Button onClick={openSettings} icon="none">
            Abrir el centro de privacidad
          </Button>
          <p>También podés borrar o bloquear las cookies desde la configuración de tu navegador.</p>

          <h2>7. Tus derechos</h2>
          <p>
            Podés solicitar el acceso, la rectificación, la actualización o la supresión de tus datos personales escribiendo a{' '}
            <a href={`mailto:${sitio.email}`}>{sitio.email}</a>.
          </p>
          <p>
            El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no
            inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la
            Ley N° 25.326. La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la
            atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las
            normas vigentes en materia de protección de datos personales.
          </p>

          <h2>8. Cambios en esta política</h2>
          <p>Cualquier cambio se publicará en esta página con su fecha de actualización.</p>
        </article>
      </Section>
    </>
  );
}
