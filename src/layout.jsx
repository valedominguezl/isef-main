import React from 'react';
import Canonical from '@/mainComponents/seo/Canonical.jsx';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from '@/components/navbar/Navbar.jsx';
import Footer from '@/components/footer/Footer.jsx';
import WhatsAppButton from '@/components/funciones/whatsApp/WhatsAppButton.jsx';

const Layout = () => {
  // El botón de WhatsApp flotante no tiene que competir con el Test HIIT, así que no se
  // muestra en esa página. El navbar y el footer se mantienen igual que en el resto del sitio.
  const { pathname } = useLocation();
  const isTestHiit = pathname === '/TestHiit';

  return (
    <>
      <NavBar />
      <Canonical />
      <Outlet />
      <Footer />
      {!isTestHiit && <WhatsAppButton />}
    </>
  );
};

export default Layout;
