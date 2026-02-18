import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { usePageTitle } from './usePageTitle';

const renderWithRoute = (route: string) => {
  return renderHook(() => usePageTitle(), {
    wrapper: ({ children }) => <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>,
  });
};

describe('usePageTitle', () => {
  it('returns Dashboard for /dashboard', () => {
    const { result } = renderWithRoute('/dashboard');
    expect(result.current).toBe('Dashboard');
  });

  it('returns Dashboard for / (root)', () => {
    const { result } = renderWithRoute('/');
    expect(result.current).toBe('Dashboard');
  });

  it('returns Transactions for /transactions', () => {
    const { result } = renderWithRoute('/transactions');
    expect(result.current).toBe('Transactions');
  });

  it('returns Periods for /periods', () => {
    const { result } = renderWithRoute('/periods');
    expect(result.current).toBe('Periods');
  });

  it('returns Accounts for /accounts', () => {
    const { result } = renderWithRoute('/accounts');
    expect(result.current).toBe('Accounts');
  });

  it('returns Accounts for sub-route /accounts/123', () => {
    const { result } = renderWithRoute('/accounts/123');
    expect(result.current).toBe('Accounts');
  });

  it('returns Categories for /categories', () => {
    const { result } = renderWithRoute('/categories');
    expect(result.current).toBe('Categories');
  });

  it('returns Categories for sub-route /categories/abc', () => {
    const { result } = renderWithRoute('/categories/abc');
    expect(result.current).toBe('Categories');
  });

  it('returns Vendors for /vendors', () => {
    const { result } = renderWithRoute('/vendors');
    expect(result.current).toBe('Vendors');
  });

  it('returns Settings for /settings', () => {
    const { result } = renderWithRoute('/settings');
    expect(result.current).toBe('Settings');
  });

  it('returns Budget Plan for /budget', () => {
    const { result } = renderWithRoute('/budget');
    expect(result.current).toBe('Budget Plan');
  });

  it('returns Overlays for /overlays', () => {
    const { result } = renderWithRoute('/overlays');
    expect(result.current).toBe('Overlays');
  });

  it('returns empty string for unknown route', () => {
    const { result } = renderWithRoute('/unknown-page');
    expect(result.current).toBe('');
  });

  it('returns empty string for /error/500', () => {
    const { result } = renderWithRoute('/error/500');
    expect(result.current).toBe('');
  });

  it('returns empty string for /error/403', () => {
    const { result } = renderWithRoute('/error/403');
    expect(result.current).toBe('');
  });
});
