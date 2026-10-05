import type { ReactNode } from 'react';
import { AnimatePresence, m } from 'motion/react';
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
          animate={{
            opacity: 1,
            height: 'auto',
            transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
          }}
          exit={{
            opacity: 0,
            height: 0,
            transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
          }}
        >
          <p className={ok ? styles.notice : styles.errorBox} role={ok ? 'status' : 'alert'}>
            {children}
          </p>
        </m.div>
      )}
    </AnimatePresence>
  );
}
