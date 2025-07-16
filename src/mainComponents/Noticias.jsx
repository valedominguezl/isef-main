import Intros from '@/components/reutilizables/intros/Intros.jsx'
import fondo from '@/assets/media/noticias/main.webp'

const Noticias = () => {
  return (
    <div className='mainComponent'>
      <Intros
        bgImage={fondo}
        heading="Noticias"
        subHeading="Las últimas novedades del I.S.E.F."
        showButton={false}
        showLine={true}
      />
    </div>
  )
}

export default Noticias
