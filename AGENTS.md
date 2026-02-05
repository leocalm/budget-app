# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Backend API Proxy

Vite dev server proxies `/api` requests to `http://localhost:8000` (configured in `vite.config.mjs`). Ensure the backend
is running on port 8000 during development.

## Path Aliases

The project uses `@/` as an alias for `src/`:

```typescript
import {useCategories} from '@/hooks/useCategories';
import {BudgetContext} from '@/context/BudgetContext';
```

## Design Resources

### Vendors Page Implementation

The `redesign/vendors/` directory contains comprehensive documentation and design specifications for creating a vendors
management page:

- **Implementation guides**: Step-by-step guides for both desktop and mobile implementations
- **Design specifications**: HTML mockups and visual references for the vendors page
- **Documentation index**: `DOCUMENTATION_INDEX.md` provides an overview of all available resources
- **Quick reference**: `QUICK_REFERENCE.md` for rapid implementation guidance

When implementing vendors-related features, refer to this directory for design patterns, component specifications, and
implementation details.

## Code Quality Guidelines

### Debugging and Logging

**IMPORTANT**: Never commit code with `console.log`, `console.warn`, `console.debug`, or similar debugging statements.

- ✅ **Allowed**: `console.error()` for actual error handling in catch blocks
- ❌ **Not Allowed**: `console.log()` for debugging or development purposes
- ❌ **Not Allowed**: Commented-out `console.log()` statements

**Exception**: The only acceptable use of console logging is `console.error()` in error handling scenarios where errors
should be logged for debugging production issues (e.g., silent failures in logout, corrupted data handling).

**Before pushing**:

1. Search your changes for `console.log`
2. Remove all debugging statements
3. Ensure only intentional `console.error()` calls remain with clear comments explaining why

### General Best Practices

- Always run `yarn prettier:write` before committing
- Always run `npm run test` before committing
- Run `yarn typecheck` to ensure type safety
- Use TypeScript types instead of `any` whenever possible
- Follow existing patterns and conventions in the codebase
- Write descriptive commit messages
- Keep components focused and single-responsibility
