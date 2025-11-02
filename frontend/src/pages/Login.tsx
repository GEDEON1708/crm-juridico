import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

interface LoginForm {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export default function Login() {
  const [require2FA, setRequire2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', data);

      if (response.data.require2FA) {
        setRequire2FA(true);
        toast.info('Digite o código 2FA');
        return;
      }

      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-400 mb-2">CRM Jurídico</h1>
          <h2 className="text-2xl font-semibold text-white">Sistema de Gestão Advocatícia</h2>
          <p className="mt-2 text-gray-400">Entre com suas credenciais</p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-2xl" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                {...register('email', { required: 'Email é obrigatório', pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' } })}
                type="email"
                className="input-field"
                placeholder="seu@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                {...register('password', { required: 'Senha é obrigatória' })}
                type="password"
                className="input-field"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {require2FA && (
              <div>
                <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Código 2FA
                </label>
                <input
                  {...register('twoFactorCode', { required: require2FA ? 'Código 2FA é obrigatório' : false })}
                  type="text"
                  className="input-field"
                  placeholder="000000"
                  maxLength={6}
                />
                {errors.twoFactorCode && <p className="mt-1 text-sm text-red-600">{errors.twoFactorCode.message}</p>}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm">
          &copy; 2024 CRM Jurídico. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
