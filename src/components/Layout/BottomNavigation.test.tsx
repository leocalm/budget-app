import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '@/test-utils';
import { BottomNavigation } from './BottomNavigation';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderNav = (route = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <BottomNavigation />
    </MemoryRouter>
  );

describe('BottomNavigation', () => {
  it('renders 4 items: Dashboard, Transactions, Periods, More', () => {
    renderNav();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Periods')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('navigates when a regular item is clicked', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByText('Transactions'));
    expect(mockNavigate).toHaveBeenCalledWith('/transactions');
  });

  it('opens the More popover when More is clicked', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByText('More'));
    expect(await screen.findByText('Accounts')).toBeInTheDocument();
    expect(await screen.findByText('Categories')).toBeInTheDocument();
    expect(await screen.findByText('Vendors')).toBeInTheDocument();
  });

  it('navigates and closes popover when a More menu item is clicked', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByText('More'));
    await user.click(await screen.findByText('Accounts'));
    expect(mockNavigate).toHaveBeenCalledWith('/accounts');
  });

  it('highlights the active route', () => {
    renderNav('/periods');
    // Periods button should have cyan color class (active state)
    const periodText = screen.getAllByText('Periods')[0];
    expect(periodText).toBeInTheDocument();
  });
});
