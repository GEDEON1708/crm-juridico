import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

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
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', data);

      if (response.data.require2FA) {
        setRequire2FA(true);
        toast.info('Digite o codigo 2FA');
        return;
      }

      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success('Login realizado com sucesso');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/15 text-white hover:bg-white/25 border border-white/20"
          title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
        >
          {theme === 'dark' ? <SunIcon className="h-5 w-5 text-yellow-300" /> : <MoonIcon className="h-5 w-5" />}
        </button>
      </div>

      <div className="max-w-md w-full mx-auto space-y-8">
        <div className="text-center">
          <img src="/logo-full.svg" alt="CRM Juridico" className="h-20 mx-auto mb-4 drop-shadow-lg" />
          <h1 className="text-4xl font-bold brand-gradient">CRM Juridico</h1>
          <h2 className="text-2xl font-semibold text-white mt-2">Sistema de Gestao Advocaticia</h2>
          <p className="mt-2 text-gray-300">Entre com suas credenciais</p>
        </div>

        <form
          className="mt-8 space-y-6 bg-white/95 dark:bg-dark-800/95 p-8 rounded-2xl shadow-2xl border border-white/30 dark:border-dark-600"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Email
              </label>
              <input
                id="email"
                {...register('email', {
                  required: 'Email e obrigatorio',
                  pattern: { value: /^\S+@\S+$/i, message: 'Email invalido' },
                })}
                type="email"
                className="input-field"
                placeholder="seu@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Senha
              </label>
              <input
                id="password"
                {...register('password', { required: 'Senha e obrigatoria' })}
                type="password"
                className="input-field"
                placeholder="********"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {require2FA && (
              <div>
                <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Codigo 2FA
                </label>
                <input
                  id="twoFactorCode"
                  {...register('twoFactorCode', { required: require2FA ? 'Codigo 2FA e obrigatorio' : false })}
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

        <p className="text-center text-gray-300 text-sm">&copy; 2026 CRM Juridico. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}
