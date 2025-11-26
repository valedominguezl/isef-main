import React from 'react'
import Intros from '@/components/reutilizables/intros/Intros.jsx'
import fondo from '@/assets/media/inscripciones/main.webp'

import Requisitos from '@/components/inscripciones/requisitos/Requisitos.jsx'
import Secundario from '@/components/inscripciones/secundario/Secundario.jsx'
import Veinte from '@/components/inscripciones/veinte/Veinte.jsx'

const Inscripciones = () => {
  const currentYear = new Date().getFullYear()

  return (
    <div className='mainComponent'>
      <Intros
        bgImage={fondo}
        heading="Inscripciones"
        showButton={false}
        showLine={false}
      />

      <Requisitos />
      <Secundario />
      <Veinte />
    </div>
  )
}

export default Inscripciones