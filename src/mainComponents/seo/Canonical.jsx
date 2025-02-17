import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';  // Importa Helmet desde react-helmet-async

const Canonical = () => {
  const location = useLocation();

  useEffect(() => {
    // Configurar la URL canónica para cada ruta
    const canonicalUrl = `https://isefsanluis.net${location.pathname}`;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);
  }, [location]);

  return (
    <Helmet>
      {/* Define la URL canónica en el head del documento */}
      <link rel="canonical" href={`https://isefsanluis.net${location.pathname}`} />
    </Helmet>
  );
};

export default Canonical;
