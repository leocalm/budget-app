import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { render, screen, userEvent } from '@/test-utils';
import { CookieBanner } from './CookieBanner';

const mockAccept = vi.fn();
const mockReject = vi.fn();
const useCookieConsentMock = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useCookieConsent', () => ({
  useCookieConsent: () => useCookieConsentMock(),
}));

function renderBanner() {
  return render(
    <MantineProvider>
      <CookieBanner />
    </MantineProvider>
  );
}

describe('CookieBanner', () => {
  beforeEach(() => {
    useCookieConsentMock.mockReset();
    mockAccept.mockReset();
    mockReject.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the banner when consent is null', () => {
    useCookieConsentMock.mockReturnValue({ consent: null, accept: mockAccept, reject: mockReject });
    renderBanner();
    expect(screen.getByRole('region', { name: /cookie consent/i })).toBeInTheDocument();
  });

  it('does not render when consent is "accepted"', () => {
    useCookieConsentMock.mockReturnValue({
      consent: 'accepted',
      accept: mockAccept,
      reject: mockReject,
    });
    renderBanner();
    expect(screen.queryByRole('region', { name: /cookie consent/i })).not.toBeInTheDocument();
  });

  it('does not render when consent is "rejected"', () => {
    useCookieConsentMock.mockReturnValue({
      consent: 'rejected',
      accept: mockAccept,
      reject: mockReject,
    });
    renderBanner();
    expect(screen.queryByRole('region', { name: /cookie consent/i })).not.toBeInTheDocument();
  });

  it('calls accept() when Accept button is clicked', async () => {
    const user = userEvent.setup();
    useCookieConsentMock.mockReturnValue({ consent: null, accept: mockAccept, reject: mockReject });
    renderBanner();
    await user.click(screen.getByRole('button', { name: /accept/i }));
    expect(mockAccept).toHaveBeenCalledOnce();
  });

  it('calls reject() when Reject button is clicked', async () => {
    const user = userEvent.setup();
    useCookieConsentMock.mockReturnValue({ consent: null, accept: mockAccept, reject: mockReject });
    renderBanner();
    await user.click(screen.getByRole('button', { name: /reject/i }));
    expect(mockReject).toHaveBeenCalledOnce();
  });
});
