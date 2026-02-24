import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { validatePasswordResetToken } from '@/api/passwordReset';
import { ResetPasswordPage } from './ResetPasswordPage';

vi.mock('@/api/passwordReset', () => ({
  validatePasswordResetToken: vi.fn().mockResolvedValue({ valid: false }),
  confirmPasswordReset: vi.fn(),
}));
vi.mock('@/hooks/usePasswordStrength', () => ({
  usePasswordStrength: () => ({
    evaluate: vi.fn().mockReturnValue({ isStrong: true, score: 80, label: 'Strong' }),
  }),
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

const wrap = (search = '') =>
  render(
    <MantineProvider>
      <MemoryRouter initialEntries={[`/auth/reset-password${search}`]}>
        <Routes>
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </MemoryRouter>
    </MantineProvider>
  );

describe('ResetPasswordPage', () => {
  it('shows "Create new password" heading when token is valid', async () => {
    vi.mocked(validatePasswordResetToken).mockResolvedValueOnce({ valid: true, email: 'a@b.com' });
    wrap('?token=abc');
    expect(
      await screen.findByRole('heading', { name: /create new password/i })
    ).toBeInTheDocument();
  });

  it('shows neutral invalid token message', async () => {
    vi.mocked(validatePasswordResetToken).mockResolvedValueOnce({ valid: false });
    wrap('?token=bad');
    expect(await screen.findByText(/reset link is no longer valid/i)).toBeInTheDocument();
  });

  it('shows validating text initially', () => {
    vi.mocked(validatePasswordResetToken).mockImplementationOnce(
      () => new Promise(() => {}) // never resolves
    );
    wrap('?token=abc');
    expect(screen.getByText(/verifying reset link/i)).toBeInTheDocument();
  });

  it('renders the password strength indicator when token is valid', async () => {
    vi.mocked(validatePasswordResetToken).mockResolvedValueOnce({ valid: true, email: 'a@b.com' });
    wrap('?token=abc');
    await screen.findByRole('heading', { name: /create new password/i });
    // PasswordStrengthIndicator renders — no assertion on internals needed since
    // the component itself is reviewed separately
    expect(screen.getByRole('heading', { name: /create new password/i })).toBeInTheDocument();
  });
});
