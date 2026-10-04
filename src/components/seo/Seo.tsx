import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { sitio } from '@/content';

type JsonLd = Record<string, unknown>;

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  jsonLd?: JsonLd | JsonLd[];
  /** Ruta canónica si difiere de la actual. */
  path?: string;
}

const DEFAULT_IMAGE = '/og-default.jpg';

/** JSON seguro para <script>: evita que un "</script>" en el contenido cierre la etiqueta. */
export const safeJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

export function absoluteUrl(path: string) {
  return path.startsWith('http') ? path : `${sitio.url}${path}`;
}

export default function Seo({ title, description, image, type = 'website', noindex, jsonLd, path }: SeoProps) {
  const { pathname } = useLocation();
  const canonical = absoluteUrl(path ?? (pathname === '/' ? '/' : pathname.replace(/\/$/, '').toLowerCase()));
  const fullTitle = title ? `${title} | ${sitio.nombre}` : `${sitio.nombre} | Profesorado de Educación Física`;
  const desc = description ?? sitio.descripcion;
  const img = absoluteUrl(image ?? DEFAULT_IMAGE);
  const ld = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet prioritizeSeoTags>
      <html lang="es-AR" />
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:site_name" content={sitio.nombre} />
      <meta property="og:locale" content="es_AR" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      {ld.map((data, i) => (
        <script key={i} type="application/ld+json">
          {safeJson({ '@context': 'https://schema.org', ...data })}
        </script>
      ))}
    </Helmet>
  );
}

/** Datos estructurados de la institución (se incluyen en todas las páginas desde el Layout). */
export function organizationJsonLd(): JsonLd {
  return {
    '@type': ['EducationalOrganization', 'CollegeOrUniversity'],
    '@id': `${sitio.url}/#organizacion`,
    name: sitio.nombreLargo,
    alternateName: sitio.nombre,
    url: sitio.url,
    logo: `${sitio.url}/icon-512.png`,
    foundingDate: sitio.fundacion,
    email: sitio.email,
    telephone: `+${sitio.whatsapp}`,
    sameAs: sitio.redes.map((r) => r.url),
    address: sitio.sedes.map((s) => ({
      '@type': 'PostalAddress',
      streetAddress: s.direccion,
      addressLocality: s.ciudad,
      addressRegion: 'San Luis',
      addressCountry: 'AR',
    })),
    location: sitio.sedes.map((s) => ({
      '@type': 'Place',
      name: `${sitio.nombre} — ${s.nombre}`,
      address: { '@type': 'PostalAddress', streetAddress: s.direccion, addressLocality: s.ciudad, addressCountry: 'AR' },
      geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lng },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}
