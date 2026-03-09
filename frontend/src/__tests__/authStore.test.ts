import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '../store/authStore';

const resetAuthState = () => {
  localStorage.clear();
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
  });
};

describe('authStore', () => {
  beforeEach(() => {
    resetAuthState();
  });

  it('setAuth should persist user and tokens', () => {
    const user = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'SOCIO',
      twoFactorEnabled: false,
    };

    useAuthStore.getState().setAuth(user, 'access-token', 'refresh-token');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('test@example.com');
    expect(state.accessToken).toBe('access-token');
    expect(state.refreshToken).toBe('refresh-token');
    expect(localStorage.getItem('accessToken')).toBe('access-token');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
  });

  it('logout should clear auth state and tokens', () => {
    const user = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'SOCIO',
      twoFactorEnabled: false,
    };

    useAuthStore.getState().setAuth(user, 'access-token', 'refresh-token');
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });
});
