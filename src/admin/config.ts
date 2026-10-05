/**
 * Definición declarativa del panel: qué se puede editar y con qué campos.
 * Para agregar un campo nuevo: sumarlo al esquema (src/content/schema.ts) y acá.
 */
import type { ZodTypeAny } from 'zod';
import {
  arancelesSchema,
  conferenciasSchema,
  cursoSchema,
  cvSchema,
  disertanteSchema,
  faqSchema,
  galeriaSchema,
  inscripcionesSchema,
  novedadSchema,
  planSchema,
  sitioSchema,
} from '@/content/schema';
import { CV_SECCIONES, NOVEDAD_CATEGORIAS } from '@/content/constants';

export type Field =
  | { type: 'text' | 'url' | 'email'; name: string; label: string; help?: string; placeholder?: string; required?: boolean; max?: number }
  | { type: 'textarea'; name: string; label: string; help?: string; max?: number; rows?: number; required?: boolean }
  | { type: 'markdown'; name: string; label: string; help?: string; rows?: number }
  | { type: 'number'; name: string; label: string; help?: string; step?: number }
  | { type: 'boolean'; name: string; label: string; help?: string }
  | { type: 'date'; name: string; label: string; help?: string; required?: boolean }
  | { type: 'select'; name: string; label: string; help?: string; options: { value: string; label: string }[]; required?: boolean }
  | { type: 'image'; name: string; label: string; help?: string; folder: string; maxWidth: number; aspect?: number }
  | { type: 'file'; name: string; label: string; help?: string; folder: string; accept: string }
  | { type: 'list'; name: string; label: string; help?: string; itemLabel?: string; max?: number }
  | { type: 'reference'; name: string; label: string; help?: string; collection: 'disertantes' | 'cursos'; multiple: boolean }
  | { type: 'group'; name: string; label: string; help?: string; fields: Field[]; optional?: boolean; collapsed?: boolean }
  /** Solo visual: agrupa campos del mismo nivel en una tarjeta plegable (no cambia el JSON). */
  | { type: 'section'; name: string; label: string; help?: string; fields: Field[]; collapsed?: boolean }
  | { type: 'repeater'; name: string; label: string; help?: string; itemLabel: string; fields: Field[]; titleField?: string; collapsed?: boolean };

export interface CollectionConfig {
  key: string;
  label: string;
  singular: string;
  /** "Nueva novedad" / "Nuevo curso" */
  newLabel: string;
  dir: string;
  schema: ZodTypeAny;
  fields: Field[];
  titleField: string;
  subtitle?: (e: Record<string, unknown>) => string;
  sort?: (a: Record<string, unknown>, b: Record<string, unknown>) => number;
  sitePath?: (slug: string) => string;
  /** Carpeta de medios por defecto y valores iniciales. */
  defaults: () => Record<string, unknown>;
  preview?: 'curso' | 'novedad' | 'disertante';
  hidden?: boolean;
}

export interface SingletonConfig {
  key: string;
  label: string;
  description: string;
  file: string;
  schema: ZodTypeAny;
  fields: Field[];
  sitePath?: string;
}

const today = () => new Date().toISOString().slice(0, 10);
const opt = (o: Record<string, string>) => Object.entries(o).map(([value, label]) => ({ value, label }));

