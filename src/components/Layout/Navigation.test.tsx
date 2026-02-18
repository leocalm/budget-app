import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import { Navigation } from './Navigation';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderNav = (route = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Navigation />
    </MemoryRouter>
  );

describe('Navigation', () => {
  it('renders two section headings: Core and Structure', () => {
    renderNav();
    expect(screen.getByText('Core')).toBeInTheDocument();
    expect(screen.getByText('Structure')).toBeInTheDocument();
  });

  it('renders all 6 nav items', () => {
    renderNav();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Periods')).toBeInTheDocument();
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Vendors')).toBeInTheDocument();
  });

  it('does not render Settings or Logout in the sidebar', () => {
    renderNav();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    expect(screen.queryByText('Log out')).not.toBeInTheDocument();
  });

  it('highlights the active route', () => {
    renderNav('/transactions');
    // The active NavLink receives data-active attribute
    const link = screen.getByText('Transactions').closest('[data-active]');
    expect(link).not.toBeNull();
  });

  it('calls onNavigate callback when a link is clicked', async () => {
    const { userEvent: user } = await import('@/test-utils');
    const onNavigate = vi.fn();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Navigation onNavigate={onNavigate} />
      </MemoryRouter>
    );
    await user.setup().click(screen.getByText('Accounts'));
    expect(onNavigate).toHaveBeenCalled();
  });
});
