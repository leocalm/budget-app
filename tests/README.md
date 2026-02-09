# E2E Tests (Playwright)

## Modes

- `mock`: frontend requests to `/api/*` are intercepted by Playwright route handlers.
- `real`: tests use a real backend API and create isolated users through registration endpoints.

Configure with `E2E_API_MODE=mock|real`.

## Targets

- `local`: starts Vite dev server from Playwright (`yarn dev`).
- `docker`: runs against Docker test stack (`https://localhost:18443` by default).

Configure with `E2E_TARGET=local|docker`.

## Main Commands

- `yarn e2e:local:mock`
- `yarn e2e:local:real`
- `yarn e2e:docker:mock`
- `yarn e2e:docker:real`

## Docker Lifecycle

- `yarn e2e:docker:up`
- `yarn e2e:docker:down`
- `yarn e2e:docker:reset`

## Environment

Defaults are loaded from `.env.test`.

Key variables:

- `E2E_API_MODE`
- `E2E_TARGET`
- `E2E_BASE_URL`
- `E2E_API_URL`
- `E2E_API_HEALTH_PATH`
- `E2E_REGISTER_ENDPOINTS`

## Writing New Tests

- Reuse fixtures from `tests/fixtures/auth.fixture.ts`.
- Reuse page objects from `tests/pages/`.
- Keep selectors semantic (`getByRole`, `getByLabel`) and use `data-testid` only where needed.
