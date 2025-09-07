import getCourseImage from "../getCourseImage";

const liderazgo = {
  name: "liderazgo",
  estado: "¡Nuevo!",
  destacado: true,
  title: "Liderazgo y gestión del cambio",
  subTitle: "Entendiendo las organizaciones",
  bgImage: getCourseImage("liderazgo.webp"),
  expositor: "Lic. Hernán Araujo",
  descripcion: (
    <p>
      {" "}
      Hacen falta <strong>líderes</strong> —políticos y{" "}
      <strong>profesores de Educación Física</strong>— capaces de impulsar el{" "}
      <strong>cambio</strong> que necesitan nuestros niños desde la salud y la
      educación.
      <br />
      <br />
      No alcanza con conocer los beneficios de la{" "}
      <strong>neuroplasticidad</strong> o del ejercicio en enfermedades
      crónicas; hay que llegar a los{" "}
      <strong>ámbitos donde se deciden las políticas</strong> y convertir
      evidencia en acción. Para que el cambio sea efectivo y duradero se
      requieren profesionales formados en{" "}
      <strong>Liderazgo y Gestión del Cambio</strong>.
      <br />
      <br />
      En esta capacitación, el Lic. Hernán Eduardo Sosa Araujo brindará{" "}
      <strong>herramientas prácticas</strong> para enfrentar contextos de
      cambio, conducir equipos y ordenar procesos en la{" "}
      <strong>gestión pública y privada</strong>, aplicando marcos y
      diagnósticos (FODA, PEST/PESTEL, 7S, PDCA) para lograr{" "}
      <strong>impacto duradero</strong> en los procesos administrativos que
      inciden en la sociedad.{" "}
    </p>
  ),
  duracion: "5 encuentros, jueves de 19 a 21 horas",
  modalidad: "Presencial en la sede principal",
  costo: null,
  inicio: "25/09/2025",
  importante:
    "El trabajo integrador final no tendrá recuperatorio, quien no lo apruebe, no se le dará por aprobado el curso.",
  condiciones:
    "Finalizado el curso, se deberá presentar un trabajo integrador final obligatorio (condición necesaria y suficiente para su APROBACIÓN DEFINITIVA). Para acceder al mismo es necesario tener 80% asistencia. La aprobación del mismo se logrará con un 60%.",
  temario: [
    {
      tema: "Módulo I",
      subtemas: [
        { tema: "Organización" },
        { tema: "Concepto Sistémico: Sistema Social" },
        { tema: "Características" },
        { tema: "Cultura Organizacional: Elementos" },
        { tema: "Clima Organizacional" },
        { tema: "Características de la Cultura" },
        {
          tema: "Organigrama: Tipos de Organigrama según su distribución gráfica",
        },
        { tema: "Carácter Organizacional" },
        { tema: "Departamentalización" },
        { tema: "Estructura Organizacional" },
        { tema: "Liderazgo" },
        { tema: "Estilos de Liderazgo" },
        { tema: "Liderazgo vs. Jefatura" },
        { tema: "Necesidades" },
        { tema: "Motivación" },
      ],
    },
    {
      tema: "Módulo II",
      subtemas: [
        { tema: "Cambio Organizacional" },
        { tema: "Tipos de Cambio" },
        { tema: "Necesidades de Cambio" },
        { tema: "Reacciones Humanas ante el cambio" },
        { tema: "Herramientas para Gestionar el Cambio" },
        { tema: "Rol del Líder en los Procesos de Cambio" },
        {
          tema: "Análisis PEST: Factores Políticos, Económicos, Sociales y Tecnológicos",
        },
        {
          tema: "Análisis PESTEL: Incorporación Aspectos Ecológicos y Legales",
        },
        {
          tema: "Análisis FODA: Fortalezas, Oportunidades, Debilidades y Amenazas",
        },
        { tema: "Ciclo Deming PDCA" },
      ],
    },
    {
      tema: "Módulo III",
      subtemas: [
        {
          tema: "Modelo de las 7S: Estrategia (Strategy), Estructura (Structure), Sistemas (Systems), Estilo (Style), Valores compartidos (Shared values), Personal (Staff), Habilidades (Skills)",
        },
        {
          tema: "Las 5 Fuerzas de Porter: Poder de negociación de los compradores o clientes, poder de negociación de los proveedores o vendedores, amenaza de nuevos competidores, amenaza de productos sustitutos, rivalidad entre los competidores",
        },
        { tema: "Management Visual (5S): Seiri; Clasificar, eliminar lo no esencial | Seiton; Ordenar, configurar el área de trabajo | Seiso; Brillar, limpiar el ambiente | Seiketsu; Sistematizar, definir procedimientos | Shitsuke; Estandarizar, medición y cumplimiento de los requisitos" },
      ],
    },
    {
      tema: "Módulo IV",
      subtemas: [
        { tema: "Proceso de Toma de decisiones" },
        { tema: "Proceso Administrativo: Actividades pre-ejecutivas, actividades ejecutivas, supervisión" },
        { tema: "Recursos de las Organizaciones" },
        { tema: "Tipos de Recursos" },
        { tema: "Discreción" },
        { tema: "Excelencia" },
        { tema: "Principios Generales de la Administración" },
        {
          tema: "Beneficios de los Valores de la Organización: Visión, Misión, Valores",
        },
      ],
    },
  ],
};

export default liderazgo;
