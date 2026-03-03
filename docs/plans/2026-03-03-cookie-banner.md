# Cookie Banner Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a GDPR-compliant cookie consent banner that persists the user's accept/reject choice to localStorage and conditionally renders a fixed bottom bar until a choice is made.

**Architecture:** A `useCookieConsent` hook owns all state (reads/writes `localStorage` key `piggy_pulse_cookie_consent`). A `CookieBanner` component reads that hook and renders nothing once a choice is stored. The banner is mounted in `App.tsx` so it appears on every page.

**Tech Stack:** React 19, TypeScript, Mantine v8 (`Paper`, `Group`, `Button`, `Text`), react-i18next (en + pt), Vitest + @testing-library/react

---

### Task 1: Add i18n keys

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/pt.json`

**Step 1: Add English keys**

In `src/locales/en.json`, add a top-level `"cookieBanner"` key before the closing `}`:

```json
  "cookieBanner": {
    "message": "We use cookies to keep you logged in and, with your consent, to understand how the app is used. Strictly necessary cookies are always active.",
    "accept": "Accept",
    "reject": "Reject"
  }
```

**Step 2: Add Portuguese keys**

In `src/locales/pt.json`, add the matching `"cookieBanner"` key:

```json
  "cookieBanner": {
    "message": "Utilizamos cookies para manter a sua sessão ativa e, com o seu consentimento, para perceber como a aplicação é utilizada. Os cookies estritamente necessários estão sempre ativos.",
    "accept": "Aceitar",
    "reject": "Rejeitar"
  }
```

**Step 3: Run typecheck to confirm JSON is valid**

```bash
yarn typecheck
```

Expected: no errors.

**Step 4: Commit**

```bash
git add src/locales/en.json src/locales/pt.json
git commit -m "feat(cookie-banner): add i18n keys for cookie consent banner"
```

---

### Task 2: Implement `useCookieConsent` hook

**Files:**
- Create: `src/hooks/useCookieConsent.ts`
- Create: `src/hooks/useCookieConsent.test.ts`

**Step 1: Write the failing tests**

Create `src/hooks/useCookieConsent.test.ts`:

```typescript
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
```

**Step 2: Run tests to confirm they fail**

```bash
yarn vitest src/hooks/useCookieConsent.test.ts
```

Expected: FAIL — `useCookieConsent` not found.

**Step 3: Implement the hook**

Create `src/hooks/useCookieConsent.ts`:

```typescript
import { useState } from 'react';

type CookieConsent = 'accepted' | 'rejected' | null;

const STORAGE_KEY = 'piggy_pulse_cookie_consent';

