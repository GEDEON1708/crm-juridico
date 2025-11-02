import { Menu } from '@headlessui/react';
import { BellIcon, UserCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../lib/axios';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications?limit=5');
      return res.data;
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
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
      toast.success('Todas as notificações foram marcadas como lidas');
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificação excluída');
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
        return '⏰';
      case 'AUDIENCIA':
        return '⚖️';
      case 'PAGAMENTO':
        return '💰';
      case 'DOCUMENTO':
        return '📄';
      default:
        return '🔔';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-dark-900">
            Bem-vindo, {user?.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {user?.role === 'SOCIO' && 'Sócio'}
            {user?.role === 'ADVOGADO' && 'Advogado'}
            {user?.role === 'ESTAGIARIO' && 'Estagiário'}
            {user?.role === 'ADMINISTRATIVO' && 'Administrativo'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notificações */}
          <Menu as="div" className="relative">
            <Menu.Button 
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title="Notificações"
              aria-label="Ver notificações"
            >
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 max-h-[500px] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsReadMutation.mutate()}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              <div className="overflow-y-auto flex-1">
                {notifications.length > 0 ? (
                  notifications.map((notification: Notification) => (
                    <Menu.Item key={notification.id}>
                      {({ active }) => (
                        <div
                          className={`${
                            active ? 'bg-gray-50' : ''
                          } ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          } p-4 border-b border-gray-100 cursor-pointer relative`}
                        >
                          <div
                            onClick={() => handleNotificationClick(notification)}
                            className="flex gap-3"
                          >
                            <div className="text-2xl flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(notification.createdAt).toLocaleString('pt-BR')}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotificationMutation.mutate(notification.id);
                            }}
                            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-600 transition"
                            title="Excluir notificação"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </Menu.Item>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <BellIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhuma notificação</p>
                  </div>
                )}
              </div>
            </Menu.Items>
          </Menu>

          {/* Menu do usuário */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition">
              {user?.profileImage ? (
                <img
                  src={`http://localhost:3001${user.profileImage}`}
                  alt="Foto de perfil"
                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <UserCircleIcon className="h-8 w-8 text-gray-500" />
              )}
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="p-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/settings')}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } w-full text-left px-4 py-2 text-sm text-gray-700 rounded-md`}
                    >
                      Configurações
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-gray-100' : ''
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
