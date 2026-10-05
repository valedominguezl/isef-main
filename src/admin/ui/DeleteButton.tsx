import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { Button, IconButton } from './Button';
import { useConfirm } from './ConfirmDialog';
import styles from './Ui.module.scss';

/* ─────────────────────────────── Botón de eliminar ───────────────────────────────
 * Pide confirmación (diálogo) y recién ahí llama a `onDelete`. Con `children` muestra texto;
 * sin `children` es un botón de solo ícono con tooltip.
 */
export default function DeleteButton({
  what,
  consequence,
  onDelete,
  label = 'Eliminar',
  ask: askFirst = true,
  children,
}: {
  /** Nombre de lo que se elimina (va en el título del diálogo). */
  what: string;
  /** Una línea con lo que pasa al eliminar. */
  consequence?: string;
  onDelete: () => void;
  label?: string;
  /** false: elimina sin preguntar (p. ej. un elemento recién agregado y vacío). */
  ask?: boolean;
  children?: ReactNode;
}) {
  const confirm = useConfirm();
  const ask = async () => {
    if (!askFirst || (await confirm({ title: `¿Eliminar «${what}»?`, body: consequence, confirmLabel: label }))) onDelete();
  };
  return children ? (
    <Button variant="danger" icon={Trash2} onClick={ask}>
      {children}
    </Button>
  ) : (
    <IconButton icon={Trash2} label={`${label} «${what}»`} onClick={ask} className={styles.iconDanger} />
  );
}
