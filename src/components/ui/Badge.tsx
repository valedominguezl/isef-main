import type { ReactNode } from 'react';
import styles from './Badge.module.scss';

export default function Badge({ children, tone = 'blue', className }: { children: ReactNode; tone?: 'blue' | 'white' | 'brand' | 'neutral' | 'light' | 'success'; className?: string }) {
  return <span className={[styles.badge, styles[tone], className].filter(Boolean).join(' ')}>{children}</span>;
}
