import React from 'react'
import Navbar from '@/components/navbar/Navbar.jsx'
import Footer from '@/components/footer/Footer.jsx'
import Tabla from '@/components/aranceles/tabla/Tabla.jsx'
import Intros from '@/components/reutilizables/intros/Intros.jsx'
import fondo from '@/assets/media/aranceles/main.webp'


const Aranceles = () => {
  return (
    <div>
      <Navbar />

      <Intros
        bgImage={fondo}
        heading="Aranceles"
        buttonText="Pagos solo en efectivo"
      />
      
      <Tabla />
      <Footer />
    </div>
  )
}

export default Aranceles
