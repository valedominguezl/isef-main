import React from 'react'
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
    <div className='mainComponent'>
      <Intros
        bgImage={fondo}
        heading="Profesorado de educación física"
        subHeading="Títulos oficiales de validez nacional"
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
    </div>
  )
}

export default Carrera
