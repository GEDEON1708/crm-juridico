import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const apiRoot = apiUrl.replace(/\/api\/?$/, '');
export const authMode = import.meta.env.VITE_AUTH_MODE || 'token';

export const initializeCsrfCookie = () => axios.get(`${apiRoot}/sanctum/csrf-cookie`, {
  withCredentials: true,
  headers: { Accept: 'application/json' },
});

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: authMode === 'session',
  withXSRFToken: authMode === 'session',
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  if (authMode === 'session') {
    delete config.headers.Authorization;
  } else {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && authMode === 'session') {
      if (!originalRequest.url?.endsWith('/auth/login') && !originalRequest._retry) {
        originalRequest._retry = true;
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    if (error.response?.status === 401 && authMode !== 'session' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('Refresh token ausente');
        }

        const response = await axios.post(
          `${apiUrl}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
