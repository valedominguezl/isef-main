import React from 'react'
import Navbar from '@/components/navbar/Navbar.jsx'
import Footer from '@/components/footer/Footer.jsx'
import Intros from '@/components/reutilizables/intros/Intros.jsx'
import fondo from '@/assets/media/carrera/main.webp'

import Intro from '@/components/carrera/intro/Intro.jsx'
import Datos from '@/components/carrera/datos/Datos.jsx'
import Validez from '@/components/carrera/validez/Validez.jsx'
import Explora from '@/components/carrera/explora/Explora.jsx'
import Galeria from '@/components/carrera/galeria/Galeria.jsx'
import Gabinete from '@/components/carrera/gabinete/Gabinete.jsx'
import Plan from '@/components/carrera/plan/Plan.jsx'
import Especializaciones from '@/components/carrera/especializaciones/Especializaciones.jsx'

const Carrera = () => {
  return (
    <div>
      <Navbar />

      <Intros
        bgImage={fondo}
        heading="Profesorado de educación física"
        subHeading="Titulos oficialez de validez nacional"
        showButton={false}
        showLine={true}
      />

      <Intro />

      <Especializaciones />

      <Datos />

      <Validez />

      <Plan />

      <Gabinete />

      <Explora />

      <Galeria />

      <Footer />
    </div>
  )
}

export default Carrera
