import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';
import { useUIStore } from '../store/uiStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Clientes', href: '/clients', icon: UsersIcon },
  { name: 'Processos', href: '/cases', icon: BriefcaseIcon },
  { name: 'Agenda', href: '/calendar', icon: CalendarIcon },
  { name: 'Documentos', href: '/documents', icon: DocumentTextIcon },
  { name: 'Prazos', href: '/deadlines', icon: ClockIcon },
  { name: 'Honorarios', href: '/fees', icon: CurrencyDollarIcon },
  { name: 'Configuracoes', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const location = useLocation();
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <aside
      className={`${
        sidebarCollapsed ? 'w-20' : 'w-72'
      } bg-dark-900 text-white flex flex-col transition-all duration-200 border-r border-dark-700`}
    >
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo-mark.svg" alt="CRM Juridico" className="h-10 w-10 rounded-xl" />
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-primary-300 truncate">CRM Juridico</h1>
                <p className="text-xs text-gray-400">Gestao advocaticia</p>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-dark-700 transition"
            title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
            aria-label={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {sidebarCollapsed ? <ChevronDoubleRightIcon className="h-5 w-5" /> : <ChevronDoubleLeftIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              title={sidebarCollapsed ? item.name : undefined}
              className={`flex items-center ${
                sidebarCollapsed ? 'justify-center' : 'gap-3'
              } px-3 py-3 rounded-lg transition-all ${
                isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`p-4 border-t border-dark-700 text-xs text-gray-400 ${sidebarCollapsed ? 'text-center' : ''}`}>
        {!sidebarCollapsed ? (
          <>
            <p>&copy; 2026 CRM Juridico</p>
            <p className="mt-1">v1.1.0</p>
          </>
        ) : (
          <p>v1.1</p>
        )}
      </div>
    </aside>
  );
}
