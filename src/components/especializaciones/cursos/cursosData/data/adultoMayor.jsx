import getCourseImage from '../getCourseImage'

const adultoMayor = {
  title: "Actividad física en el adulto mayor",
  subTitle: "Su suplementación nutricional",
  bgImage: getCourseImage('adultoMayor.webp'),
  expositor: 2,
  descripcion:
    <p>
      En este curso se abordará de manera integral <strong>la importancia de mantener la actividad física en la tercera edad</strong> , acompañada de una <strong>adecuada suplementación nutricional</strong>. A través de una serie de módulos, se exploran temas cruciales como el metabolismo y las respuestas endocrinas en las edades geriátricas, el envejecimiento orgánico y muscular, y el impacto del ejercicio en diversas patologías. Se profundiza en la pérdida de masa muscular y cómo la alimentación puede influir en este proceso.
      <br /> <br />
      También se ofrecen guías prácticas para la prescripción de ejercicio y se discuten los beneficios de distintos tipos de actividades físicas. Finalmente, el curso cubre la suplementación nutricional necesaria en la adultez mayor y su impacto positivo en la salud y el bienestar. <strong>Este curso es ideal para profesionales de la salud y el deporte que deseen ampliar sus conocimientos y habilidades en el cuidado integral del adulto mayor</strong>.
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
      tema: "Metabolismo, sistema endócrino y biomoléculas en la vejez",
      subtemas: [
        { tema: "Evolución del metabolismo energético con el envejecimiento" },
        { tema: "Respuestas endocrinas en las edades geriátricas" },
        { tema: "Sistemas molecular anabólico, catabólico e inflamatorio en las etapas finales de la vida" },
      ],
    },
    {
      tema: "Características generales del envejecimiento",
      subtemas: [
        { tema: "Envejecimiento orgánico y muscular" },
        { tema: "Alteraciones de los componentes fraccionales de la masa corporal por envejecimiento y su impacto sobre la salud" },
        { tema: "Tejido adiposo y músculo-esquelético. Evolución e impacto en la salud" },
      ],
    },
    {
      tema: "Envejecimiento y patologías. El rol del ejercicio",
      subtemas: [
        { tema: "Enfermedades Cardio-metabólicas como generadoras de enfermedades músculo-esqueléticas" },
        { tema: "Diafonía (cross talk) entre los tejidos adiposo, hepático, óseo y muscular en la salud y en la enfermedad" },
        { tema: "Las interleuquinas de acción patológica y su control por las mioquinas a través del ejercicio" },
      ],
    },
    {
      tema: "Pérdida de masa muscular por envejecimiento y alimentación",
      subtemas: [
        { tema: "Miopenia, dinapenia y sarcopenia" },
        { tema: "La alimentación en el control de la pérdida de músculo" },
        { tema: "Los macronutrientes energéticos y estructurales en la etapa geriátrica" },
        { tema: "Impacto de la carga nutricional insuficiente" },
      ],
    },
    {
      tema: "Prescripción de ejercicio en el adulto mayor",
      subtemas: [
        { tema: "Valoración de la condición física y del estado de salud" },
        { tema: "Principios del entrenamiento para la planificación" },
        { tema: "Abordaje de las ejercitaciones oxígeno dependientes" },
        { tema: "El entrenamiento de la fuerza. Desde lo neural a lo neuromuscular" },
        { tema: "Diseño de la planificación" },
      ],
    },
    {
      tema: "Tipos de ejercicios y sus beneficios en el envejecimiento",
      subtemas: [
        { tema: "Ejercitaciones oxígeno dependientes (caminata, bicicleta, natación, running)" },
        { tema: "Ejercitaciones oxígeno independientes (fuerza: máquinas, pesos libres, propio peso corporal)" },
        { tema: "Ejercitaciones artro-musculares localizadas: movilidad articular, elongación y flexibilidad" },
      ],
    },
    {
      tema: "La suplementación en las edades geriátricas",
      subtemas: [
        { tema: "Necesidades y fundamentos científicos de su indicación en la adultez mayor y ancianidad" },
        { tema: "Momento y cantidad de la ingestión de cada suplemento asociado al ejercicio e independiente del mismo" },
        { tema: "Las necesidades de ciertos suplementos en patologías, Cuáles y por qué" },
        { tema: "Creatina" },
        { tema: "Citrulina Malato" },
        { tema: "BCAA" },
        { tema: "Proteína de suero de leche (Whey Protein)" },
        { tema: "HMB" },
      ],
    },
  ],
}

export default adultoMayor;
