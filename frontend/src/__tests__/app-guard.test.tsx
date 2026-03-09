import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../store/authStore';

vi.mock('../components/Layout', () => ({
  default: () => <div>Layout</div>,
}));

vi.mock('../pages/Login', () => ({
  default: () => <div>Login Page</div>,
}));

vi.mock('../pages/Dashboard', () => ({
  default: () => <div>Dashboard Page</div>,
}));

import App from '../App';

const resetAuthState = () => {
  localStorage.clear();
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
  });
};

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

describe('App route guards', () => {
  beforeEach(() => {
    resetAuthState();
  });

  it('redirects unauthenticated users from protected routes to /login', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
        <LocationDisplay />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('location-display')).toHaveTextContent('/login');
    });
  });

  it('redirects authenticated users away from /login to /dashboard', async () => {
    useAuthStore.getState().setAuth(
      {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'SOCIO',
        twoFactorEnabled: false,
      },
      'access-token',
      'refresh-token'
    );

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
        <LocationDisplay />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('location-display')).toHaveTextContent('/dashboard');
    });
  });
});
