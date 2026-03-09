import { useEffect, useState } from 'react';
import { Menu } from '@headlessui/react';
import {
  BellIcon,
  UserCircleIcon,
  TrashIcon,
  MoonIcon,
  SunIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../lib/axios';
import { useUIStore } from '../store/uiStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

const apiRoot = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const [profileImageError, setProfileImageError] = useState(false);

  useEffect(() => {
    setProfileImageError(false);
  }, [user?.profileImage, user?.updatedAt]);

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications?limit=8');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Todas as notificacoes foram marcadas como lidas');
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificacao excluida');
    },
  });

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const notifications = notificationsData?.data || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PRAZO':
        return 'Prazo';
      case 'AUDIENCIA':
        return 'Audiencia';
      case 'PAGAMENTO':
        return 'Pagamento';
      case 'DOCUMENTO':
        return 'Documento';
      case 'CLIENTE':
        return 'Cliente';
      default:
        return 'Aviso';
    }
  };

  const profileImageSrc =
    !profileImageError &&
    user?.profileImage &&
    `${apiRoot}${user.profileImage}?v=${encodeURIComponent(user.updatedAt || Date.now().toString())}`;

  return (
    <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-700"
            title="Expandir/recolher menu"
            aria-label="Expandir ou recolher menu lateral"
          >
            <Bars3Icon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <img src="/logo-mark.svg" alt="CRM Juridico" className="h-7 w-7 rounded-md" />
              <h2 className="text-lg md:text-2xl font-semibold text-dark-900 dark:text-gray-100 truncate">
                Bem-vindo, {user?.name}
              </h2>
            </div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {user?.role === 'SOCIO' && 'Socio'}
              {user?.role === 'ADVOGADO' && 'Advogado'}
              {user?.role === 'ESTAGIARIO' && 'Estagiario'}
              {user?.role === 'ADMINISTRATIVO' && 'Administrativo'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-700"
            title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-700" />
            )}
          </button>

          <Menu as="div" className="relative">
            <Menu.Button
              className="relative p-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition"
              title="Notificacoes"
              aria-label="Ver notificacoes"
            >
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 w-[22rem] bg-white dark:bg-dark-800 rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-dark-600 focus:outline-none z-50 max-h-[500px] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notificacoes</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsReadMutation.mutate()}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Marcar todas
                  </button>
                )}
              </div>

              <div className="overflow-y-auto flex-1">
                {notifications.length > 0 ? (
                  notifications.map((notification: Notification) => (
                    <Menu.Item key={notification.id}>
                      {({ active }) => (
                        <div
                          className={`${active ? 'bg-gray-50 dark:bg-dark-700' : ''} ${
                            !notification.isRead ? 'bg-blue-50 dark:bg-blue-950/25' : ''
                          } p-4 border-b border-gray-100 dark:border-dark-700 cursor-pointer relative`}
                        >
                          <div onClick={() => handleNotificationClick(notification)} className="flex gap-3">
                            <div className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-dark-600 text-gray-700 dark:text-gray-200 h-fit">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{notification.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(notification.createdAt).toLocaleString('pt-BR')}
                              </p>
                            </div>
                            {!notification.isRead && <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2"></div>}
                          </div>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteNotificationMutation.mutate(notification.id);
                            }}
                            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-600 transition"
                            title="Excluir notificacao"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </Menu.Item>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <BellIcon className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-dark-500" />
                    <p>Nenhuma notificacao</p>
                  </div>
                )}
              </div>
            </Menu.Items>
          </Menu>

          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition">
              {profileImageSrc ? (
                <img
                  src={profileImageSrc}
                  alt="Foto de perfil"
                  className="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-dark-600"
                  onError={(event) => {
                    const target = event.target as HTMLImageElement;
                    target.onerror = null;
                    setProfileImageError(true);
                  }}
                />
              ) : (
                <UserCircleIcon className="h-8 w-8 text-gray-500 dark:text-gray-300" />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:inline">{user?.name}</span>
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-dark-600 focus:outline-none z-10">
              <div className="p-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/settings')}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-dark-700' : ''
                      } w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-md`}
                    >
                      Configuracoes
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-dark-700' : ''
                      } w-full text-left px-4 py-2 text-sm text-red-600 rounded-md`}
                    >
                      Sair
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
        </div>
      </div>
    </header>
  );
}
