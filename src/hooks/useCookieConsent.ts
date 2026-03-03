import { useState } from 'react';

type CookieConsent = 'accepted' | 'rejected' | null;

const STORAGE_KEY = 'piggy_pulse_cookie_consent';

function readConsent(): CookieConsent {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'accepted' || stored === 'rejected') {
    return stored;
  }
  return null;
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent>(readConsent);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setConsent('accepted');
  }

  function reject() {
    localStorage.setItem(STORAGE_KEY, 'rejected');
    setConsent('rejected');
  }

  return { consent, accept, reject };
}
