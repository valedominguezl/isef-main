import React, { Suspense } from 'react';

import Hero from '@/components/home/hero/Hero.jsx'
import Datos from '@/components/home/datos/Datos.jsx'
import Intro from '@/components/home/intro/Intro.jsx'
import Novedades from '@/components/home/novedades/Novedades.jsx'
import Especializaciones from '../components/home/especializaciones/Intro.jsx'
import Cuota from '@/components/home/cuota/Cuota.jsx'
import Sedes from '@/components/home/sedes/Sedes.jsx'
import FAQ from '@/components/home/faq/Faq.jsx'

const Home = () => {
  return (
    <div className="mainComponent">
      <Hero />

      <Datos />

      <Intro />

      <Novedades />

      <Especializaciones />

      <Cuota />

      <Sedes />

      <FAQ />
    </div>
  );
};

export default Home;

