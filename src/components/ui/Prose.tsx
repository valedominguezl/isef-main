import { Markdown } from '@/lib/markdown';
import styles from './Prose.module.scss';

export default function Prose({ text, lead, className }: { text?: string; lead?: boolean; className?: string }) {
  return <Markdown text={text} className={[styles.prose, lead && styles.lead, className].filter(Boolean).join(' ')} />;
}