function readConsent(): CookieConsent {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'accepted' || stored === 'rejected') return stored;
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
```

**Step 4: Run tests to confirm they pass**

```bash
yarn vitest src/hooks/useCookieConsent.test.ts
```

Expected: all 6 tests PASS.

**Step 5: Commit**

```bash
git add src/hooks/useCookieConsent.ts src/hooks/useCookieConsent.test.ts
git commit -m "feat(cookie-banner): add useCookieConsent hook with localStorage persistence"
```

---

### Task 3: Implement `CookieBanner` component

**Files:**
- Create: `src/components/CookieBanner/CookieBanner.tsx`
- Create: `src/components/CookieBanner/CookieBanner.test.tsx`

**Step 1: Write the failing tests**

Create `src/components/CookieBanner/CookieBanner.test.tsx`:

```typescript
import { MantineProvider } from '@mantine/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    useCookieConsentMock.mockReturnValue({ consent: 'accepted', accept: mockAccept, reject: mockReject });
    renderBanner();
    expect(screen.queryByRole('region', { name: /cookie consent/i })).not.toBeInTheDocument();
  });

  it('does not render when consent is "rejected"', () => {
    useCookieConsentMock.mockReturnValue({ consent: 'rejected', accept: mockAccept, reject: mockReject });
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
```

**Step 2: Run tests to confirm they fail**

```bash
yarn vitest src/components/CookieBanner/CookieBanner.test.tsx
```

Expected: FAIL — `CookieBanner` not found.

**Step 3: Implement the component**

Create `src/components/CookieBanner/CookieBanner.tsx`:

```typescript
import { Button, Group, Paper, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useCookieConsent } from '@/hooks/useCookieConsent';

export function CookieBanner() {
  const { t } = useTranslation();
  const { consent, accept, reject } = useCookieConsent();

  if (consent !== null) return null;

  return (
    <Paper
      aria-label="Cookie consent"
      role="region"
      shadow="md"
      p="md"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        borderRadius: 0,
        borderTop: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Text size="sm" style={{ flex: 1, minWidth: 200 }}>
          {t('cookieBanner.message')}
        </Text>
        <Group gap="sm" wrap="nowrap">
          <Button variant="outline" size="sm" onClick={reject}>
            {t('cookieBanner.reject')}
          </Button>
          <Button variant="filled" size="sm" onClick={accept}>
            {t('cookieBanner.accept')}
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}
```

**Step 4: Run tests to confirm they pass**

```bash
yarn vitest src/components/CookieBanner/CookieBanner.test.tsx
```

Expected: all 5 tests PASS.

**Step 5: Commit**

```bash
git add src/components/CookieBanner/CookieBanner.tsx src/components/CookieBanner/CookieBanner.test.tsx
git commit -m "feat(cookie-banner): add CookieBanner component"
```

---

### Task 4: Mount banner in `App.tsx`

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add CookieBanner to App**

Edit `src/App.tsx` to import and render the banner:

```typescript
import { ErrorBoundary } from './components/ErrorBoundary';
import { CookieBanner } from './components/CookieBanner/CookieBanner';
import { Router } from './Router';

import './global.css';

export default function App() {
  return (
    <ErrorBoundary>
      <Router />
      <CookieBanner />
    </ErrorBoundary>
  );
}
```

**Step 2: Run full test suite**

```bash
yarn test
```

Expected: all tests pass, no type errors, no lint errors.

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat(cookie-banner): mount CookieBanner in App"
```

---

### Task 5: Handle mobile bottom nav offset

**Files:**
- Modify: `src/components/CookieBanner/CookieBanner.tsx`

The app renders a bottom navigation bar (~60px) on mobile. The banner needs to sit above it on small screens.

**Step 1: Add mobile offset using Mantine theme breakpoint**

Update `CookieBanner.tsx` to use `useMantineTheme` and `useMediaQuery`:

```typescript
import { Button, Group, Paper, Text, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { useCookieConsent } from '@/hooks/useCookieConsent';

const BOTTOM_NAV_HEIGHT = 60;

export function CookieBanner() {
  const { t } = useTranslation();
  const { consent, accept, reject } = useCookieConsent();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  if (consent !== null) return null;

  return (
    <Paper
      aria-label="Cookie consent"
      role="region"
      shadow="md"
      p="md"
      style={{
        position: 'fixed',
        bottom: isMobile ? BOTTOM_NAV_HEIGHT : 0,
        left: 0,
        right: 0,
        zIndex: 200,
        borderRadius: 0,
        borderTop: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Text size="sm" style={{ flex: 1, minWidth: 200 }}>
          {t('cookieBanner.message')}
        </Text>
        <Group gap="sm" wrap="nowrap">
          <Button variant="outline" size="sm" onClick={reject}>
            {t('cookieBanner.reject')}
          </Button>
          <Button variant="filled" size="sm" onClick={accept}>
            {t('cookieBanner.accept')}
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}
```

**Step 2: Run full test suite**

```bash
yarn test
```

Expected: all tests pass.

**Step 3: Commit**

```bash
git add src/components/CookieBanner/CookieBanner.tsx
git commit -m "feat(cookie-banner): offset banner above mobile bottom nav"
```

---

### Task 6: Push branch and open draft PR

**Step 1: Push branch**

```bash
git push -u origin feat/cookie-banner
```

**Step 2: Open draft PR**

```bash
gh pr create --draft --title "feat: add GDPR cookie consent banner" --body "$(cat <<'EOF'
## Summary

- Adds a fixed bottom cookie consent banner shown to users who haven't made a choice yet
- `useCookieConsent` hook persists accept/reject to `localStorage` under `piggy_pulse_cookie_consent`
- Banner sits above the mobile bottom nav bar
- Fully internationalised (en + pt)
- No backend involvement; strictly necessary auth cookies are exempt from consent

## Test plan

- [ ] Open the app in a fresh browser profile (or clear localStorage) — banner appears
- [ ] Click **Accept** — banner disappears, `localStorage` key is `accepted`
- [ ] Reload page — banner does not reappear
- [ ] Clear localStorage, click **Reject** — banner disappears, key is `rejected`
- [ ] Verify banner sits above bottom nav on a mobile viewport
- [ ] Verify Portuguese translations appear when locale is `pt`
- [ ] `yarn test` passes
EOF
)"
```
