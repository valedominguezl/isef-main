import { Route, Routes } from 'react-router-dom';
import Seo from '@/components/seo/Seo';
import { AdminProvider, useAdmin } from './AdminContext';
import Shell from './views/Shell';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import CollectionList from './views/CollectionList';
import EntryEditor from './views/EntryEditor';
import SingletonEditor from './views/SingletonEditor';

function AdminRoutes() {
  const { store } = useAdmin();
  if (!store) return <Login />;
  return (
    <Shell>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="c/:key" element={<CollectionList />} />
        <Route path="c/:key/:slug" element={<EntryEditor />} />
        <Route path="s/:key" element={<SingletonEditor />} />
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
