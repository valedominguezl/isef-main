import React from 'react'
import Todo from '@/components/hijos/Hijos.jsx'
import Intros from '@/components/reutilizables/intros/Intros.jsx'

const Hijos = () => {
  return (
    <div className='mainComponent'>
      <Intros
        heading="Conferencias"
        showButton={false}
        subHeading='Accedé a las grabaciones desde un solo lugar'
      />

      <Todo />
    </div>
  )
}

export default Hijos
