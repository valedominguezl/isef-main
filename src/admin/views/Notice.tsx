import type { ReactNode } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { enter, exit } from '@/lib/motion';
import styles from '../Admin.module.scss';

/**
 * Aviso de estado (guardado / error). Entra y sale con altura + fundido, así el formulario
 * de abajo se acomoda suave en vez de saltar.
 */
export default function Notice({ show, ok = true, className, children }: { show: boolean; ok?: boolean; className?: string; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <m.div
          className={[styles.noticeWrap, className].filter(Boolean).join(' ')}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto', transition: enter() }}
          exit={{ opacity: 0, height: 0, transition: exit(0.25) }}
        >
          <p className={ok ? styles.notice : styles.errorBox} role={ok ? 'status' : 'alert'}>
            {children}
          </p>
        </m.div>
      )}
    </AnimatePresence>
  );
}
