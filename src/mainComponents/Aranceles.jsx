import React from 'react'
import Tabla from '@/components/aranceles/tabla/Tabla.jsx'
import Intros from '@/components/reutilizables/intros/Intros.jsx'
import fondo from '@/assets/media/aranceles/main.webp'


const Aranceles = () => {
  return (
    <div className='mainComponent'>
      <Intros
        bgImage={fondo}
        heading="Aranceles"
        buttonText="Pagos solo en efectivo"
      />

      <Tabla />
    </div>
  )
}

export default Aranceles
