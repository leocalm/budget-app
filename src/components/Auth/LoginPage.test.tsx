import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { apiPost } from '@/api/client';
import { LoginPage } from './LoginPage';

vi.mock('@/api/client', () => ({ apiPost: vi.fn() }));
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, refreshUser: vi.fn().mockResolvedValue(true) }),
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn(), useLocation: () => ({ state: null }) };
});

const wrap = () =>
  render(
    <MantineProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </MantineProvider>
  );

describe('LoginPage', () => {
  it('renders tagline "Clarity begins with structure."', () => {
    wrap();
    expect(screen.getByText('Clarity begins with structure.')).toBeInTheDocument();
  });

  it('renders "Welcome back" heading', () => {
    wrap();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });

  it('does not render a remember me checkbox', () => {
    wrap();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('does not render "Don\'t have an account?" text', () => {
    wrap();
    expect(screen.queryByText(/don't have an account/i)).not.toBeInTheDocument();
  });

  it('shows neutral error message on credential failure', async () => {
    vi.mocked(apiPost).mockRejectedValueOnce(new Error('fail'));
    wrap();
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());
    // Must not be a red Alert
    expect(document.querySelector('[data-mantine-color="red"]')).toBeNull();
  });
});
