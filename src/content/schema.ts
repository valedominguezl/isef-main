/**
 * Esquemas del contenido editable (carpeta /content).
 * Fuente única de verdad: de acá salen los tipos del sitio, la validación del build
 * (`npm run content:check`) y la validación del panel de administración.
 */
import { z } from 'zod';
import { CV_SECCIONES, type CvSeccionTipo } from './constants';

export { CV_SECCIONES, NOVEDAD_CATEGORIAS, type CvSeccionTipo } from './constants';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato AAAA-MM-DD');
const mediaPath = z.string().regex(/^\/(media|docs)\/[\w\-./]+$/, 'Ruta dentro de /media o /docs');
const markdown = z.string();

/* ---------------------------------- Cursos --------------------------------- */
export const cursoSchema = z.object({
  titulo: z.string().min(3),
  subtitulo: z.string().min(3),
  imagen: mediaPath.optional(),
  etiqueta: z.string().max(24).optional(),
  destacado: z.boolean().default(false),
  publicado: z.boolean().default(true),
  mostrarEnCarrera: z.boolean().default(false),
  disertantes: z.array(slug).default([]),
  fechaInicio: isoDate.optional(),
  modalidad: z.string().optional(),
  duracion: z.string().optional(),
  costo: z.string().optional(),
  descripcion: markdown.optional(),
  importante: markdown.optional(),
  condiciones: markdown.optional(),
  temario: z.array(z.object({ tema: z.string().min(1), subtemas: z.array(z.string()).default([]) })).default([]),
});

/* -------------------------------- Disertantes ------------------------------- */
export const disertanteSchema = z.object({
  nombre: z.string().min(3),
  titulo: z.enum(['Dr.', 'Dra.', 'Lic.', 'Mg.', 'Prof.', 'Ing.', 'Abog.', '']).default(''),
  especialidad: z.string().min(3),
  foto: mediaPath.optional(),
  destacados: z.array(z.string()).max(8).default([]),
  orden: z.number().int().default(99),
  publicado: z.boolean().default(true),
});


export const cvItemSchema = z.object({
  periodo: z.string().optional(),
  titulo: z.string().min(1),
  institucion: z.string().optional(),
  detalle: z.string().optional(),
});

export const cvSchema = z.object({
  disertante: slug,
  resumen: z.string().max(600).optional(),
  secciones: z.array(
    z.object({
      tipo: z.enum(Object.keys(CV_SECCIONES) as [CvSeccionTipo, ...CvSeccionTipo[]]),
      titulo: z.string().optional(),
      items: z.array(cvItemSchema),
    }),
  ),
});

/* --------------------------------- Novedades -------------------------------- */
export const novedadSchema = z.object({
  titulo: z.string().min(3),
  fecha: isoDate,
  categoria: z.enum(['novedad', 'curso', 'evento', 'institucional']),
  resumen: z.string().min(10).max(500),
  cuerpo: markdown.optional(),
  imagen: mediaPath.optional(),
  curso: slug.optional(),
  enlace: z.object({ texto: z.string(), url: z.string() }).optional(),
  destacado: z.boolean().default(false),
  publicado: z.boolean().default(true),
});

/* ------------------------------- Singletons -------------------------------- */
export const faqSchema = z.object({
  preguntas: z.array(z.object({ pregunta: z.string().min(5), respuesta: markdown })),
});

export const planSchema = z.object({
  titulo: z.string(),
  resolucion: z.string(),
  duracion: z.string(),
  horasReloj: z.number(),
  horasCatedra: z.number(),
  anios: z.array(
    z.object({
      anio: z.string(),
      horasReloj: z.number(),
      horasCatedra: z.number(),
      materias: z.array(z.object({ nombre: z.string(), tipo: z.string().optional(), horas: z.number().optional() })),
    }),
  ),
});

export const inscripcionesSchema = z.object({
  intro: markdown,
  pasos: z.array(
    z.object({
      titulo: z.string(),
      descripcion: markdown,
      archivo: mediaPath.optional(),
      archivoTexto: z.string().optional(),
    }),
  ),
  fechaLimiteRequisitos: z.string(),
  fechaLimiteSecundario: z.object({ dia: z.number().int().min(1).max(31), mes: z.string() }),
  secundario: markdown,
  mayores25: z.object({
    descripcion: markdown,
    archivos: z.array(z.object({ texto: z.string(), url: mediaPath })),
  }),
});

