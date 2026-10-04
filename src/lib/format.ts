const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** "2025-09-25" → "25 de septiembre de 2025" (sin depender de la zona horaria). */
export function formatDate(iso?: string, opts: { year?: boolean } = {}): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const base = `${d} de ${MESES[m - 1]}`;
  return opts.year === false ? base : `${base} de ${y}`;
}

export const formatShortDate = (iso?: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

/** "5492664564435" → "+54 9 2664 56-4435" */
export function formatPhone(digits: string): string {
  const m = digits.match(/^54(9)?(\d{4})(\d{2})(\d{4})$/);
  if (!m) return `+${digits}`;
  return `+54 ${m[1] ? '9 ' : ''}${m[2]} ${m[3]}-${m[4]}`;
}

export const whatsappUrl = (digits: string, text?: string) =>
  `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
