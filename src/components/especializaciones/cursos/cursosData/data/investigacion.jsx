import getCourseImage from '../getCourseImage'

const investigacion = {
  estado: "¡Nuevo!",
  name: "investigacion",
  title: "Metodología de la investigación",
  subTitle: "Fundamentos y técnicas de investigación científica",
  bgImage: getCourseImage("investigacion.webp"),
  expositor: 1,
  descripcion: <p>
    Se cubrirán los fundamentos y técnicas esenciales de la investigación científica. Los participantes explorarán las diversas <strong>corrientes de pensamiento en la ciencia</strong> y se familiarizarán con el método científico. Se detallarán los <strong>pasos necesarios para llevar a cabo una investigación</strong>, los distintos niveles de investigación y la escritura científica.
    <br /><br />
    Además, se abordarán las normas de citación y la <strong>elaboración de artículos científicos utilizando el sistema IMRDC</strong>. El curso también incluye orientación sobre las normas de publicación en revistas científicas, proporcionando a los investigadores una guía completa para publicar sus trabajos. <strong>Ideal para aquellos que desean fortalecer sus habilidades en investigación y publicación científica</strong>.
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
      tema: "Temario general",
      subtemas: [
        { tema: "Ciencia y corrientes de pensamiento" },
        { tema: "Método científico" },
        { tema: "Pasos para realizar una investigación." },
        { tema: "Niveles de investigación." },
        { tema: "Escritura científica" },
        { tema: "Bibliografía y normas de citación" },
        { tema: "El artículo científico. Sistema IMRDC" },
        { tema: "Normas de publicación. Revistas científicas" },
      ],
    },
  ],
};

export default investigacion;
