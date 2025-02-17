import React, { Suspense } from 'react';

import Hero from '@/components/home/hero/Hero.jsx'
import Datos from '@/components/home/datos/Datos.jsx'
import Intro from '@/components/home/intro/Intro.jsx'
import Novedades from '@/components/home/novedades/Novedades.jsx'
import Especializaciones from '../components/home/especializaciones/Intro.jsx'
import Cuota from '@/components/home/cuota/Cuota.jsx'
import Sedes from '@/components/home/sedes/Sedes.jsx'
import FAQ from '@/components/home/faq/Faq.jsx'


// Importación perezosa de componentes
const Instagram = React.lazy(() => import('@/components/home/instagram/Instagram.jsx'));

const Home = () => {
  return (
    <div className="mainComponent">
      <Hero />

      <Datos />

      <Intro />

      <Suspense fallback={<div>Loading...</div>}>
        <Instagram />
      </Suspense>

      <Especializaciones />

      <Cuota />

      <Sedes />

      <FAQ />
    </div>
  );
};

export default Home;

