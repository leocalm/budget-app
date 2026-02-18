import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logout as apiLogout } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { render, screen, userEvent } from '@/test-utils';
import { UserMenu } from './UserMenu';

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/api/auth', () => ({
  logout: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockUseAuth = vi.mocked(useAuth);
const mockApiLogout = vi.mocked(apiLogout);

const defaultUser = { id: '1', email: 'test@example.com', name: 'John Doe' };

const renderMenu = (variant: 'sidebar' | 'topbar' = 'sidebar') =>
  render(
    <MemoryRouter>
      <UserMenu variant={variant} />
    </MemoryRouter>
  );

describe('UserMenu', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: defaultUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
    mockApiLogout.mockResolvedValue(undefined);
    mockNavigate.mockReset();
  });

  describe('getInitials', () => {
    it('shows two-letter initials for full name', () => {
      renderMenu('topbar');
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('shows first two chars for single-word name', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', email: 'x@x.com', name: 'Alice' },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
      });
      renderMenu('topbar');
      expect(screen.getByText('AL')).toBeInTheDocument();
    });

    it('falls back to U when name is null', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
      });
      renderMenu('topbar');
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('falls back to U when name is empty string', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', email: 'x@x.com', name: '' },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
      });
      renderMenu('topbar');
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('falls back to U when name is whitespace only', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', email: 'x@x.com', name: '   ' },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
      });
      renderMenu('topbar');
      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('renders topbar variant with only an avatar button', () => {
      renderMenu('topbar');
      expect(screen.getByTestId('user-menu-trigger')).toBeInTheDocument();
      // sidebar variant shows name/email text — topbar should not
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('renders sidebar variant showing name and email', () => {
      renderMenu('sidebar');
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  describe('logout', () => {
    it('calls apiLogout and navigates to login on logout click', async () => {
      const user = userEvent.setup();
      renderMenu('topbar');
      await user.click(screen.getByTestId('user-menu-trigger'));
      const logoutItem = await screen.findByTestId('user-menu-logout');
      await user.click(logoutItem);
      expect(mockApiLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
    });
  });
});
