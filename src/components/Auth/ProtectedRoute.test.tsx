import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';

const mockUseAuth = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>dashboard</div>
            </ProtectedRoute>
          }
        />
        <Route path="/onboarding" element={<div>onboarding</div>} />
        <Route path="/auth/login" element={<div>login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute onboarding guard', () => {
  it('redirects to /onboarding when onboardingStatus is not_started', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'a@b.com', name: 'A', onboardingStatus: 'not_started' },
    });
    renderWithRouter('/dashboard');
    expect(screen.getByText('onboarding')).toBeInTheDocument();
  });

  it('allows access when onboardingStatus is completed', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'a@b.com', name: 'A', onboardingStatus: 'completed' },
    });
    renderWithRouter('/dashboard');
    expect(screen.getByText('dashboard')).toBeInTheDocument();
  });

  it('redirects to /auth/login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
    renderWithRouter('/dashboard');
    expect(screen.getByText('login')).toBeInTheDocument();
  });
});
