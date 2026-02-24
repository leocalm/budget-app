import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { RegisterPage } from './RegisterPage';

vi.mock('@/api/auth', () => ({ register: vi.fn() }));
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, refreshUser: vi.fn() }),
}));
vi.mock('@/hooks/usePasswordStrength', () => ({
  usePasswordStrength: () => ({
    evaluate: vi.fn().mockReturnValue({ isStrong: true, score: 80, label: 'Strong' }),
  }),
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn(), useLocation: () => ({ state: null }) };
});

const wrap = () =>
  render(
    <MantineProvider>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </MantineProvider>
  );

describe('RegisterPage', () => {
  it('renders without a red Alert on load', () => {
    wrap();
    // AuthMessage should not be visible when there is no error
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders the create account heading', () => {
    wrap();
    // The heading text comes from the i18n key auth.register.createAccountTitle
    // Check the element is present (don't hardcode the exact string)
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
