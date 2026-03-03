import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { createAccount, fetchAccountsManagement } from '@/api/account';
import { fetchCurrencies } from '@/api/currency';
import { fetchProfile, updateProfile } from '@/api/settings';
import { AccountsStep } from './AccountsStep';

vi.mock('@/api/account', () => ({ createAccount: vi.fn(), fetchAccountsManagement: vi.fn() }));
vi.mock('@/api/currency', () => ({ fetchCurrencies: vi.fn() }));
vi.mock('@/api/settings', () => ({
  fetchProfile: vi.fn(),
  updateProfile: vi.fn(),
}));

function renderStep(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('AccountsStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchAccountsManagement).mockResolvedValue([]);
    vi.mocked(fetchCurrencies).mockResolvedValue([]);
    vi.mocked(fetchProfile).mockResolvedValue({
      name: 'Test User',
      timezone: 'UTC',
      defaultCurrencyId: null,
    } as any);
    vi.mocked(createAccount).mockResolvedValue({ id: '1' } as any);
    vi.mocked(updateProfile).mockResolvedValue({} as any);
  });

  it('renders currency selector and one account form', () => {
    renderStep(<AccountsStep onComplete={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText(/default currency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/account name/i)).toBeInTheDocument();
  });

  it('adds a second account form when Add another is clicked', () => {
    renderStep(<AccountsStep onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByText(/add another account/i));
    expect(screen.getAllByLabelText(/account name/i)).toHaveLength(2);
  });

  it('Continue is disabled when no account name is filled', () => {
    renderStep(<AccountsStep onComplete={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });

  it('Continue is enabled when account name is filled with asset type', () => {
    renderStep(<AccountsStep onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/account name/i), {
      target: { value: 'My Bank' },
    });
    expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled();
  });

  it('calls createAccount and onComplete on Continue', async () => {
    const onComplete = vi.fn();
    renderStep(<AccountsStep onComplete={onComplete} onBack={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/account name/i), {
      target: { value: 'My Bank' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(createAccount).toHaveBeenCalledWith(expect.objectContaining({ name: 'My Bank' }));
  });
});
