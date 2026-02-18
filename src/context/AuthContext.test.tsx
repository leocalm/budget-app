import { act, useEffect } from 'react';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/api/auth';
import { AuthProvider, useAuth } from './AuthContext';

const mockShow = vi.hoisted(() => vi.fn());
const mockFetchCurrentUser = vi.hoisted(() => vi.fn());

vi.mock('@/lib/toast', () => ({
  toast: {
    error: mockShow,
  },
}));

vi.mock('@/api/auth', () => ({
  fetchCurrentUser: mockFetchCurrentUser,
}));

const TestConsumer = ({ onReady }: { onReady?: (auth: ReturnType<typeof useAuth>) => void }) => {
  const auth = useAuth();

  useEffect(() => {
    onReady?.(auth);
  }, [auth, onReady]);

  return (
    <>
      <div data-testid="email">{auth.user?.email ?? 'none'}</div>
      <div data-testid="isLoading">{String(auth.isLoading)}</div>
      <div data-testid="isAuthenticated">{String(auth.isAuthenticated)}</div>
    </>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    mockShow.mockClear();
    mockFetchCurrentUser.mockReset();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('hydrates from stored user and refreshes auth state', async () => {
    const storedUser: User = {
      id: 'user-1',
      email: 'stored@example.com',
      name: 'Stored User',
    };
    const refreshedUser: User = {
      id: 'user-1',
      email: 'refreshed@example.com',
      name: 'Refreshed User',
    };

    localStorage.setItem('user', JSON.stringify(storedUser));
    mockFetchCurrentUser.mockResolvedValue(refreshedUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('email')).toHaveTextContent(refreshedUser.email);
    expect(JSON.parse(localStorage.getItem('user') ?? '')).toEqual(refreshedUser);
  });

  it('clears storage and shows a toast when refresh fails with stored user', async () => {
    const storedUser: User = {
      id: 'user-2',
      email: 'stored2@example.com',
      name: 'Stored User 2',
    };

    localStorage.setItem('user', JSON.stringify(storedUser));
    mockFetchCurrentUser.mockRejectedValue(new Error('Request failed'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('email')).toHaveTextContent('none');
    expect(localStorage.getItem('user')).toBeNull();
    expect(sessionStorage.getItem('user')).toBeNull();
    expect(mockShow).toHaveBeenCalled();
  });

  it('stores login in session storage and clears on logout', async () => {
    let authRef: ReturnType<typeof useAuth> | null = null;

    mockFetchCurrentUser.mockRejectedValue(new Error('No session'));

    render(
      <AuthProvider>
        <TestConsumer onReady={(auth) => (authRef = auth)} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });

    const sessionUser: User = {
      id: 'user-3',
      email: 'session@example.com',
      name: 'Session User',
    };

    act(() => {
      authRef?.login(sessionUser, false);
    });

    expect(sessionStorage.getItem('user')).toBe(JSON.stringify(sessionUser));
    expect(localStorage.getItem('user')).toBeNull();

    act(() => {
      authRef?.logout();
    });

    expect(sessionStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(screen.getByTestId('email')).toHaveTextContent('none');
  });

  it('stores login in local storage when remember me is true', async () => {
    let authRef: ReturnType<typeof useAuth> | null = null;

    mockFetchCurrentUser.mockRejectedValue(new Error('No session'));

    render(
      <AuthProvider>
        <TestConsumer onReady={(auth) => (authRef = auth)} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });

    const rememberedUser: User = {
      id: 'user-4',
      email: 'remembered@example.com',
      name: 'Remembered User',
    };

    act(() => {
      authRef?.login(rememberedUser, true);
    });

    expect(localStorage.getItem('user')).toBe(JSON.stringify(rememberedUser));
    expect(sessionStorage.getItem('user')).toBeNull();
  });

  it('throws when useAuth is called outside the provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    );
  });
});