/* ─────────────────────────────── Colecciones ─────────────────────────────── */
export const COLLECTIONS: CollectionConfig[] = [
  {
    key: 'novedades',
    label: 'Novedades',
    singular: 'novedad',
    newLabel: 'Nueva novedad',
    dir: 'content/novedades',
    schema: novedadSchema,
    titleField: 'titulo',
    subtitle: (e) => `${NOVEDAD_CATEGORIAS[e.categoria as keyof typeof NOVEDAD_CATEGORIAS] ?? ''} · ${e.fecha ?? ''}`,
    sort: (a, b) => String(b.fecha).localeCompare(String(a.fecha)),
    sitePath: (s) => `/novedades/${s}`,
    preview: 'novedad',
    defaults: () => ({ titulo: '', fecha: today(), categoria: 'novedad', resumen: '', publicado: true, destacado: false }),
    fields: [
      { type: 'text', name: 'titulo', label: 'Título', required: true, max: 90 },
      { type: 'date', name: 'fecha', label: 'Fecha de publicación', required: true },
      { type: 'select', name: 'categoria', label: 'Categoría', options: opt(NOVEDAD_CATEGORIAS), required: true },
      { type: 'textarea', name: 'resumen', label: 'Resumen', help: 'Se muestra en las tarjetas y en Google. Entre 1 y 3 oraciones.', max: 500, rows: 4, required: true },
      { type: 'markdown', name: 'cuerpo', label: 'Texto completo (opcional)', rows: 10 },
      { type: 'image', name: 'imagen', label: 'Imagen', folder: 'novedades', maxWidth: 1600, help: 'Horizontal. Se convierte a WebP automáticamente.' },
      { type: 'reference', name: 'curso', label: 'Curso relacionado', collection: 'cursos', multiple: false, help: 'Agrega un botón "Ver el curso".' },
      {
        type: 'group',
        name: 'enlace',
        label: 'Botón externo (opcional)',
        optional: true,
        fields: [
          { type: 'text', name: 'texto', label: 'Texto del botón' },
          { type: 'url', name: 'url', label: 'URL' },
        ],
      },
      { type: 'boolean', name: 'destacado', label: 'Destacada (aparece primero)' },
      { type: 'boolean', name: 'publicado', label: 'Publicada' },
    ],
  },
  {
    key: 'cursos',
    label: 'Especializaciones',
    singular: 'curso',
    newLabel: 'Nuevo curso',
    dir: 'content/cursos',
    schema: cursoSchema,
    titleField: 'titulo',
    subtitle: (e) => [e.destacado && 'Destacado', e.fechaInicio && `Inicio ${e.fechaInicio}`, e.publicado === false && 'Oculto'].filter(Boolean).join(' · '),
    sitePath: (s) => `/especializaciones/${s}`,
    preview: 'curso',
    defaults: () => ({ titulo: '', subtitulo: '', destacado: false, publicado: true, mostrarEnCarrera: false, disertantes: [], temario: [] }),
    fields: [
      { type: 'text', name: 'titulo', label: 'Título', required: true, max: 70 },
      { type: 'text', name: 'subtitulo', label: 'Subtítulo', required: true, max: 100 },
      { type: 'image', name: 'imagen', label: 'Imagen de portada', folder: 'cursos', maxWidth: 1600 },
      { type: 'reference', name: 'disertantes', label: 'Disertantes', collection: 'disertantes', multiple: true },
      { type: 'date', name: 'fechaInicio', label: 'Fecha de inicio', help: 'Mientras falte para esta fecha, el curso muestra «¡Nuevo!» solo.' },
      { type: 'text', name: 'modalidad', label: 'Modalidad', placeholder: 'Online por Zoom / Presencial en la sede principal' },
      { type: 'text', name: 'duracion', label: 'Duración y horario', placeholder: '5 encuentros, jueves de 19 a 21 h' },
      { type: 'text', name: 'costo', label: 'Costo', placeholder: 'Gratuito para alumnos' },
      { type: 'markdown', name: 'descripcion', label: 'Descripción', rows: 10 },
      {
        type: 'repeater',
        name: 'temario',
        label: 'Temario',
        itemLabel: 'Módulo',
        titleField: 'tema',
        collapsed: true,
        fields: [
          { type: 'text', name: 'tema', label: 'Tema / módulo', required: true },
          { type: 'list', name: 'subtemas', label: 'Subtemas', itemLabel: 'subtema' },
        ],
      },
      { type: 'markdown', name: 'condiciones', label: 'Condiciones de aprobación', rows: 4 },
      { type: 'markdown', name: 'importante', label: 'Aviso importante', rows: 3 },
      { type: 'boolean', name: 'destacado', label: 'Destacado (muestra la etiqueta "Destacado" y aparece primero)' },
      { type: 'boolean', name: 'mostrarEnCarrera', label: 'Mostrar en la página "La carrera"' },
      { type: 'boolean', name: 'publicado', label: 'Publicado' },
    ],
  },
  {
    key: 'disertantes',
    label: 'Disertantes',
    singular: 'disertante',
    newLabel: 'Nuevo disertante',
    dir: 'content/disertantes',
    schema: disertanteSchema,
    titleField: 'nombre',
    subtitle: (e) => `${e.titulo ?? ''} · ${e.especialidad ?? ''}`,
    sort: (a, b) => Number(a.orden ?? 99) - Number(b.orden ?? 99),
    sitePath: (s) => `/disertantes/${s}`,
    preview: 'disertante',
    defaults: () => ({ nombre: '', titulo: 'Dr.', especialidad: '', destacados: [], orden: 99, publicado: true }),
    fields: [
      { type: 'text', name: 'nombre', label: 'Nombre y apellido', required: true, help: 'Sin el título (Dr., Lic.): ese va aparte.' },
      { type: 'select', name: 'titulo', label: 'Título', options: ['Dr.', 'Dra.', 'Lic.', 'Mg.', 'Prof.', 'Ing.', 'Abog.', ''].map((v) => ({ value: v, label: v || '(ninguno)' })) },
      { type: 'text', name: 'especialidad', label: 'Área de especialidad', required: true, placeholder: 'Neurociencias y educación', max: 60 },
      { type: 'image', name: 'foto', label: 'Foto (retrato)', folder: 'disertantes', maxWidth: 800, aspect: 1, help: 'Se recorta cuadrada automáticamente.' },
      { type: 'list', name: 'destacados', label: 'Puntos destacados de la tarjeta', itemLabel: 'punto', max: 8, help: 'Frases cortas: "Médico", "Egresado de la UBA"…' },
      { type: 'number', name: 'orden', label: 'Orden en el listado', help: 'Menor número = aparece antes.' },
      { type: 'boolean', name: 'publicado', label: 'Publicado' },
    ],
  },
  {
    key: 'cv',
    label: 'Currículums',
    singular: 'currículum',
    newLabel: 'Nuevo currículum',
    dir: 'content/cv',
    schema: cvSchema,
    titleField: 'disertante',
    hidden: true,
    defaults: () => ({ resumen: '', secciones: (Object.keys(CV_SECCIONES) as (keyof typeof CV_SECCIONES)[]).filter((k) => k !== 'otros').map((tipo) => ({ tipo, items: [] })) }),
    fields: [
      { type: 'textarea', name: 'resumen', label: 'Resumen profesional', max: 600, rows: 4, help: '2 o 3 oraciones en tercera persona. Sin datos personales (DNI, domicilio, teléfono).' },
      {
        type: 'repeater',
        name: 'secciones',
        label: 'Secciones del CV',
        itemLabel: 'Sección',
        titleField: 'tipo',
        collapsed: true,
        help: 'Las secciones vacías no se muestran en el sitio.',
        fields: [
          { type: 'select', name: 'tipo', label: 'Tipo de sección', options: opt(CV_SECCIONES), required: true },
          { type: 'text', name: 'titulo', label: 'Título personalizado', help: 'Solo para "Otros antecedentes".' },
          {
            type: 'repeater',
            name: 'items',
            label: 'Antecedentes',
            itemLabel: 'Antecedente',
            titleField: 'titulo',
            fields: [
              { type: 'text', name: 'periodo', label: 'Período', placeholder: '2019 – Actualidad' },
              { type: 'text', name: 'titulo', label: 'Título / cargo', required: true },
              { type: 'text', name: 'institucion', label: 'Institución' },
              { type: 'text', name: 'detalle', label: 'Detalle' },
            ],
          },
        ],
      },
    ],
  },
];

