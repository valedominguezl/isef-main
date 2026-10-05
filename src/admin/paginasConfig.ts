/**
 * Panel → grupo "Páginas": un editor por página principal con sus textos y fotos
 * (content/paginas/<pagina>.json, esquemas en src/content/schema.ts → paginaSchemas).
 * Todo es opcional: lo que se deja vacío vuelve al texto/foto original (src/content/paginas.ts).
 */
import { Clapperboard, ClipboardList, House, Megaphone, Microscope, Phone, School, Wallet, type LucideIcon } from 'lucide-react';
import { paginaSchemas, type PaginaKey } from '@/content/schema';
import { PAGINAS_POR_DEFECTO } from '@/content/paginas';
import type { Field, SingletonConfig } from './config';
// Fotos que usa hoy el sitio: se muestran como vista previa mientras el campo esté vacío
import fotoInicio from '@/assets/media/home/hero.webp';
import fotoInicioBienvenida from '@/assets/media/home/intro.webp';
import fotoInicioEspec from '@/assets/media/home/especializaciones.webp';
import fotoAranceles from '@/assets/media/aranceles/main.webp';
import fotoCarrera from '@/assets/media/carrera/main.webp';
import fotoCarreraIntro from '@/assets/media/carrera/intro.webp';
import fotoCarreraGabinete from '@/assets/media/carrera/gabinete.webp';
import fotoEspec from '@/assets/media/especializaciones/main.webp';
import fotoEspecIntro from '@/assets/media/especializaciones/intro.webp';
import fotoInscripciones from '@/assets/media/inscripciones/main.webp';
import fotoNovedades from '@/assets/media/noticias/main.webp';

/** Cabecera de la página: título, bajada y foto de fondo. */
function hero({ subtitulo = true, ayudaSubtitulo, ayudaFoto, help, actual }: { subtitulo?: boolean; ayudaSubtitulo?: string; ayudaFoto?: string; help?: string; actual?: string } = {}): Field {
  return {
    type: 'group',
    name: 'hero',
    label: 'Cabecera',
    help,
    fields: [
      { type: 'text', name: 'titulo', label: 'Título', max: 90 },
      ...(subtitulo ? [{ type: 'textarea', name: 'subtitulo', label: 'Bajada', rows: 2, max: 220, help: ayudaSubtitulo } satisfies Field] : []),
      {
        type: 'image',
        name: 'imagen',
        label: 'Foto de cabecera',
        folder: 'paginas',
        maxWidth: 1920,
        actual,
        help: ayudaFoto ?? 'Horizontal: va de fondo, oscurecida.',
      },
    ],
  };
}

/** Bloque editorial: título + texto (Markdown) + foto opcional. */
function bloque(
  name: string,
  label: string,
  { texto = true, foto, actual, rows = 4, help }: { texto?: boolean; foto?: string; actual?: string; rows?: number; help?: string } = {},
): Field {
  return {
    type: 'group',
    name,
    label,
    help,
    collapsed: true,
    fields: [
      { type: 'text', name: 'titulo', label: 'Título', max: 90 },
      ...(texto ? [{ type: 'markdown', name: 'texto', label: 'Texto', rows } satisfies Field] : []),
      ...(foto ? [{ type: 'image', name: 'imagen', label: 'Foto', folder: 'paginas', maxWidth: 1600, actual, help: foto } satisfies Field] : []),
    ],
  };
}

type PaginaConfig = SingletonConfig & { key: `pagina-${PaginaKey}`; nav: string; icon: LucideIcon };

/**
 * Cada campo vacío muestra de fondo (placeholder) el texto que usa hoy el sitio: así se ve qué hay
 * y cómo se resalta (*asteriscos*) sin carteles de ayuda.
 */
const conTextoActual = (key: PaginaKey, fields: Field[]): Field[] => {
  const textos = PAGINAS_POR_DEFECTO[key] as Record<string, Record<string, string> | undefined>;
  return fields.map((g) =>
    g.type === 'group'
      ? {
          ...g,
          fields: g.fields.map((f) =>
            (f.type === 'text' || f.type === 'textarea' || f.type === 'markdown') && textos[g.name]?.[f.name] ? { ...f, placeholder: textos[g.name]?.[f.name] } : f,
          ),
        }
      : g,
  );
};

const pagina = (key: PaginaKey, nav: string, label: string, sitePath: string, icon: LucideIcon, fields: Field[]): PaginaConfig => ({
  key: `pagina-${key}`,
  nav,
  icon,
  label,
  description: 'Lo que dejes vacío usa el texto o la foto actual.',
  file: `content/paginas/${key}.json`,
  schema: paginaSchemas[key],
  sitePath,
  fields: conTextoActual(key, fields),
});

