import React from 'react'
import LazyLoad from 'react-lazyload';

import Navbar from '@/components/navbar/Navbar.jsx'
import Footer from '@/components/footer/Footer.jsx'
import Hero from '@/components/home/hero/Hero.jsx'
import Datos from '@/components/home/datos/Datos.jsx'
import Intro from '@/components/home/intro/Intro.jsx'
import Especializaciones from '../components/home/especializaciones/Intro.jsx'
import Cuota from '@/components/home/cuota/Cuota.jsx'
import Sedes from '@/components/home/sedes/Sedes.jsx'
import FAQ from '@/components/home/faq/Faq.jsx'
import News from '../components/home/news/News.jsx'

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Datos />
      <Intro />
      <LazyLoad height={200} offset={0} once>
        <News />
      </LazyLoad>
      <Especializaciones />
      <Cuota />
      <Sedes />
      <FAQ />
      <Footer />

    </div>
  )
}

export default Home
