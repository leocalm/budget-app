import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCookieConsent } from './useCookieConsent';

const STORAGE_KEY = 'piggy_pulse_cookie_consent';

describe('useCookieConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null consent when localStorage has no value', () => {
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.consent).toBeNull();
  });

  it('returns "accepted" when localStorage has accepted value', () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.consent).toBe('accepted');
  });

  it('returns "rejected" when localStorage has rejected value', () => {
    localStorage.setItem(STORAGE_KEY, 'rejected');
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.consent).toBe('rejected');
  });

  it('accept() sets consent to "accepted" and persists to localStorage', () => {
    const { result } = renderHook(() => useCookieConsent());
    act(() => {
      result.current.accept();
    });
    expect(result.current.consent).toBe('accepted');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('accepted');
  });

  it('reject() sets consent to "rejected" and persists to localStorage', () => {
    const { result } = renderHook(() => useCookieConsent());
    act(() => {
      result.current.reject();
    });
    expect(result.current.consent).toBe('rejected');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('rejected');
  });

  it('returns null for an unrecognised localStorage value', () => {
    localStorage.setItem(STORAGE_KEY, 'something-weird');
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.consent).toBeNull();
  });
});