/* ───────────────────────────── Configuración ───────────────────────────── */
export const SINGLETONS: SingletonConfig[] = [
  {
    key: 'sitio',
    label: 'Datos del instituto',
    description: 'Inscripciones, teléfonos, sedes y redes sociales.',
    file: 'content/sitio.json',
    schema: sitioSchema,
    sitePath: '/contacto',
    fields: [
      {
        type: 'group',
        name: 'inscripciones',
        label: 'Inscripciones',
        fields: [
          { type: 'boolean', name: 'abiertas', label: 'Inscripciones abiertas (muestra el botón "Inscribite")' },
          { type: 'date', name: 'inicio', label: 'Abren el (opcional)', help: 'Si la cargás, antes de esta fecha el sitio no las muestra como abiertas.' },
          { type: 'date', name: 'cierre', label: 'Cierran el (opcional)', help: 'Si la cargás, arriba de todo el sitio aparece la franja con la fecha y, los últimos 15 días, la cuenta regresiva. Sin fecha no se muestra.' },
          { type: 'text', name: 'texto', label: 'Texto del botón principal' },
        ],
      },
      { type: 'repeater', name: 'telefonos', label: 'Teléfonos por área', itemLabel: 'Área', titleField: 'area', collapsed: true, fields: [
        { type: 'text', name: 'area', label: 'Área', required: true },
        { type: 'text', name: 'sede', label: 'Sede (opcional)' },
        { type: 'textarea', name: 'descripcion', label: 'Para qué consultas', rows: 2 },
        { type: 'list', name: 'numeros', label: 'Números (solo dígitos)', itemLabel: 'número' },
      ] },
      { type: 'repeater', name: 'sedes', label: 'Sedes', itemLabel: 'Sede', titleField: 'nombre', collapsed: true, fields: [
        { type: 'text', name: 'nombre', label: 'Nombre' },
        { type: 'text', name: 'tipo', label: 'Tipo', placeholder: 'Sede principal' },
        { type: 'text', name: 'direccion', label: 'Dirección' },
        { type: 'text', name: 'ciudad', label: 'Ciudad' },
        { type: 'text', name: 'horario', label: 'Horario de atención' },
        { type: 'text', name: 'telefono', label: 'Teléfono (solo dígitos)' },
        { type: 'url', name: 'mapaUrl', label: 'Link de Google Maps' },
        { type: 'url', name: 'mapaEmbed', label: 'URL de mapa embebido', help: 'Google Maps → Compartir → Insertar un mapa → copiar solo el src.' },
        { type: 'number', name: 'lat', label: 'Latitud', step: 0.000001 },
        { type: 'number', name: 'lng', label: 'Longitud', step: 0.000001 },
        { type: 'url', name: 'facebook', label: 'Facebook de la sede' },
      ] },
      { type: 'repeater', name: 'redes', label: 'Redes sociales', itemLabel: 'Red', titleField: 'etiqueta', collapsed: true, fields: [
        { type: 'select', name: 'red', label: 'Red', options: opt({ facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok' }) },
        { type: 'text', name: 'etiqueta', label: 'Etiqueta' },
        { type: 'url', name: 'url', label: 'URL' },
      ] },
      {
        type: 'section',
        name: 'avanzado',
        label: 'Otros datos del sitio',
        help: 'WhatsApp principal, correo, campus, números del inicio y datos técnicos. Casi nunca cambian.',
        collapsed: true,
        fields: [
          { type: 'text', name: 'whatsapp', label: 'WhatsApp principal', help: 'Solo números con código de país: 5492664564435' },
          { type: 'email', name: 'email', label: 'Correo de contacto' },
          { type: 'url', name: 'campusUrl', label: 'URL del campus virtual' },
          { type: 'textarea', name: 'descripcion', label: 'Descripción para Google', max: 200, rows: 3 },
          { type: 'repeater', name: 'estadisticas', label: 'Números del inicio', itemLabel: 'Dato', titleField: 'etiqueta', fields: [
            { type: 'number', name: 'valor', label: 'Valor' },
            { type: 'text', name: 'prefijo', label: 'Prefijo', placeholder: '+' },
            { type: 'text', name: 'etiqueta', label: 'Etiqueta' },
          ] },
          { type: 'text', name: 'nombre', label: 'Nombre corto' },
          { type: 'text', name: 'nombreLargo', label: 'Nombre completo' },
          { type: 'text', name: 'fundacion', label: 'Año de fundación' },
          { type: 'url', name: 'url', label: 'URL del sitio' },
          { type: 'group', name: 'analytics', label: 'Analítica', fields: [
            { type: 'text', name: 'ga4', label: 'ID de Google Analytics 4' },
            { type: 'text', name: 'gtm', label: 'ID de Google Tag Manager' },
          ] },
        ],
      },
    ],
  },
  {
    key: 'faq',
    label: 'Preguntas frecuentes',
    description: 'Se muestran en el inicio y alimentan el buscador.',
    file: 'content/faq.json',
    schema: faqSchema,
    sitePath: '/#faq',
    fields: [
      { type: 'repeater', name: 'preguntas', label: 'Preguntas', itemLabel: 'Pregunta', titleField: 'pregunta', collapsed: true, fields: [
        { type: 'text', name: 'pregunta', label: 'Pregunta', required: true },
        { type: 'markdown', name: 'respuesta', label: 'Respuesta', rows: 4 },
      ] },
    ],
  },
  {
    key: 'inscripciones',
    label: 'Inscripciones',
    description: 'Pasos, documentos descargables y fechas límite.',
    file: 'content/inscripciones.json',
    schema: inscripcionesSchema,
    sitePath: '/inscripciones',
    fields: [
      { type: 'markdown', name: 'intro', label: 'Introducción', rows: 3 },
      { type: 'repeater', name: 'pasos', label: 'Pasos', itemLabel: 'Paso', titleField: 'titulo', fields: [
        { type: 'text', name: 'titulo', label: 'Título' },
        { type: 'markdown', name: 'descripcion', label: 'Descripción', rows: 3 },
        { type: 'file', name: 'archivo', label: 'Archivo descargable', folder: 'docs', accept: '.pdf,.doc,.docx' },
        { type: 'text', name: 'archivoTexto', label: 'Texto del botón' },
      ] },
      { type: 'text', name: 'fechaLimiteRequisitos', label: 'Fecha límite para presentar requisitos', placeholder: '30 de marzo' },
      { type: 'group', name: 'fechaLimiteSecundario', label: 'Fecha límite para materias del secundario', fields: [
        { type: 'number', name: 'dia', label: 'Día' },
        { type: 'text', name: 'mes', label: 'Mes' },
      ] },
      { type: 'markdown', name: 'secundario', label: 'Texto sobre el secundario', rows: 3 },
      { type: 'group', name: 'mayores25', label: 'Mayores de 25 años', fields: [
        { type: 'markdown', name: 'descripcion', label: 'Descripción', rows: 3 },
        { type: 'repeater', name: 'archivos', label: 'Archivos', itemLabel: 'Archivo', titleField: 'texto', fields: [
          { type: 'text', name: 'texto', label: 'Texto del botón' },
          { type: 'file', name: 'url', label: 'Archivo', folder: 'docs', accept: '.pdf,.doc,.docx' },
        ] },
      ] },
    ],
  },
  {
    key: 'plan',
    label: 'Plan de estudios',
    description: 'Materias por año, cargas horarias y resolución.',
    file: 'content/plan.json',
    schema: planSchema,
    sitePath: '/carrera#plan',
    fields: [
      { type: 'text', name: 'titulo', label: 'Título que otorga' },
      { type: 'text', name: 'resolucion', label: 'Resolución' },
      { type: 'text', name: 'duracion', label: 'Duración' },
      { type: 'number', name: 'horasReloj', label: 'Horas reloj totales' },
      { type: 'number', name: 'horasCatedra', label: 'Horas cátedra totales' },
      { type: 'repeater', name: 'anios', label: 'Años', itemLabel: 'Año', titleField: 'anio', collapsed: true, fields: [
        { type: 'text', name: 'anio', label: 'Año', placeholder: '1° año' },
        { type: 'number', name: 'horasReloj', label: 'Horas reloj' },
        { type: 'number', name: 'horasCatedra', label: 'Horas cátedra' },
        { type: 'repeater', name: 'materias', label: 'Materias', itemLabel: 'Materia', titleField: 'nombre', fields: [
          { type: 'text', name: 'nombre', label: 'Nombre' },
          { type: 'select', name: 'tipo', label: 'Tipo', options: ['', 'Materia', 'Taller', 'Práctica docente'].map((v) => ({ value: v, label: v || '(sin tipo)' })) },
          { type: 'number', name: 'horas', label: 'Horas' },
        ] },
      ] },
    ],
  },
  {
    key: 'aranceles',
    label: 'Aranceles',
    description: 'Tabla de valores. Activá "visible" para publicar la página.',
    file: 'content/aranceles.json',
    schema: arancelesSchema,
    sitePath: '/aranceles',
    fields: [
      { type: 'boolean', name: 'visible', label: 'Página visible en el sitio' },
      { type: 'text', name: 'nota', label: 'Nota (formas de pago, descuentos)' },
      { type: 'date', name: 'actualizado', label: 'Fecha de actualización' },
      { type: 'repeater', name: 'grupos', label: 'Grupos', itemLabel: 'Grupo', titleField: 'nombre', collapsed: true, fields: [
        { type: 'text', name: 'nombre', label: 'Nombre del grupo' },
        { type: 'repeater', name: 'items', label: 'Conceptos', itemLabel: 'Concepto', titleField: 'concepto', fields: [
          { type: 'text', name: 'concepto', label: 'Concepto' },
          { type: 'text', name: 'detalle', label: 'Detalle' },
          { type: 'text', name: 'caracter', label: 'Carácter', placeholder: 'Mensual / Pago único / Gratis' },
          { type: 'text', name: 'cuotas', label: 'Cuotas' },
          { type: 'text', name: 'precio', label: 'Precio' },
          { type: 'text', name: 'precioDescuento', label: 'Precio con descuento' },
        ] },
      ] },
      { type: 'markdown', name: 'uniforme', label: 'Nota sobre el uniforme', rows: 2 },
    ],
  },
  {
    key: 'galeria',
    label: 'Galería de la carrera',
    description: 'Fotos de los lugares de práctica en San Luis.',
    file: 'content/galeria.json',
    schema: galeriaSchema,
    sitePath: '/carrera',
    fields: [
      { type: 'repeater', name: 'imagenes', label: 'Fotos', itemLabel: 'Foto', titleField: 'lugar', fields: [
        { type: 'image', name: 'imagen', label: 'Imagen', folder: 'galeria', maxWidth: 1920 },
        { type: 'text', name: 'lugar', label: 'Lugar' },
        { type: 'text', name: 'credito', label: 'Crédito de la foto' },
      ] },
    ],
  },
  {
    key: 'conferencias',
    label: 'Grabaciones de conferencias',
    description: 'Página privada /hijos.htm con enlaces a videos y PDFs.',
    file: 'content/conferencias.json',
    schema: conferenciasSchema,
    sitePath: '/hijos.htm',
    fields: [
      { type: 'repeater', name: 'grabaciones', label: 'Cursos grabados', itemLabel: 'Curso', titleField: 'titulo', collapsed: true, fields: [
        { type: 'text', name: 'titulo', label: 'Título' },
        { type: 'text', name: 'subtitulo', label: 'Subtítulo', placeholder: '6 encuentros' },
        { type: 'repeater', name: 'enlaces', label: 'Enlaces', itemLabel: 'Enlace', titleField: 'nombre', fields: [
          { type: 'text', name: 'nombre', label: 'Nombre' },
          { type: 'text', name: 'url', label: 'URL' },
        ] },
      ] },
    ],
  },
];

export const getCollection = (key: string) => COLLECTIONS.find((c) => c.key === key);
export const getSingleton = (key: string) => SINGLETONS.find((s) => s.key === key);
