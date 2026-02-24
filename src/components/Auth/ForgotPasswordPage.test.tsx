import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { requestPasswordReset } from '@/api/passwordReset';
import { ForgotPasswordPage } from './ForgotPasswordPage';

vi.mock('@/api/passwordReset', () => ({
  requestPasswordReset: vi.fn(),
}));

const wrap = () =>
  render(
    <MantineProvider>
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    </MantineProvider>
  );

describe('ForgotPasswordPage', () => {
  it('renders "Password recovery" heading', () => {
    wrap();
    expect(screen.getByRole('heading', { name: /password recovery/i })).toBeInTheDocument();
  });

  it('shows neutral message after successful submit', async () => {
    vi.mocked(requestPasswordReset).mockResolvedValueOnce({ message: 'ok' });
    wrap();
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
    await userEvent.click(screen.getByRole('button', { name: /send link/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());
    expect(screen.getByRole('status').textContent).toMatch(/if the email is registered/i);
  });

  it('shows the same neutral message even when API throws', async () => {
    vi.mocked(requestPasswordReset).mockRejectedValueOnce(new Error('Network error'));
    wrap();
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
    await userEvent.click(screen.getByRole('button', { name: /send link/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());
    expect(screen.getByRole('status').textContent).toMatch(/if the email is registered/i);
  });

  it('does not render a "Don\'t have an account?" link', () => {
    wrap();
    expect(screen.queryByText(/don't have an account/i)).not.toBeInTheDocument();
  });
});
