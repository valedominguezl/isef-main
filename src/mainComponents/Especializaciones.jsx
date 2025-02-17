import React from 'react'
import Intros from '@/components/reutilizables/intros/Intros.jsx'

import fondo from '@/assets/media/especializaciones/main.webp'

import Intro from '@/components/especializaciones/intro/Intro.jsx'
import Cuerpo from '@/components/especializaciones/cuerpo/Cuerpo.jsx'
import Cursos from '@/components/especializaciones/cursos/Cursos.jsx'

const Especializaciones = () => {
  return (
    <div className='mainComponent'>
      <Intros
        bgImage={fondo}
        heading="Especializaciones"
        showButton={false}
        showLine={false}
      />

      <Intro />

      <Cuerpo />

      <Cursos />
    </div>
  )
}

export default Especializaciones
