import React from 'react'
import './Footer.scss'
import fbFooter from '@/assets/simbols/fbFooter.webp'
import igFooter from '@/assets/simbols/igFooter.webp'
import { useCookies } from '@/components/funciones/context/CookiesContext'
import LoadingAnchor from '@/components/funciones/loadingBar/LoadingAnchor'


const Footer = () => {
  const { openCookieSettings } = useCookies();

  return (
    <footer className="footer bl">
      <div className="footer-info">
        <div className="footer-telefonos">
          <h4>Teléfonos de contacto</h4>
          <div className="footer-telefonos-txt">
            <p><span>General</span>: +54 9 2664 56-4435</p>
            <p><span>Rectoría</span>: +54 9 2604 50-8428</p>
            <p><span>Secretaría académica</span>: +54 9 2664 57-0570</p>
            <p><span>Secretaría administrativa (San Luís)</span>: +54 9 2664 30-4739 | +54 9 2664 61-1345 | +54 9 2664 57-7972</p>
            <p><span>Secretaría administrativa (Villa Mercedes)</span>: +54 9 2657 21-0254</p>
          </div>
        </div>
        <div className="footer-redes">
          <h4>Redes Sociales</h4>
          <div className="footer-redes-cont">
            <a
              className="footer-red"
              href="https://www.facebook.com/Isefsanluis.info/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="footer-red-icono">
                <img src={fbFooter} alt="Facebook Información General" />
              </div>
              <div className="footer-red-txt">
                <p><span>Información <br />General</span></p>
              </div>
            </a>
            <a
              className="footer-red"
              href="https://www.instagram.com/Isefsanluis.info/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="footer-red-icono">
                <img src={igFooter} alt="Instagram San Luis" />
              </div>
              <div className="footer-red-txt">
                <p><span>Información <br />General</span></p>
              </div>
            </a>
            <a
              className="footer-red"
              href="https://www.facebook.com/isef.sanluis"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="footer-red-icono">
                <img src={fbFooter} alt="Facebook San Luís" />
              </div>
              <div className="footer-red-txt">
                <p><span>San Luís</span></p>
              </div>
            </a>
            <a
              className="footer-red"
              href="https://www.facebook.com/isef.villamercedes/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="footer-red-icono">
                <img src={fbFooter} alt="Facebook Villa Mercedes" />
              </div>
              <div className="footer-red-txt">
                <p><span>Villa <br />Mercedes</span></p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-copy">
        <a>I.S.E.F. San Luis 2025 © Todos los derechos reservados</a>
        <a
          href='https://maps.app.goo.gl/mAtAF9dEStP8UWdK7'
          target='_blank'
          rel="noopener noreferrer"
        >
          Colón 1138, Ciudad de San Luís, San Luís, Argentina
        </a>
        <a
          onClick={openCookieSettings}
        >
          Configuración de cookies
        </a>

        <LoadingAnchor href="/Cookies">
          Política de privacidad
        </LoadingAnchor>


      </div>
    </footer>
  )
}

export default Footer
