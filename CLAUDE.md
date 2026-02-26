# CLAUDE.md

## Critical: Before Committing

Always run the full CI check suite locally before committing or pushing:

```bash
yarn prettier:write      # Format all files
yarn typecheck           # TypeScript type checking
yarn lint                # ESLint + Stylelint
yarn test                # Full test suite (typecheck + prettier + lint + vitest + build)
```

Also search your changes for `console.log` and remove all debugging statements before committing.

## Critical: File and Code Operations

Always use **Serena MCP tools** (`find_symbol`, `replace_symbol_body`, `search_for_pattern`, `get_symbols_overview`, etc.) for reading and editing source files. Prefer symbolic operations over raw file reads/writes.

## Critical: Branching and Pull Requests

**Direct commits to `main` are not allowed.** All changes must go through a pull request.

- Always create a feature branch for new work: `git checkout -b <type>/<short-description>`
- Push the branch and open a PR against `main`
- Never attempt to push directly to `main`

## Critical: No Assumptions

**Never assume anything.** If requirements, intent, or context are unclear, ask before proceeding. It is always better to ask a clarifying question than to make a wrong assumption and do work that needs to be undone.

---

## Project Overview

A personal finance management web application built with React, Vite, Mantine UI, and TypeScript. The app provides
budget tracking, transaction management, and financial insights with a focus on mobile-responsive design.

## Development Commands

**Development Server:**

```bash
yarn dev
```

**Build:**

```bash
yarn build
```

**Testing:**

```bash
yarn vitest              # Run unit tests once
yarn vitest:watch        # Run unit tests in watch mode
yarn vitest:storybook    # Run Storybook tests (browser-based)
yarn test                # Full test suite (typecheck + prettier + lint + vitest + build)
```

**Code Quality:**

```bash
yarn typecheck           # TypeScript type checking
yarn lint                # Run eslint + stylelint
yarn eslint              # ESLint only
yarn stylelint           # Stylelint only
yarn prettier            # Check formatting
yarn prettier:write      # Format all files
```

**Storybook:**

```bash
yarn storybook           # Start Storybook dev server on port 6006
yarn storybook:build     # Build static Storybook
```

## Architecture

### Authentication

The app implements cookie-based authentication with client-side state management:

- **Backend API**:
    - Login: `POST /api/users/login` with `{email, password}`
    - Logout: `POST /api/users/logout`
    - Backend returns HttpOnly cookies automatically handled by the browser
- **Client State**: `AuthContext` (`src/context/AuthContext.tsx`) manages authentication state
    - Stores user info in localStorage (remember me) or sessionStorage
    - Provides `useAuth()` hook for accessing auth state:
      `{ user, isAuthenticated, isLoading, login, logout, refreshUser }`
    - `refreshUser` re-fetches the current user from the backend and updates storage; returns `false`
      on failure and optionally shows a toast notification
- **Route Protection**: `ProtectedRoute` component guards all authenticated pages
    - Redirects unauthenticated users to `/auth/login`
    - Preserves original URL for post-login redirect
    - Shows loading spinner while checking auth status
- **Automatic 401 handling**: The API client (`src/api/client.ts`) intercepts 401 responses globally —
    clears stored user data and redirects to `/auth/login`. The redirect is suppressed on login
    requests and when already on an `/auth` route to prevent redirect loops.
- **Auth API**: Functions in `src/api/auth.ts` handle login/logout with structured `ApiError`-based
    error handling

### API Communication Layer

The app uses a centralized HTTP client (`src/api/client.ts`) that automatically transforms case conventions:

- **Frontend → Backend**: Converts camelCase to snake_case for all outgoing payloads
- **Backend → Frontend**: Converts snake_case to camelCase for all incoming responses
- **Credentials**: All requests include `credentials: 'include'` for cookie-based authentication

All API calls should use the provided helper functions (`apiGet`, `apiPost`, `apiPut`, `apiDelete`) instead of raw
`fetch`.

### Error Handling

Errors from the API are surfaced as `ApiError` instances (`src/api/errors.ts`), which extend `Error` and carry
structured metadata:

- `status` — HTTP status code
- `url` — the request URL that failed
- `data` — the parsed (camelCased) response body, if any
- Convenience getters: `isUnauthorized` (401), `isNotFound` (404), `isValidationError` (400 / 422)

The client extracts error messages from the response body (`message` field or plain text) before throwing.
Catch blocks should check `instanceof ApiError` first for structured handling, then fall back to generic `Error`
for network failures (e.g. `Failed to fetch`).

The `navigation` object is exported from `client.ts` so that `window.location.assign` calls can be stubbed in tests.

### State Management

