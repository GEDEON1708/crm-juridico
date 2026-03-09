import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
        <footer className="bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 py-3 px-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
            <img src="/logo-mark.svg" alt="CRM Juridico" className="h-5 w-5 rounded-md" />
            <span>
              Desenvolvido por{' '}
              <a
                href="https://okapi-code-forge.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Okapi Code Forge
              </a>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