export const arancelesSchema = z.object({
  visible: z.boolean(),
  nota: z.string(),
  actualizado: isoDate,
  grupos: z.array(
    z.object({
      nombre: z.string(),
      items: z.array(
        z.object({
          concepto: z.string(),
          detalle: z.string().optional(),
          caracter: z.string(),
          cuotas: z.string().optional(),
          precio: z.string().optional(),
          precioDescuento: z.string().optional(),
        }),
      ),
    }),
  ),
  uniforme: markdown,
});

export const conferenciasSchema = z.object({
  grabaciones: z.array(
    z.object({
      titulo: z.string(),
      subtitulo: z.string(),
      enlaces: z.array(z.object({ nombre: z.string(), url: z.string() })),
    }),
  ),
});

export const galeriaSchema = z.object({
  imagenes: z.array(z.object({ imagen: mediaPath, lugar: z.string(), credito: z.string().optional() })),
});

const telefono = z.string().regex(/^\d{10,15}$/, 'Solo dígitos con código de país, ej: 5492664564435');

export const sitioSchema = z.object({
  nombre: z.string(),
  nombreLargo: z.string(),
  descripcion: z.string().max(200),
  url: z.string().url(),
  fundacion: z.string(),
  campusUrl: z.string().url(),
  whatsapp: telefono,
  email: z.string().email(),
  inscripciones: z.object({ abiertas: z.boolean(), texto: z.string(), inicio: isoDate.optional(), cierre: isoDate.optional() }),
  estadisticas: z.array(z.object({ valor: z.number(), prefijo: z.string().default(''), etiqueta: z.string() })),
  telefonos: z.array(
    z.object({ area: z.string(), sede: z.string().optional(), descripcion: z.string(), numeros: z.array(telefono) }),
  ),
  sedes: z.array(
    z.object({
      nombre: z.string(),
      tipo: z.string(),
      direccion: z.string(),
      ciudad: z.string(),
      mapaUrl: z.string().url(),
      mapaEmbed: z.string().url(),
      lat: z.number(),
      lng: z.number(),
      telefono,
      facebook: z.string().url().optional(),
      horario: z.string(),
    }),
  ),
  redes: z.array(z.object({ red: z.enum(['facebook', 'instagram', 'youtube', 'tiktok']), etiqueta: z.string(), url: z.string().url() })),
  analytics: z.object({ ga4: z.string(), gtm: z.string() }),
});

export type Curso = z.infer<typeof cursoSchema>;
export type Disertante = z.infer<typeof disertanteSchema>;
export type Cv = z.infer<typeof cvSchema>;
export type CvItem = z.infer<typeof cvItemSchema>;
export type Novedad = z.infer<typeof novedadSchema>;
export type Faq = z.infer<typeof faqSchema>;
export type Plan = z.infer<typeof planSchema>;
export type Inscripciones = z.infer<typeof inscripcionesSchema>;
export type Aranceles = z.infer<typeof arancelesSchema>;
export type Conferencias = z.infer<typeof conferenciasSchema>;
export type Galeria = z.infer<typeof galeriaSchema>;
export type Sitio = z.infer<typeof sitioSchema>;

/** Registro de colecciones: carpeta → esquema. Lo usan el validador y el admin. */
export const collections = {
  cursos: { dir: 'content/cursos', schema: cursoSchema },
  disertantes: { dir: 'content/disertantes', schema: disertanteSchema },
  cv: { dir: 'content/cv', schema: cvSchema },
  novedades: { dir: 'content/novedades', schema: novedadSchema },
} as const;

export const singletons = {
  sitio: { file: 'content/sitio.json', schema: sitioSchema },
  faq: { file: 'content/faq.json', schema: faqSchema },
  plan: { file: 'content/plan.json', schema: planSchema },
  inscripciones: { file: 'content/inscripciones.json', schema: inscripcionesSchema },
  aranceles: { file: 'content/aranceles.json', schema: arancelesSchema },
  conferencias: { file: 'content/conferencias.json', schema: conferenciasSchema },
  galeria: { file: 'content/galeria.json', schema: galeriaSchema },
} as const;
