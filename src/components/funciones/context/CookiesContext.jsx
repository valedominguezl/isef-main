// CookiesContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const CookiesContext = createContext();

export const CookiesProvider = ({ children }) => {
  const [consent, setConsent] = useState({
    esencial: true,
    rendimiento: false,
    funcionales: false,
    seguridad: false,
  });
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [isConsentInitialized, setIsConsentInitialized] = useState(false);

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookiePreferences');
    if (storedConsent) {
      const preferences = JSON.parse(storedConsent);
      setConsent(preferences);
    } else {
      setShowCookieBanner(true);
    }
    setIsConsentInitialized(true);
  }, []);

  const handleConsentChange = (preferences, activateTracking) => {
    setConsent(preferences);
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));

    if (activateTracking) {
      activateTracking(preferences);
    }
    // Si deseas cerrar el banner o modal después de aceptar, puedes agregar:
    setShowCookieBanner(false);
    setShowCookieModal(false);
  };

  const openCookieSettings = () => {
    setShowCookieModal(true);
  };

  const closeCookieSettings = () => {
    setShowCookieModal(false);
  };

  return (
    <CookiesContext.Provider
      value={{
        consent,
        handleConsentChange,
        showCookieBanner,
        setShowCookieBanner,
        showCookieModal,
        setShowCookieModal,
        openCookieSettings,
        closeCookieSettings,
        isConsentInitialized,
      }}
    >
      {children}
    </CookiesContext.Provider>
  );
};

export const useCookies = () => useContext(CookiesContext);
