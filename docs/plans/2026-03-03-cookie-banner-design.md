# Cookie Banner Design

**Date:** 2026-03-03
**Status:** Approved

## Context

PiggyPulse needs a GDPR-compliant cookie consent banner. Auth cookies are strictly necessary (no consent required). No analytics are active yet, but the banner establishes the consent infrastructure for future tracking tools.

## Requirements

- Simple accept/reject all (no granular category controls)
- Consent stored in `localStorage` only (no backend)
- Works on auth pages and app pages
- Mobile-friendly: sits above the bottom navigation bar
- Internationalised (en + pt)

## Approach

Fixed bottom notification bar (Option A). Non-blocking — users can still interact with the app. Banner disappears permanently once a choice is made.

## Architecture

- Banner mounted in `App.tsx` (outside `Router`) so it appears on all pages
- `useCookieConsent` hook manages state: reads/writes `localStorage` key `piggy_pulse_cookie_consent` with value `"accepted"` or `"rejected"`; exposes `{ consent, accept, reject }`
- `CookieBanner` component renders nothing when `consent !== null`

## Components

| File | Purpose |
|------|---------|
| `src/hooks/useCookieConsent.ts` | Hook: read/write consent to localStorage |
| `src/components/CookieBanner/CookieBanner.tsx` | Fixed bottom bar UI |
| `src/locales/en.json` | English i18n keys |
| `src/locales/pt.json` | Portuguese i18n keys |

## UI

- Mantine `Paper` + `Group` layout, fixed bottom, full width, high z-index
- Mobile: `marginBottom` accounts for bottom nav (~60px)
- Two buttons: primary "Accept", outline "Reject"
- Text: "We use cookies to improve your experience. By accepting, you consent to analytics cookies."

## Testing

- Unit tests for `useCookieConsent`: null initial state, accept/reject persist to localStorage, banner hidden after choice
- Component tests: renders when consent is null, hidden after choice, buttons trigger correct handler