- **React Query** (`@tanstack/react-query`) for server state management
    - All API hooks are in `src/hooks/` (e.g., `useCategories`, `useTransactions`, `useBudget`)
    - Mutations automatically invalidate relevant queries for cache synchronization
    - Query keys are centralized in `src/hooks/queryKeys.ts` — always import and use the `queryKeys`
      object rather than writing key arrays by hand. Available keys:
        - `queryKeys.vendors()`, `queryKeys.vendor(id)`
        - `queryKeys.transactions(periodId)`, `queryKeys.transaction(id)`
        - `queryKeys.categories()`, `queryKeys.category(id)`
        - `queryKeys.budgetedCategories()`, `queryKeys.unbudgetedCategories()`
        - `queryKeys.accounts()`, `queryKeys.account(id)`
        - `queryKeys.budget()`, `queryKeys.budgets()`
        - `queryKeys.budgetPeriods.list()`, `queryKeys.budgetPeriods.current()`
        - `queryKeys.dashboardData(periodId)`, `queryKeys.spentPerCategory()`,
          `queryKeys.monthlyBurnIn()`, `queryKeys.monthProgress()`, `queryKeys.budgetPerDay()`

- **Context API** for global client state:
    - `AuthContext` manages authentication state and user info
        - Use `useAuth()` to access: `{ user, isAuthenticated, isLoading, login, logout, refreshUser }`
    - `BudgetContext` manages selected budget period ID (stored in localStorage)
        - Use `useBudgetPeriodSelection()` to access/update selected period

### Routing Structure

Routes are defined in `src/Router.tsx`:

- Entire app wrapped in `AuthProvider` for authentication state
- Main app routes wrapped in `ProtectedRoute` → `Layout` (provides auth guard + AppShell + BudgetProvider)
- Auth routes (`/auth/*`) use separate `AuthLayout` (public, no authentication required)
- Primary routes: `/dashboard`, `/transactions`, `/accounts`, `/categories`, `/vendors`, `/budget`,
  `/reports`, `/settings`
- Detail routes: `/accounts/:id`, `/categories/:id`
- Placeholder routes (not yet implemented): `/goals`, `/recurring`, `/help`, `/more`

### Component Organization

Components are organized by feature:

- **Accounts**: Account management, detail pages, cards, tables
- **Budget**: Budget configuration, category allocation, period selection
- **BudgetPeriodSelector**: Standalone period-selection dropdown
- **Categories**: Category CRUD, detail pages, budgeted vs unbudgeted views
- **ColorSchemeToggle**: Light/dark mode toggle
- **Dashboard**: Overview cards, charts, recent activity
- **Transactions**: Transaction list/table, forms, filters, stats
- **Vendors**: Vendor CRUD, cards, modals, delete-conflict handling
- **Layout**: Sidebar, navigation, responsive header, bottom navigation (mobile)
- **Auth**: Login, register, forgot password, route protection (`ProtectedRoute`)
- **Reports**: Reports page (placeholder)
- **Settings**: Settings page
- **Utils**: Reusable utilities like CurrencyValue, IconPicker

### Responsive Design

The app implements desktop and mobile layouts:

- **Desktop**: Fixed sidebar navigation
- **Mobile**: Top header with burger menu + bottom navigation bar
- Uses Mantine's `useMediaQuery` with breakpoint `sm` to switch layouts
- Mobile-specific components: `MobileTransactionCard`, `BottomNavigation`

### Internationalization

- Uses `react-i18next` for i18n
- Translations stored in `src/locales/en.json` and `src/locales/pt.json`
- Access translations with `useTranslation()` hook: `const { t } = useTranslation()`

### Styling

- **Mantine v8** UI component library with custom theme in `src/theme.ts`
- Full **light and dark theme** support; custom palettes for both are defined in `theme.ts` under
  the `dark` and `light` color arrays. Primary color is `cyan` (shade 5). Toggled via
  `ColorSchemeToggle`.
- **PostCSS** with `postcss-preset-mantine` for CSS processing
- **CSS Modules** available (e.g., `Budget.module.css`, `Dashboard.module.css`)
- Global styles in `src/global.css`

## Type System

TypeScript types are organized in `src/types/`:

- `account.ts`: Account types (`AccountResponse`, `AccountRequest`) and `CurrencyResponse`
- `category.ts`: Category types (Incoming, Outgoing, Transfer)
- `transaction.ts`: Transaction types and responses; `TransactionRequest` requires `vendorId`
- `budget.ts`: Budget period and budgeted category types
- `dashboard.ts`: Dashboard-specific aggregations (`SpentPerCategory`, `MonthlyBurnIn`, etc.)
- `vendor.ts`: `Vendor`, `VendorInput`, `VendorWithStats`, and `VendorDeleteError` (409 conflict shape)
- `money.ts`: `Money` class — wraps amounts stored in the smallest currency unit (e.g. cents) and
  provides `toDisplay()`, `format(locale)`, and a `Money.fromDisplay()` factory. Use this whenever
  converting between API values and UI display values to handle decimal places correctly.

