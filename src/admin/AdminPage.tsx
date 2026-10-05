import { Route, Routes, useParams } from 'react-router-dom';
import Seo from '@/components/seo/Seo';
import { AdminProvider, useAdmin } from './AdminContext';
import Shell from './views/Shell';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import CollectionList from './views/CollectionList';
import EntryEditor from './views/EntryEditor';
import SingletonEditor from './views/SingletonEditor';
import { SkeletonShell } from './views/Skeleton';

// Cada pantalla se monta de cero al cambiar de colección/entrada: nada del estado anterior se arrastra
const Keyed = {
  List: () => <CollectionList key={useParams().key} />,
  Entry: () => {
    const { key, slug } = useParams();
    return <EntryEditor key={`${key}/${slug}`} />;
  },
  Singleton: () => <SingletonEditor key={useParams().key} />,
};

function AdminRoutes() {
  const { store, checking } = useAdmin();
  if (checking) return <SkeletonShell />;
  if (!store) return <Login />;
  return (
    <Shell>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="c/:key" element={<Keyed.List />} />
        <Route path="c/:key/:slug" element={<Keyed.Entry />} />
        <Route path="s/:key" element={<Keyed.Singleton />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Shell>
  );
}

/** Panel de administración de contenido (/admin). Solo cliente; no se indexa. */
export function Component() {
  return (
    <AdminProvider>
      <Seo title="Administración" noindex />
      <AdminRoutes />
    </AdminProvider>
  );
}
