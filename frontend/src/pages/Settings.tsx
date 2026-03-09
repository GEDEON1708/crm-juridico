import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { UserCircleIcon, KeyIcon, BellIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface ProfileForm {
  name: string;
  email: string;
  phone?: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PROFILE_IMAGE_MAX_SIZE = 10 * 1024 * 1024;

const apiRoot = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [loading, setLoading] = useState(false);
  const [imageVersion, setImageVersion] = useState(Date.now());
  const [imageError, setImageError] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: errorsProfile },
    reset: resetProfile,
  } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
    reset: resetPassword,
  } = useForm<PasswordForm>();

  useEffect(() => {
    resetProfile({
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
    });
    setImageError(false);
  }, [user, resetProfile]);

  const profileImageUrl = useMemo(() => {
    if (!user?.profileImage || imageError) return '';
    return `${apiRoot}${user.profileImage}?v=${imageVersion}`;
  }, [user?.profileImage, imageVersion, imageError]);

  const onSubmitProfile = async (data: ProfileForm) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await api.put(`/users/${user.id}`, data);
      updateUser(response.data.data);
      toast.success('Perfil atualizado com sucesso');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordForm) => {
    if (!user?.id) return;

    if (data.newPassword !== data.confirmPassword) {
      toast.error('As senhas nao coincidem');
      return;
    }

    if (data.newPassword.length < 6) {
      toast.error('A nova senha precisa ter ao menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await api.put(`/users/${user.id}`, { password: data.newPassword });
      toast.success('Senha alterada com sucesso');
      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (!allowedImageTypes.includes(file.type)) {
      toast.error('Formato invalido. Use JPG, PNG, GIF ou WEBP');
      event.target.value = '';
      return;
    }

    if (file.size > PROFILE_IMAGE_MAX_SIZE) {
      toast.error('A imagem deve ter no maximo 10MB');
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      setLoading(true);
      const response = await api.post(`/users/${user.id}/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedUser = response.data.data;
      updateUser(updatedUser);
      setImageVersion(Date.now());
      setImageError(false);
      toast.success('Foto de perfil atualizada com sucesso');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar foto');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: UserCircleIcon },
    { id: 'security', name: 'Seguranca', icon: KeyIcon },
    { id: 'notifications', name: 'Notificacoes', icon: BellIcon },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-dark-900 dark:text-gray-100 mb-6">Configuracoes</h1>

      <div className="border-b border-gray-200 dark:border-dark-700 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300'
              }`}
            >
              <tab.icon
                className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 dark:text-gray-300'}`}
              />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'profile' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 text-dark-900 dark:text-gray-100">Informacoes do perfil</h2>

          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-dark-700">
            <h3 className="text-lg font-medium mb-4 text-dark-900 dark:text-gray-100">Foto de perfil</h3>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="relative">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Foto de perfil"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-dark-600"
                    onError={() => {
                      setImageError(true);
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center border-2 border-gray-200 dark:border-dark-600">
                    <UserCircleIcon className="w-16 h-16 text-primary-600 dark:text-primary-300" />
                  </div>
                )}
              </div>

              <div>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleProfileImageUpload}
                />
                <label htmlFor="profileImage" className="btn btn-primary cursor-pointer inline-flex items-center gap-2">
                  <PhotoIcon className="h-5 w-5" />
                  {loading ? 'Enviando...' : 'Alterar foto'}
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Formatos aceitos: JPG, PNG, GIF e WEBP. Maximo 10MB.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Nome completo *</label>
                <input
                  {...registerProfile('name', { required: 'Nome obrigatorio' })}
                  type="text"
                  className="input-field"
                />
                {errorsProfile.name && <p className="mt-1 text-sm text-red-600">{errorsProfile.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Email *</label>
                <input
                  {...registerProfile('email', { required: 'Email obrigatorio' })}
                  type="email"
                  className="input-field"
                />
                {errorsProfile.email && <p className="mt-1 text-sm text-red-600">{errorsProfile.email.message}</p>}
              </div>

              <div>
                <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Telefone
                </label>
                <input
                  {...registerProfile('phone')}
                  id="profile-phone"
                  type="text"
                  className="input-field"
                  placeholder="(11) 98765-4321"
                />
              </div>

              <div>
                <label htmlFor="profile-role" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Funcao
                </label>
                <input
                  id="profile-role"
                  type="text"
                  value={user?.role || ''}
                  disabled
                  className="input-field bg-gray-100 dark:bg-dark-700"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Salvando...' : 'Salvar alteracoes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 text-dark-900 dark:text-gray-100">Alterar senha</h2>
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Senha atual *</label>
              <input {...registerPassword('currentPassword', { required: true })} type="password" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Nova senha *</label>
              <input
                {...registerPassword('newPassword', { required: true, minLength: 6 })}
                type="password"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Confirmar nova senha *</label>
              <input {...registerPassword('confirmPassword', { required: true })} type="password" className="input-field" />
              {errorsPassword.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">As senhas devem ser iguais</p>
              )}
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Alterando...' : 'Alterar senha'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 text-dark-900 dark:text-gray-100">Preferencias de notificacoes</h2>
          <div className="space-y-6">
            {['Notificacoes de email', 'Alertas de prazos', 'Notificacoes de audiencias', 'Novos documentos'].map(
              (item, index) => (
                <div key={item} className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{item}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receber avisos sobre {item.toLowerCase()}</p>
                  </div>
                  <label htmlFor={`notification-${index}`} className="relative inline-flex items-center cursor-pointer">
                    <input id={`notification-${index}`} type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-dark-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                  </label>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