## Constants

UI and validation constants are centralized in `src/constants/index.ts` under the `UI` object.
Use these instead of magic numbers:

- `UI.RECENT_VENDORS_LIMIT` — max recent vendors shown (4)
- `UI.FOCUS_DELAY_MS` — delay before programmatic focus (100 ms)
- `UI.DESCRIPTION_MAX_LENGTH` — max transaction description length (255)
- `UI.DASHBOARD_TOP_CATEGORIES` — number of top categories shown on dashboard (5)

## Docker Deployment

### Full Stack Setup

The application can be run with Docker Compose, which orchestrates the frontend, backend, database, and reverse proxy:

```bash
docker-compose up -d
docker-compose ps
docker-compose logs -f [service]
docker-compose down
```

**Services:**
- `frontend` - React app served via Nginx (port 80 internal)
- `backend` - Rust/Rocket API (port 8000 internal)
- `db` - PostgreSQL 17 database (port 5432 internal)
- `caddy` - Caddy reverse proxy (ports 80/443 exposed)

**Access:**
- Application: `http://localhost`
- API: `http://localhost/api/*`
- Health check: `http://localhost/health`

### Important Configuration Notes

**Environment Variables:**
The backend uses Rocket's environment variable system. Always use `ROCKET_` prefix for Rocket configuration:
- `ROCKET_ADDRESS=0.0.0.0` - **CRITICAL**: Must bind to 0.0.0.0 for inter-container communication
- `ROCKET_PORT=8000` - Backend listening port
- `ROCKET_SECRET_KEY` - Session encryption key (required)

**Database Configuration:**
- Environment variables use double underscores for nesting: `PIGGY_PULSE__DATABASE__URL`, `PIGGY_PULSE__DATABASE__MAX_CONNECTIONS`
- Configuration priority: Environment variables → `PiggyPulse.toml` → defaults
- Database host must be `db` (Docker service name), not `localhost`

**Common Issues:**
1. **502 Bad Gateway from Caddy**: Backend is likely binding to `127.0.0.1` instead of `0.0.0.0`
   - Fix: Ensure `ROCKET_ADDRESS=0.0.0.0` is set
   - Verify in logs: Should show "Rocket has launched from http://0.0.0.0:8000"

2. **Database Connection Timeout**:
   - Check PiggyPulse.toml has correct database URL: `postgres://postgres:example@db:5432/piggy_pulse_db`
   - Verify network connectivity: `docker-compose exec backend curl http://db:5432`

3. **Migrations Not Applied**:
   ```bash
   docker-compose exec -T backend cat /app/migrations/0001_init/up.sql | \
     docker-compose exec -T db psql -U postgres -d piggy_pulse_db
   ```

### Test User

- **Email**: `demo@example.com`
- **Password**: `SuperSecurePassword2024xyz`

## Backend API Proxy

Vite dev server proxies `/api` requests to `http://localhost:8000` (configured in `vite.config.mjs`). Ensure the backend
is running on port 8000 during development.

## Path Aliases

The project uses `@/` as an alias for `src/`:

```typescript
import { useCategories } from '@/hooks/useCategories';
import { BudgetContext } from '@/context/BudgetContext';
```

## Design Resources

The `redesign/vendors/` directory contains documentation and design specifications for the vendors management page:

- **Implementation guides**: Step-by-step guides for desktop and mobile implementations
- **Design specifications**: HTML mockups and visual references
- **Documentation index**: `DOCUMENTATION_INDEX.md`
- **Quick reference**: `QUICK_REFERENCE.md`

## Code Quality Guidelines

### Debugging and Logging

**Never commit code with `console.log`, `console.warn`, `console.debug`, or similar debugging statements.**

- ✅ **Allowed**: `console.error()` for actual error handling in catch blocks
- ❌ **Not Allowed**: `console.log()` for debugging or development purposes
- ❌ **Not Allowed**: Commented-out `console.log()` statements

### General Best Practices

- Use TypeScript types instead of `any` whenever possible
- Follow existing patterns and conventions in the codebase
- Keep components focused and single-responsibility
- Always use `src/components/Utils/CurrencyValue.tsx` to render monetary values — never format currency manually

### Conventional Commits (Required)

Format:

- `type(scope)!: description`
- `type: description`

Allowed `type` values:

- `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`

Examples:

- `feat(ui): add mobile more menu drawer`
- `fix(auth)!: redirect on invalid session cookie`
- `docs: document local dev setup`

If CI fails on commit messages, rewrite history (for a branch PR):

- Reword commits: `git rebase -i origin/main` then change `pick` to `reword`
- Or squash to a single Conventional Commit
