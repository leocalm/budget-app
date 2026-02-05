import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

const renderWithRoutes = (initialEntry = '/private') => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/private"
          element={
            <ProtectedRoute>
              <div>Secret Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/auth/login" element={<div>Login Screen</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('shows a loading state while auth is resolving', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    renderWithRoutes();

    expect(screen.queryByText('Secret Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Screen')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    renderWithRoutes();

    expect(screen.getByText('Login Screen')).toBeInTheDocument();
    expect(screen.queryByText('Secret Content')).not.toBeInTheDocument();
  });

  it('renders children for authenticated users', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1', email: 'user@example.com', name: 'User' },
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    renderWithRoutes();

    expect(screen.getByText('Secret Content')).toBeInTheDocument();
  });
});
