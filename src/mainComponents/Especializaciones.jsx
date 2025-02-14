import React from 'react'
import Navbar from '@/components/navbar/Navbar.jsx'
import Footer from '@/components/footer/Footer.jsx'
import Intros from '@/components/reutilizables/intros/Intros.jsx'

import fondo from '@/assets/media/especializaciones/main.webp'

import Intro from '@/components/especializaciones/intro/Intro.jsx'
import Cuerpo from '@/components/especializaciones/cuerpo/Cuerpo.jsx'
import Cursos from '@/components/especializaciones/cursos/Cursos.jsx'

const Especializaciones = () => {
  return (
    <div>
      <Navbar />

      <Intros
        bgImage={fondo}
        heading="Especializaciones"
        showButton={false}
        showLine={false}
      />

      <Intro />

      <Cuerpo />

      <Cursos />

      <Footer />
    </div>
  )
}

export default Especializaciones
