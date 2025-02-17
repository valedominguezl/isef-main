import React from 'react';
import Canonical from '@/mainComponents/seo/Canonical.jsx';
import { Outlet } from 'react-router-dom';
import NavBar from '@/components/navbar/Navbar.jsx';
import Footer from '@/components/footer/Footer.jsx';

const Layout = () => {
  return (
    <>
      <NavBar />
      <Canonical />
      <Outlet />
      <Footer />
    </>
  );
};

export default Layout;
