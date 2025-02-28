import { useState, useEffect } from "react";
import { useCookies } from "@/components/funciones/context/CookiesContext";
import logo from "@/assets/simbols/logo.webp";
import close from "@/assets/simbols/close.webp";
import styles from "./CookieBanner.module.scss";
import LoadingAnchor from "@/components/funciones/loadingBar/LoadingAnchor";

// Objeto con la información de cada categoría de cookies
const cookieInfo = {
  "Tu privacidad": {
    description:
      "Acá te explicamos cómo se recopila y utiliza tu información para proteger tu privacidad en la web del I.S.E.F. San Luís.",
    cookies: [],
  },
  "Estrictamente necesarias": {
    description:
      "Estas cookies son indispensables para el funcionamiento básico del sitio. No pueden desactivarse.",
    cookies: [],
  },
  Rendimiento: {
    description:
      "Cookies utilizadas para mejorar el rendimiento del sitio y analizar el comportamiento del usuario.",
    cookies: ["_ga", "_ga_XXXXXX", "wd"],
  },
  Funcionales: {
    description:
      "Cookies que permiten la funcionalidad básica del sitio, como la protección contra ataques CSRF o la gestión de la sesión.",
    cookies: ["ch_sid", "csrftoken", "sessionid", "ps_l", "ps_n"],
  },
  Seguridad: {
    description:
      "Cookies utilizadas para mantener la seguridad y permitir la autenticación en el sitio.",
    cookies: ["datr", "ds_user_id", "ig_did", "mid", "rur"],
  },
};

// Función auxiliar para obtener la clave de preferencia según la categoría
const preferenceKeys = {
  Rendimiento: "rendimiento",
  Funcionales: "funcionales",
  Seguridad: "seguridad",
};

const getPreferenceKey = (category) => preferenceKeys[category] || null;

const CookieBanner = ({ activateTracking }) => {
  const {
    consent,
    handleConsentChange,
    showCookieBanner,
    setShowCookieBanner,
    showCookieModal,
    setShowCookieModal,
  } = useCookies();

  const [preferences, setPreferences] = useState(consent);
  const [selectedCategory, setSelectedCategory] = useState("Tu privacidad");

  useEffect(() => {
    setPreferences(consent);
  }, [consent]);

  // Función para aceptar todas las cookies
  const handleAcceptAll = () => {
    const newPreferences = {
      esencial: true,
      rendimiento: true,
      funcionales: true,
      seguridad: true,
    };
    handleConsentChange(newPreferences, activateTracking);
    setShowCookieBanner(false);
    setShowCookieModal(false); // Cerrar el modal si está abierto
  };

  // Al guardar, se actualizan las preferencias y se cierra el modal
  const handleSave = () => {
    // Verificar si todas las preferencias están activadas
    const allAccepted = Object.keys(preferences).every(
      (key) => preferences[key] === true,
    );

    handleConsentChange(preferences, activateTracking);

    if (allAccepted) {
      // Si todas las preferencias están activadas, se comporta como "Aceptar todas"
      setShowCookieBanner(false);
    }
    setShowCookieModal(false);
  };

  // Función para abrir el modal desde el footer
  const openCookieModal = () => {
    setShowCookieModal(true);
  };

  // Función para cerrar el modal sin guardar cambios
  const handleCloseModal = () => {
    setShowCookieModal(false);
    if (!localStorage.getItem("cookiePreferences")) {
      setShowCookieBanner(true);
    }
  };

  // Al cerrar el banner (por ejemplo, con el icono de cerrar), se guarda el consentimiento con la configuración por defecto
  const handleCloseBanner = () => {
    const newPreferences = {
      esencial: true,
      rendimiento: false,
      funcionales: false,
      seguridad: false,
    };
    handleConsentChange(newPreferences, activateTracking);
    setShowCookieBanner(false);
  };

  return (
    <>
      {" "}
      {/* Se muestra el banner solo si showCookieBanner es true y no se está mostrando el modal */}{" "}
      {showCookieBanner && !showCookieModal && (
        <div className={styles.container}>
          {" "}
          <div className={styles.banner}>
            {" "}
            <div className={styles.titulo}>
              {" "}
              <div className={styles.imgCont}>
                {" "}
                <img src={logo} alt="Logo" />{" "}
                <img
                  src={close}
                  alt="Cerrar"
                  onClick={handleCloseBanner}
                />{" "}
              </div>{" "}
              <small>
                {" "}
                Al hacer clic en “Aceptar”, aceptás el almacenamiento de cookies
                en tu dispositivo para mejorar la navegación del sitio, analizar
                el uso del sitio y ayudar en nuestros esfuerzos de marketing.{" "}
                <LoadingAnchor href="/Cookies">
                  {" "}
                  Política de privacidad{" "}
                </LoadingAnchor>{" "}
              </small>{" "}
            </div>{" "}
            <div className={styles.buttons}>
              {" "}
              <button
                onClick={() => {
                  setShowCookieModal(true);
                  setShowCookieBanner(false);
                }}
              >
                {" "}
                <p>Configurar cookies</p>{" "}
              </button>{" "}
              <button className="btn-cta grad bl" onClick={handleAcceptAll}>
                {" "}
                <p>Aceptar</p>{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}

      {/* Modal de configuración de cookies */}
      {showCookieModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.title}>
              <img src={logo} alt="Logo" />
              <h3>Centro de cookies</h3>
              <img src={close} alt="Cerrar" onClick={handleCloseModal} />
            </div>
            <div className={styles.privacy}>
              {Object.keys(cookieInfo).map((category) => (
                <div
                  key={category}
                  className={`${styles.cookieSection} ${
                    selectedCategory === category ? styles.selected : ""
                  }`}
                >
                  <div
                    className={`${styles.cookieTitle} ${
                      selectedCategory === category ? styles.selected : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      setSelectedCategory(category)
                    }
                    tabIndex="0"
                  >
                    <h4>{category}</h4>
                    {selectedCategory === category &&
                      category !== "Tu privacidad" &&
                      category !== "Estrictamente necesarias" && (
                        <select
                          className={styles.toggleSelect}
                          value={
                            preferences[getPreferenceKey(category)]
                              ? "activadas"
                              : "desactivadas"
                          }
                          onChange={(e) => {
                            const key = getPreferenceKey(category);
                            if (key) {
                              setPreferences((prev) => ({
                                ...prev,
                                [key]: e.target.value === "activadas",
                              }));
                            }
                          }}
                        >
                          <option value="activadas">Activadas</option>
                          <option value="desactivadas">Desactivadas</option>
                        </select>
                      )}
                  </div>
                  <div
                    className={`${styles.cookiesText} ${
                      selectedCategory === category ? styles.active : ""
                    }`}
                  >
                    <p>{cookieInfo[category].description}</p>
                    {cookieInfo[category].cookies.length > 0 && (
                      <p>
                        <strong>Tipos:</strong>{" "}
                        {cookieInfo[category].cookies.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.save}>
              {/* Botón "Aceptar todas" */}
              <button className="btn-cta grad bl" onClick={handleAcceptAll}>
                Aceptar todas
              </button>
              {/* Botón "Confirmar cambios" */}
              <button onClick={handleSave}>
                Confirmar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieBanner;
