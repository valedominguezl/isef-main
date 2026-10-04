import { normalize } from '@/lib/format';

/** Resalta los términos buscados (insensible a tildes y mayúsculas). */
export default function Highlight({ text, terms }: { text: string; terms: string[] }) {
  const clean = terms.map(normalize).filter((t) => t.length > 1);
  if (!clean.length) return <>{text}</>;
  const nt = normalize(text);
  const ranges: [number, number][] = [];
  for (const t of clean) {
    let i = nt.indexOf(t);
    while (i >= 0) {
      ranges.push([i, i + t.length]);
      i = nt.indexOf(t, i + t.length);
    }
  }
  if (!ranges.length) return <>{text}</>;
  ranges.sort((a, b) => a[0] - b[0]);
  const out: React.ReactNode[] = [];
  let last = 0;
  ranges.forEach(([s, e], k) => {
    if (s < last) return;
    out.push(text.slice(last, s), <mark key={k}>{text.slice(s, e)}</mark>);
    last = e;
  });
  out.push(text.slice(last));
  return <>{out}</>;
}
