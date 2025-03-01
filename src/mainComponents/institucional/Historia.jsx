import React from 'react'
import Intro from '@/components/institucional/historia/intro/Intro.jsx'
import Intros from '@/components/reutilizables/intros/Intros.jsx'
import fondo from '@/assets/media/home/intro.webp'


const Historia = () => {
  return (
    <div className="mainComponent">
      <Intros
        bgImage={fondo}
        heading="Nuestra historia"
        subHeading="Conocé cómo llegamos a ser el mejor profesorado de la región"
        showButton={false}
      />
      
      <Intro />

    </div>
  )
}

export default Historia