export const PAGINAS: PaginaConfig[] = [
  pagina('inicio', 'Inicio', 'Página de inicio', '/', House, [
    hero({ ayudaSubtitulo: 'El botón de abajo cambia solo según las inscripciones.', actual: fotoInicio }),
    bloque('inscribite', '«Inscribite en el profesorado»', { rows: 2, help: 'Las fechas y datos de cursado salen de Inscripciones y del Plan de estudios.' }),
    bloque('bienvenida', '«Te damos la bienvenida»', { foto: 'Se recorta en 4:3.', actual: fotoInicioBienvenida }),
    bloque('novedades', '«Las últimas noticias»', { rows: 2 }),
    bloque('especializaciones', '«Las especializaciones»', {
      foto: 'PNG sin fondo (con transparencia). Solo se ve en computadoras.',
      actual: fotoInicioEspec,
    }),
    bloque('cuota', '«La cuota más competitiva»', { foto: 'Va de fondo, oscurecida.', rows: 3, actual: fotoAranceles }),
    bloque('sedes', '«Conocé nuestras sedes»', { rows: 2, help: 'Las sedes se cargan en Configuración → Datos del instituto.' }),
    bloque('faq', '«Preguntas frecuentes»', { rows: 2, help: 'Las preguntas se cargan en Configuración → Preguntas frecuentes.' }),
  ]),
  pagina('carrera', 'La carrera', 'Página de la carrera', '/carrera', School, [
    hero({ actual: fotoCarrera }),
    bloque('intro', '«Te necesitan, profe»', { foto: 'Se recorta en 4:3.', rows: 6, actual: fotoCarreraIntro }),
    bloque('especializaciones', '«Algunas de nuestras especializaciones»', {
      rows: 2,
      help: 'Los cursos que aparecen se eligen en cada curso con «Mostrar en la página La carrera».',
    }),
    bloque('datos', '«Información general»', { texto: false }),
    bloque('validez', '«Validez nacional e internacional»', { rows: 3 }),
    bloque('plan', '«Plan de estudios»', { texto: false, help: 'Las materias y horas se cargan en Configuración → Plan de estudios.' }),
    bloque('gabinete', '«Gabinete psicopedagógico»', { foto: 'Va de fondo, oscurecida.', rows: 4, actual: fotoCarreraGabinete }),
    bloque('explora', '«Exploramos lo lindo que es San Luis»', { rows: 5, help: 'Las fotos del carrusel se cargan en Configuración → Galería de la carrera.' }),
  ]),
  pagina('especializaciones', 'Especializaciones', 'Página de especializaciones', '/especializaciones', Microscope, [
    hero({ actual: fotoEspec }),
    bloque('intro', '«Siempre con las últimas novedades»', { foto: 'Se recorta en 4:3.', rows: 8, actual: fotoEspecIntro }),
    bloque('disertantes', '«Conocé a los disertantes»', { rows: 2 }),
  ]),
  pagina('inscripciones', 'Inscripciones', 'Página de inscripciones', '/inscripciones', ClipboardList, [
    hero({ ayudaSubtitulo: 'Se muestra cuando las inscripciones están cerradas; abiertas, se usa el texto del botón de Datos del instituto.', actual: fotoInscripciones }),
    bloque('requisitos', '«Requisitos a presentar»', { texto: false, help: 'Los pasos y archivos se cargan en Configuración → Inscripciones.' }),
    bloque('secundario', '«¿Recién terminás el secundario?»', { texto: false, help: 'Acá lo que va entre *asteriscos* sale en negrita, no en color.' }),
    bloque('mayores25', '«Mayores de 25 años»', { texto: false }),
    bloque('dudas', '«Dudas frecuentes»', { texto: false }),
  ]),
  pagina('novedades', 'Novedades', 'Página de novedades', '/novedades', Megaphone, [hero({ actual: fotoNovedades })]),
  pagina('contacto', 'Contacto', 'Página de contacto', '/contacto', Phone, [
    hero({ ayudaFoto: 'Opcional: hoy no tiene foto. Horizontal, va de fondo oscurecida.' }),
    bloque('telefonos', '«Teléfonos de contacto»', { rows: 2, help: 'Los números se cargan en Configuración → Datos del instituto.' }),
    bloque('sedes', '«Nuestras sedes»', { rows: 2 }),
  ]),
  pagina('aranceles', 'Aranceles', 'Página de aranceles', '/aranceles', Wallet, [
    hero({ subtitulo: false, help: 'La bajada es la nota que se carga en Configuración → Aranceles.', actual: fotoAranceles }),
  ]),
  pagina('conferencias', 'Conferencias', 'Página de conferencias', '/hijos.htm', Clapperboard, [hero({ ayudaFoto: 'Opcional: hoy no tiene foto. Horizontal, va de fondo oscurecida.' })]),
];

/** Claves de los editores de páginas (para separarlos de "Configuración" en la barra lateral). */
export const PAGINA_KEYS = new Set<string>(PAGINAS.map((p) => p.key));
