import getCourseImage from '../getCourseImage'

const antropometria = {
  estado: "¡Nuevo!",
  name: "antropometria",
  title: "Antropometría",
  subTitle: "Técnicas y aplicaciones básicas",
  bgImage: getCourseImage('antropometria.webp'),
  expositor: 1,
  descripcion:
    <p>
      Se proporciona una comprensión básica de las <strong>técnicas de medición del cuerpo humano</strong> y sus aplicaciones prácticas. A lo largo del curso, se cubrirán aspectos como la <strong>anatomía y los puntos de referencia anatómicos</strong>, así como las medidas básicas de peso, talla y envergadura.
      <br /><br />
      También se enseñarán las técnicas para medir longitudes, diámetros, perímetros y pliegues cutáneos. Es clave la <strong>interpretación de las mediciones antropométricas</strong>, que permitirá a los participantes aplicar este conocimiento en diversos campos, como la salud, el deporte y la investigación científica. <strong>Ideal para profesionales y estudiantes que buscan adquirir habilidades prácticas en la evaluación y análisis del cuerpo humano</strong>.
    </p>
  ,

  duracion: null,
  modalidad: null,
  costo: null,
  inicio: null,
  importante: null,
  condiciones: null,
  temario: [
    {
      tema: "Temario General",
      subtemas: [
        { tema: "Anatomía y reparos anatómicos" },
        { tema: "Medidas básicas: peso" },
        { tema: "Medidas básicas: talla y envergadura" },
        { tema: "Longitudes" },
        { tema: "Diámetros" },
        { tema: "Perímetros" },
        { tema: "Pliegues" },
        { tema: "Interpretación de una antropometría" },
      ],
    },
  ],
}

export default antropometria;
