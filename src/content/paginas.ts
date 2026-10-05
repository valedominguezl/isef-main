/**
 * Textos de las páginas principales (editables desde /admin → Páginas, archivos content/paginas/*.json).
 *
 * Estos son los textos de respaldo: si en el JSON un campo falta o queda vacío, se usa el de acá.
 * Así una página nunca se rompe (el JSON se importa sin los defaults de zod) y "borrar" un texto
 * en el panel equivale a volver al original. Las fotos de respaldo son las del sitio
 * (src/assets/media, con su versión chica): las importa cada página.
 *
 * Al cambiar un texto acá, actualizar también el JSON (o dejar el campo vacío allá).
 */
import sitioJson from '@content/sitio.json';
import type { PaginaKey } from './schema';

// Directo del JSON (no de ./index): index.ts importa este archivo
const sitio = sitioJson as { fundacion: string };

/** Hero: título (con *resaltado*) y bajada. Bloque: título y texto (Markdown). */
type Textos = Record<string, Record<string, string>>;

export const PAGINAS_POR_DEFECTO = {
  inicio: {
    hero: {
      titulo: `Desde ${sitio.fundacion}, *abriendo caminos*`,
      subtitulo:
        'Título oficial con validez nacional, especializaciones gratuitas con científicos de renombre internacional y la cuota más baja del país.',
    },
    inscribite: { titulo: '*Inscribite* en el profesorado', texto: 'Todo lo que necesitás saber para empezar a cursar.' },
    bienvenida: {
      titulo: 'Te damos la bienvenida al *I.S.E.F.*',
      texto:
        'Hace más de 30 años que formamos profes en San Luis. Estudiás cerca de los tuyos, con docentes que te acompañan y con herramientas para trabajar **dentro y fuera de la escuela**: clubes, gimnasios, centros de salud y alto rendimiento.',
    },
    novedades: { titulo: 'Las *últimas noticias*', texto: 'Cursos nuevos, eventos y novedades del profesorado.' },
    especializaciones: {
      titulo: 'Las *especializaciones*',
      texto:
        'Cursos **gratuitos para alumnos** con científicos de renombre internacional: neurociencias, nutrición deportiva, adulto mayor, enfermedades crónicas, inteligencia artificial y más. Te preparan para trabajar en equipos interdisciplinarios con médicos, psicólogos y kinesiólogos.',
    },
    cuota: {
      titulo: 'La cuota más *competitiva*',
      texto:
        '**No te cobramos gastos adicionales**: constancias, certificaciones, cuota aguinaldo, matrícula y pileta de natación no tienen costo. Por eso tenemos **la cuota más baja de todo el país**.',
    },
    sedes: {
      titulo: 'Conocé *nuestras sedes*',
      texto: 'Cursá en la **Ciudad de San Luis** o en **Villa Mercedes**. Todos los teléfonos por área están en [contacto](/contacto).',
    },
    faq: { titulo: 'Preguntas *frecuentes*', texto: 'Lo que más nos consultan antes de inscribirse.' },
  },
  carrera: {
    hero: { titulo: 'Profesorado de *educación física*', subtitulo: 'Títulos oficiales de validez nacional' },
    intro: {
      titulo: 'Te necesitan, *profe*',
      texto:
        'Gracias al I.S.E.F. San Luis, **sos necesario**. Con los talleres de especialización que te ofrecemos de manera gratuita vas a poder ejercer en equipos interdisciplinarios en centros de salud, gimnasios, clubes, clínicas, hospitales y mucho más.\n\nTe damos herramientas para que seas capaz de **mucho más que la docencia**: el club, el gimnasio, la pileta, ciclistas, maratonistas, artes marciales, danza, patinaje, **centros de alto rendimiento** y la reinserción deportiva junto a kinesiólogos. Los egresados del I.S.E.F. están en **todos lados, mucho más allá de las escuelas**.',
    },
    especializaciones: { titulo: 'Algunas de nuestras *especializaciones*', texto: 'Gratuitas para los alumnos del profesorado.' },
    datos: { titulo: 'Información *general*' },
    validez: {
      titulo: 'Validez *nacional e internacional*',
      texto:
        'Tu título te permite trabajar en todo el territorio argentino y en los **países del MERCOSUR**. Consultá la validez nacional del título al 4452000, interno 3309, del Ministerio de Educación de San Luis.',
    },
    plan: { titulo: 'Plan de *estudios*' },
    gabinete: {
      titulo: 'Gabinete de *apoyo psicopedagógico*',
      texto:
        'Pensando siempre en tu formación, el profesorado dispone de un gabinete de apoyo psicopedagógico **gratuito** para acompañarte en el estudio. Así, tus conflictos se transforman en fortalezas y tu paso por esta casa de estudios es una experiencia realmente agradable. **Pedí turno en secretaría**.',
    },
    explora: {
      titulo: 'Exploramos *lo lindo que es San Luis*',
      texto:
        '**“Actividades y deportes regionales”** es un trayecto que integra las disciplinas de naturaleza y tiempo libre de primero a cuarto año, y concluye con una **residencia integradora** en el espacio curricular **“Vida en la naturaleza”**. Los **campamentos recreativos** incluyen palestra, senderismo, kayak, trekking, rapel, tirolesa, escalada, canotaje, mountain bike, montañismo, apnea, hidrospeed y remo en los **lugares más turísticos de San Luis**.',
    },
  },
  especializaciones: {
    hero: { titulo: 'Especializaciones', subtitulo: 'Conocé lo que nos hace únicos' },
    intro: {
      titulo: 'Siempre con las *últimas novedades*',
      texto:
        'La **intervención sobre las enfermedades debe empezar en la niñez**: la obesidad se relaciona con un mayor riesgo de desarrollar trece tipos de cáncer, entre ellos el **cáncer de mama** en mujeres posmenopáusicas, de colon, de páncreas o de **tiroides**.\n\nLas neurociencias, pilar de esta formación, te brindan herramientas para comprender **cómo el cerebro responde al ejercicio** y cómo influye en el desarrollo cognitivo, emocional y físico de cada etapa.\n\nCon talleres dictados por **científicos de renombre internacional** combinamos ciencias del deporte y neurociencias en **temáticas actualizadas**. Por eso, en el I.S.E.F. San Luis, te abrimos **caminos nunca antes pensados**.',
    },
    disertantes: {
      titulo: 'Conocé a los *disertantes*',
      texto: 'Ellos son quienes impulsan tu carrera para que estés **a la altura de los estándares internacionales**.',
    },
  },
  inscripciones: {
    hero: { titulo: 'Inscripciones', subtitulo: 'Toda la información para inscribirte' },
    requisitos: { titulo: 'Requisitos *a presentar*' },
    secundario: { titulo: '¿Recién terminás el *secundario*?' },
    mayores25: { titulo: 'Mayores de *25 años* sin secundario' },
    dudas: { titulo: 'Dudas *frecuentes*' },
  },
  novedades: {
    hero: { titulo: 'Novedades', subtitulo: 'Las últimas noticias del I.S.E.F.' },
  },
  contacto: {
    hero: { titulo: 'Contacto', subtitulo: 'Toda la información de nuestras sedes' },
    telefonos: { titulo: 'Teléfonos *de contacto*', texto: 'Todos los números funcionan por WhatsApp.' },
    sedes: { titulo: 'Nuestras *sedes*', texto: 'Cómo llegar a cada una.' },
  },
  aranceles: {
    hero: { titulo: 'Aranceles' },
  },
  conferencias: {
    hero: { titulo: 'Conferencias', subtitulo: 'Accedé a las grabaciones desde un solo lugar' },
  },
} satisfies Record<PaginaKey, Textos>;

type PorDefecto = typeof PAGINAS_POR_DEFECTO;
/** Página resuelta: todos los textos presentes + la foto del panel si se cargó una. */
export type PaginaResuelta<K extends PaginaKey> = { [B in keyof PorDefecto[K]]: PorDefecto[K][B] & { imagen?: string } };

const lleno = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';
const esObjeto = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === 'object' && !Array.isArray(v);

/** JSON del panel encima de los textos por defecto, campo por campo (lo vacío o ausente no pisa nada). */
export function resolverPagina<K extends PaginaKey>(key: K, json: unknown): PaginaResuelta<K> {
  const datos = esObjeto(json) ? json : {};
  const out: Record<string, Record<string, string>> = {};
  for (const [bloque, textos] of Object.entries(PAGINAS_POR_DEFECTO[key] as Textos)) {
    const propio = esObjeto(datos[bloque]) ? (datos[bloque] as Record<string, unknown>) : {};
    out[bloque] = { ...textos };
    for (const [campo, valor] of Object.entries(propio)) if (lleno(valor)) out[bloque][campo] = valor;
  }
  return out as PaginaResuelta<K>;
}
