import React from 'react'
import Intro from '@/components/institucional/contacto/intro/Intro.jsx'
import Mapa from '@/components/institucional/contacto/mapa/Mapa.jsx'
import Intros from '@/components/reutilizables/intros/Intros.jsx'


const Contacto = () => {
  return (
    <div className="mainComponent">
      <Intros
        heading="Contacto"
        subHeading="Comunicate con nosotros mediante Whatsapp"
        showButton={false}
      />
      
      <Intro />

      <Mapa />
    </div>
  )
}

export default Contacto
