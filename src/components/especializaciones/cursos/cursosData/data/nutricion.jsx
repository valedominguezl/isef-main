import getCourseImage from '../getCourseImage'

const nutricion = {
  name: "nutricion",
  title: "Nutrición deportiva",
  subTitle: "Fundamentos y optimización de la performance deportiva",
  bgImage: getCourseImage("nutricion.webp"),
  expositor: 1,
  descripcion: <p>
    Nelio va a ofrecerte una comprensión exhaustiva de la nutrición deportiva, enfocándose en los fundamentos y la optimización del rendimiento deportivo. Se explorarán temas esenciales como la diferenciación entre alimentos y nutrientes, las etapas de la alimentación, y las <strong>guías alimentarias vigentes</strong>. Además, se abordará la valoración del estado nutricional, incluyendo <strong>métodos para estimar la composición corporal y el gasto energético basal</strong>.
    <br /><br />
    Los participantes aprenderán sobre la <strong>importancia de los macronutrientes</strong> —carbohidratos, proteínas y lípidos— y cómo éstos influyen en el metabolismo energético y la síntesis proteica. También se discutirá la relevancia de los micronutrientes, la hidratación adecuada, y la <strong>suplementación</strong>, así como las normativas y prácticas relacionadas con el dopaje. <strong>Este curso es ideal para profesionales y entusiastas del deporte que buscan mejorar su conocimiento y práctica en nutrición deportiva</strong>.
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
      tema: "Alimentación y Nutrición",
      subtemas: [
        { tema: "Alimento y nutriente." },
        { tema: "Etapas de la alimentación / nutrición." },
        { tema: "Guía Alimentaria para la Población Argentina." },
        { tema: "Clasificación NOVA." },
      ],
    },
    {
      tema: "Valoración del Estado Nutricional",
      subtemas: [
        { tema: "Anamnesis." },
        { tema: "Métodos para estimar la composición corporal." },
        { tema: "Gasto Energético Basal." },
        { tema: "Requerimientos nutricionales de diferentes deportes." },
      ],
    },
    {
      tema: "Macronutrientes: Carbohidratos",
      subtemas: [
        { tema: "Clasificación." },
        { tema: "Metabolismo energético." },
        { tema: "Glucógeno muscular." },
        { tema: "Alimentos fuentes." },
        { tema: "Periodización." },
      ],
    },
    {
      tema: "Macronutrientes: Proteínas y Lípidos",
      subtemas: [
        { tema: "Síntesis proteica." },
        { tema: "Valor biológico de los alimentos." },
        { tema: "Proteínas vegetales y proteínas animales." },
        { tema: "Los lípidos en la alimentación." },
      ],
    },
    {
      tema: "Micronutrientes: Minerales y Vitaminas",
      subtemas: [
        { tema: "Sodio." },
        { tema: "Calcio." },
        { tema: "Hierro." },
        { tema: "Clasificación de vitaminas." },
        { tema: "Hipervitaminosis." },
      ],
    },
    {
      tema: "Hidratación",
      subtemas: [
        { tema: "Los líquidos corporales." },
        { tema: "Termorregulación." },
        { tema: "Tasa de sudoración." },
        { tema: "Bebidas deportivas." },
        { tema: "Diseño y practicidad." },
        { tema: "Re hidratación." },
      ],
    },
    {
      tema: "Suplementación",
      subtemas: [
        { tema: "Clasificaciones internacionales." },
        { tema: "Suplementos nutricionales." },
        { tema: "Suplementos ergogénicos." },
      ],
    },
    {
      tema: "Doping",
      subtemas: [
        { tema: "La creación de la Agencia Mundial Antidopaje." },
        { tema: "Código WADA-AMA." },
        { tema: "Listado de sustancias y métodos prohibidos." },
        { tema: "La autorización de uso terapéutico." },
      ],
    },
  ],
};

export default nutricion;
