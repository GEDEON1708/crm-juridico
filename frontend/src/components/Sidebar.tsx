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
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Clientes', href: '/clients', icon: UsersIcon },
  { name: 'Processos', href: '/cases', icon: BriefcaseIcon },
  { name: 'Agenda', href: '/calendar', icon: CalendarIcon },
  { name: 'Documentos', href: '/documents', icon: DocumentTextIcon },
  { name: 'Prazos', href: '/deadlines', icon: ClockIcon },
  { name: 'Honorários', href: '/fees', icon: CurrencyDollarIcon },
  { name: 'Configurações', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-dark-800 text-white flex flex-col">
      <div className="p-6 border-b border-dark-700">
        <h1 className="text-2xl font-bold text-primary-400">CRM Jurídico</h1>
        <p className="text-sm text-gray-400 mt-1">Gestão Advocatícia</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-dark-700">
        <div className="text-xs text-gray-400">
          <p>&copy; 2024 CRM Jurídico</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
