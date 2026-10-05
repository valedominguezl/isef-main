/**
 * Markdown mínimo y seguro (no usa innerHTML). Soporta:
 * párrafos (línea en blanco), saltos de línea, **negrita**, _cursiva_, [enlace](url)
 * y listas con "- ". Los enlaces internos (/ruta) usan el router.
 */
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router';

const INLINE = /(\*\*[^*]+\*\*|_[^_]+_|\[[^\]]+\]\([^)\s]+\))/g;

export function inline(text: string, keyPrefix = ''): ReactNode[] {
  const out: ReactNode[] = [];
  text.split(INLINE).forEach((part, i) => {
    if (!part) return;
    const key = `${keyPrefix}${i}`;
    if (part.startsWith('**') && part.endsWith('**')) out.push(<strong key={key}>{part.slice(2, -2)}</strong>);
    else if (part.startsWith('_') && part.endsWith('_') && part.length > 2) out.push(<em key={key}>{part.slice(1, -1)}</em>);
    else if (part.startsWith('[')) {
      const m = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (!m) out.push(part);
      else {
        const [, label, href] = m;
        const safe = /^(https?:|mailto:|tel:|\/|#)/.test(href) ? href : '#';
        out.push(
          safe.startsWith('/') ? (
            <Link key={key} to={safe}>
              {label}
            </Link>
          ) : (
            <a key={key} href={safe} target={safe.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
              {label}
            </a>
          ),
        );
      }
    } else {
      const lines = part.split('\n');
      lines.forEach((line, j) => {
        out.push(<Fragment key={`${key}-${j}`}>{line}</Fragment>);
        if (j < lines.length - 1) out.push(<br key={`${key}-br${j}`} />);
      });
    }
  });
  return out;
}

export function Markdown({ text, className }: { text?: string; className?: string }) {
  if (!text) return null;
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        if (lines.every((l) => /^\s*[-*] /.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-*] /, ''), `${i}-${j}-`)}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{inline(block, `${i}-`)}</p>;
      })}
    </div>
  );
}

/** Texto plano (para meta descriptions, índice de búsqueda, etc.). */
export function toPlainText(text = ''): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*] /gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Títulos con énfasis de marca: "Bienvenido al *I.S.E.F.*" → la palabra entre asteriscos
 * se pinta con el color primario (o `!texto!` con el acento coral).
 */
export function rich(text: string): ReactNode[] {
  return text.split(/(\*[^*]+\*|![^!]+!)/g).map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2)
      return (
        <span key={i} className="em">
          {part.slice(1, -1)}
        </span>
      );
    if (part.startsWith('!') && part.endsWith('!') && part.length > 2)
      return (
        <span key={i} className="em-accent">
          {part.slice(1, -1)}
        </span>
      );
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export const excerpt = (text = '', max = 160) => {
  const plain = toPlainText(text);
  return plain.length <= max ? plain : `${plain.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
};
