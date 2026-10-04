import { Search } from 'lucide-react';
import Seo from '@/components/seo/Seo';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';
import { useSearch } from '@/features/search/SearchContext';
import styles from './NotFoundPage.module.scss';

export function Component() {
  const { open } = useSearch();
  return (
    <>
      <Seo title="Página no encontrada" noindex />
      <Section width="prose" className={styles.page}>
        <p className={styles.code}>404</p>
        <h1>No encontramos esta página</h1>
        <p>Puede que el enlace haya cambiado. Probá buscar lo que necesitás o volvé al inicio.</p>
        <div className={styles.actions}>
          <Button onClick={open} icon="none" leading={<Search size={18} aria-hidden />}>
            Buscar en el sitio
          </Button>
          <Button to="/" variant="outline">
            Ir al inicio
          </Button>
        </div>
      </Section>
    </>
  );
}
