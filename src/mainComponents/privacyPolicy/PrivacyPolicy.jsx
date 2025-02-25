import React from "react";
import styles from "./PrivacyPolicy.module.scss";
import Intros from '@/components/reutilizables/intros/Intros.jsx'
import { useCookies } from '@/components/funciones/context/CookiesContext'

const PrivacyPolicy = () => {
  const { openCookieSettings } = useCookies();

  return (
    <div className='mainComponent'>

      <Intros
        heading="Política de privacidad y cookies"
        subHeading="Descubre cómo protegemos tu privacidad y tus datos personales."
        showButton={false}
      />

      <div className={styles.container}>
        <p><strong>Última actualización: 22/02/2025</strong></p>

        <p>
          Desde el I.S.E.F. San Luís <strong>nos comprometemos a proteger tu privacidad</strong> y a asegurarnos de que tengas una experiencia segura y agradable al utilizar nuestro sitio. Esta política explica cómo recopilamos, utilizamos, almacenamos y protegemos la información personal que se recoge a través del uso de nuestro sitio web, incluyendo el uso de <strong>cookies</strong>.
        </p>

        <div className={styles.titulo}>
          <h3>1. ¿Qué son las cookies?</h3>
          <div className="linea-svg"></div>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Estas cookies nos ayudan a <strong>mejorar la funcionalidad de la página</strong>, analizar el comportamiento del usuario, y proporcionarte una experiencia personalizada.
          </p>
        </div>

        <div className={styles.titulo}>
          <h3 >2. Tipos de cookies que usamos</h3>
          <div className="linea-svg"></div>
          <p>A continuación, se detallan las cookies que utilizamos y sus finalidades:</p>

          <div className={styles.cookieList}>
            <div className={styles.cookie}>
              <h3>2.1. Estrictamente necesarias</h3>
              <p>
                Estas cookies son esenciales para el funcionamiento básico del sitio web. Sin ellas, algunas funciones del sitio no pueden ejecutarse. <strong>No pueden desactivarse en nuestros sistemas</strong>.
              </p>
              <ul>
                <li><p><strong>Cookies utilizadas:</strong> ig_nrcb</p></li>
              </ul>
            </div>

            <div className={styles.cookie}>
              <h3>2.2. Rendimiento</h3>
              <p>
                Mejoran el rendimiento del sitio web y analizan cómo los usuarios interactúan con el sitio. Ayudan a <strong>optimizar la navegación y a ofrecer una experiencia más eficiente</strong>.
              </p>
              <ul>
                <li><p><strong>Cookies utilizadas:</strong> _ga, _ga_XXXXXX, wd</p></li>
              </ul>
            </div>

            <div className={styles.cookie}>
              <h3>2.3. Funcionales</h3>
              <p>
                Permiten la funcionalidad básica del sitio, como la protección contra ataques CSRF y la gestión de sesiones de usuario. <strong>Ayudan a recordar tus preferencias y opciones</strong>.
              </p>
              <ul>
                <li><p><strong>Cookies utilizadas:</strong> ch_sid, csrftoken, sessionid, ps_l, ps_n</p></li>
              </ul>
            </div>

            <div className={styles.cookie}>
              <h3>2.4. Seguridad</h3>
              <p>
                Estas cookies están relacionadas con la seguridad del sitio y permiten la autenticación en el sistema <strong>para proteger tu información personal</strong>.
              </p>
              <ul>
                <li><p><strong>Cookies utilizadas:</strong> datr, ds_user_id, ig_did, mid, rur</p></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.titulo}>
          <h3>3. ¿Cómo utilizamos las cookies?</h3>
          <div className="linea-svg"></div>
          <p>
            Utilizamos cookies para diversas finalidades, como <strong>mejorar el rendimiento del sitio, personalizar la experiencia del usuario, y realizar análisis sobre el uso del sitio</strong>. Las cookies también nos permiten ofrecerte funciones avanzadas, como la personalización de contenido y la autenticación de usuario.
          </p>
        </div>

        <div className={styles.titulo}>
          <h3>4. Gestión de tus preferencias de cookies</h3>
          <div className="linea-svg"></div>
          <p>
            Podés gestionar tus preferencias de cookies a través del banner de cookies en la parte inferior de la página, o configurarlas en cualquier momento en nuestra <strong><a onClick={openCookieSettings}>centro de cookies</a></strong>. Si deseás desactivar algunas cookies, tené en cuenta que esto <strong>puede afectar la funcionalidad del sitio</strong>.
          </p>
        </div>

        <div className={styles.titulo}>
          <h3>5. ¿Cómo controlamos la información que recopilamos?</h3>
          <div className="linea-svg"></div>
          <p>
            En cualquier momento, <strong>podés optar por no permitir que se utilicen algunas cookies</strong>, configurando las opciones en el navegador. Sin embargo, algunas funciones del sitio podrían no estar disponibles si decidís bloquear algunas de ellas, como las que son estrictamente necesarias para el funcionamiento básico.
          </p>
        </div>

        <div className={styles.titulo}>
          <h3>6. Derechos sobre tus datos</h3>
          <div className="linea-svg"></div>
          <p>
            El I.S.E.F. San Luís <strong>no recopila ni utiliza información personal más allá de los datos proporcionados por las cookies estrictamente necesarias y de rendimiento</strong>, como el análisis de tráfico para mejorar la experiencia del usuario en el sitio web. Además, garantizamos que no compartimos ni vendemos ninguna información personal a terceros.
          </p>
          <p>
            Los datos que recopilamos mediante las cookies <strong>están destinados únicamente a analizar el comportamiento del usuario, optimizar el sitio web y ofrecer una experiencia personalizada</strong>. Si no deseas que se recopilen tus datos a través de cookies, puedes gestionar tus preferencias de cookies en cualquier momento desde el sitio.
          </p>
        </div>

        <div className={styles.titulo}>
          <h3>7. Cambios en la política de cookies</h3>
          <div className="linea-svg"></div>
          <p>
            Nos reservamos el derecho de actualizar esta política de cookies en <strong>cualquier momento</strong>. Cualquier cambio será publicado en esta página, y la fecha de la última actualización se reflejará en la parte superior de este documento.
          </p>
        </div>

        <div className={styles.titulo}>
          <h3>8. Contacto</h3>
          <div className="linea-svg"></div>
          <p>
            Si tenés alguna pregunta sobre esta política de privacidad o sobre el uso de cookies, <strong>no dudés en ponerte en contacto con nosotros</strong> a través de <a href="mailto:esef4@hotmail.com">esef4@hotmail.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
