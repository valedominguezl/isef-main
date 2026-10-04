import { aranceles, sitio } from '@/content';

export interface NavItem {
  label: string;
  to: string;
  external?: boolean;
}

export const MAIN_NAV: NavItem[] = [
  { label: 'La carrera', to: '/carrera' },
  { label: 'Especializaciones', to: '/especializaciones' },
  { label: 'Novedades', to: '/novedades' },
  { label: 'Inscripciones', to: '/inscripciones' },
  { label: 'Contacto', to: '/contacto' },
];

export const SECONDARY_NAV: NavItem[] = [
  { label: 'Campus virtual', to: sitio.campusUrl, external: true },
  ...(aranceles.visible ? [{ label: 'Aranceles', to: '/aranceles' }] : []),
  { label: 'Test HIIT', to: '/test-hiit' },
  { label: 'Política de privacidad', to: '/privacidad' },
];
