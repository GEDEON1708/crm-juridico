import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

const Layout = lazy(() => import('./components/Layout'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const Cases = lazy(() => import('./pages/Cases'));
const CaseDetail = lazy(() => import('./pages/CaseDetail'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Documents = lazy(() => import('./pages/Documents'));
const Deadlines = lazy(() => import('./pages/Deadlines'));
const Fees = lazy(() => import('./pages/Fees'));
const Settings = lazy(() => import('./pages/Settings'));

const RouteFallback = () => (
  <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-300">
    <img src="/logo-mark.svg" alt="CRM Juridico" className="h-12 w-12 rounded-lg animate-pulse" />
    <span>Carregando CRM Juridico...</span>
  </div>
);

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />

          <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:id" element={<CaseDetail />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/deadlines" element={<Deadlines />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
