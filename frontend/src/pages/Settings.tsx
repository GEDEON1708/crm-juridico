import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { UserCircleIcon, KeyIcon, BellIcon } from '@heroicons/react/24/outline';

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

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());

  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: errorsProfile } } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    }
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: errorsPassword }, reset } = useForm<PasswordForm>();

  const onSubmitProfile = async (data: ProfileForm) => {
    try {
      setLoading(true);
      const response = await api.put(`/users/${user?.id}`, data);
      
      const updatedUser = response.data.data;
      updateUser(updatedUser);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    try {
      setLoading(true);
      await api.put(`/users/${user?.id}`, { password: data.newPassword });
      toast.success('Senha alterada com sucesso!');
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: UserCircleIcon },
    { id: 'security', name: 'Segurança', icon: KeyIcon },
    { id: 'notifications', name: 'Notificações', icon: BellIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Configurações</h1>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'}`} />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'profile' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Informações do Perfil</h2>
          
          {/* Foto de Perfil */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="text-lg font-medium mb-4">Foto de Perfil</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                {user?.profileImage ? (
                  <img
                    key={imageKey}
                    src={`http://localhost:3001${user.profileImage}?v=${imageKey}`}
                    alt="Foto de perfil"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Previne loop infinito
                      target.src = '';
                      target.style.display = 'none';
                      console.error('Erro ao carregar imagem do perfil');
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center border-2 border-gray-200">
                    <UserCircleIcon className="w-16 h-16 text-primary-600" />
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Validar tamanho (5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error('A imagem deve ter no máximo 5MB');
                      return;
                    }

                    // Validar tipo
                    if (!file.type.startsWith('image/')) {
                      toast.error('Por favor, selecione uma imagem válida');
                      return;
                    }

                    const formData = new FormData();
                    formData.append('profileImage', file);

                    try {
                      setLoading(true);
                      console.log('Enviando foto para:', `/users/${user?.id}/profile-image`);
                      
                      const response = await api.post(`/users/${user?.id}/profile-image`, formData, {
                        headers: {
                          'Content-Type': 'multipart/form-data',
                        },
                      });

                      console.log('Resposta do servidor:', response.data);
                      
                      const updatedUser = response.data.data;
                      updateUser(updatedUser);
                      setImageKey(Date.now()); // Força re-render da imagem
                      toast.success('Foto de perfil atualizada com sucesso!');
                      
                      // Limpar o input para permitir re-upload do mesmo arquivo
                      e.target.value = '';
                    } catch (error: any) {
                      console.error('Erro completo:', error);
                      console.error('Resposta do erro:', error.response);
                      const errorMsg = error.response?.data?.message || error.message || 'Erro ao atualizar foto';
                      toast.error(errorMsg);
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
                <label
                  htmlFor="profileImage"
                  className="btn btn-primary cursor-pointer inline-block"
                >
                  {loading ? 'Enviando...' : 'Alterar Foto'}
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Formatos aceitos: JPG, PNG, GIF. Máximo 5MB.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                <input {...registerProfile('name', { required: 'Nome é obrigatório' })} type="text" className="input-field" />
                {errorsProfile.name && <p className="mt-1 text-sm text-red-600">{errorsProfile.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input {...registerProfile('email', { required: 'Email é obrigatório' })} type="email" className="input-field" />
                {errorsProfile.email && <p className="mt-1 text-sm text-red-600">{errorsProfile.email.message}</p>}
              </div>
              <div>
                <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                <input {...registerProfile('phone')} id="profile-phone" type="text" className="input-field" placeholder="(11) 98765-4321" />
              </div>
              <div>
                <label htmlFor="profile-role" className="block text-sm font-medium text-gray-700 mb-2">Função</label>
                <input 
                  id="profile-role"
                  type="text" 
                  value={user?.role || ''} 
                  disabled 
                  title="Função do usuário"
                  aria-label="Função do usuário (não editável)"
                  className="input-field bg-gray-100" 
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Alterar Senha</h2>
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha Atual *</label>
              <input {...registerPassword('currentPassword', { required: true })} type="password" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha *</label>
              <input {...registerPassword('newPassword', { required: true, minLength: 6 })} type="password" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha *</label>
              <input {...registerPassword('confirmPassword', { required: true })} type="password" className="input-field" />
              {errorsPassword.confirmPassword && <p className="mt-1 text-sm text-red-600">As senhas não coincidem</p>}
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Preferências de Notificações</h2>
          <div className="space-y-6">
            {['Notificações de Email', 'Alertas de Prazos', 'Notificações de Audiências', 'Novos Documentos'].map((item, index) => (
              <div key={item} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{item}</h3>
                  <p className="text-sm text-gray-500">Receba notificações sobre {item.toLowerCase()}</p>
                </div>
                <label htmlFor={`notification-${index}`} className="relative inline-flex items-center cursor-pointer">
                  <input 
                    id={`notification-${index}`}
                    type="checkbox" 
                    defaultChecked 
                    title={`Ativar/Desativar ${item}`}
                    aria-label={`Ativar ou desativar ${item}`}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
