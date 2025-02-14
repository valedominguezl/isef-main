import React from 'react'
import Navbar from '@/components/navbar/Navbar.jsx'
import Footer from '@/components/footer/Footer.jsx'
import Intros from '@/components/reutilizables/intros/Intros.jsx'
import fondo from '@/assets/media/inscripciones/main.webp'

import Requisitos from '@/components/inscripciones/requisitos/Requisitos.jsx'
import Secundario from '@/components/inscripciones/secundario/Secundario.jsx'
import Veinte from '@/components/inscripciones/veinte/Veinte.jsx'

const Inscripciones = () => {
  return (
    <div>
      <Navbar />

      <Intros
        bgImage={fondo}
        heading="Inscripciones"
        subHeading="Ciclo lectivo 2025"
        showButton={false}
        showLine={true}
      />

      <Requisitos />

      <Secundario />

      <Veinte />

      <Footer />
    </div>
  )
}

export default Inscripciones
