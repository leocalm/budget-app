# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal finance management web application built with React, Vite, Mantine UI, and TypeScript. The app provides budget tracking, transaction management, and financial insights with a focus on mobile-responsive design.

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
yarn vitest              # Run tests once
yarn vitest:watch        # Run tests in watch mode
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

### API Communication Layer

The app uses a centralized HTTP client (`src/api/client.ts`) that automatically transforms case conventions:
- **Frontend → Backend**: Converts camelCase to snake_case for all outgoing payloads
- **Backend → Frontend**: Converts snake_case to camelCase for all incoming responses

All API calls should use the provided helper functions (`apiGet`, `apiPost`, `apiPut`, `apiDelete`) instead of raw `fetch`.

### State Management

- **React Query** (`@tanstack/react-query`) for server state management
  - All API hooks are in `src/hooks/` (e.g., `useCategories`, `useTransactions`, `useBudget`)
  - Mutations automatically invalidate relevant queries for cache synchronization
  - Query keys follow a convention: `['categories']`, `['budgetedCategories']`, `['unbudgetedCategories']`

- **Context API** for global client state:
  - `BudgetContext` manages selected budget period ID (stored in localStorage)
  - Use `useBudgetPeriodSelection()` to access/update selected period

### Routing Structure

Routes are defined in `src/Router.tsx`:
- Main app routes wrapped in `Layout` component (provides AppShell + BudgetProvider)
- Auth routes (`/auth/*`) use separate `AuthLayout`
- Primary routes: `/dashboard`, `/transactions`, `/accounts`, `/categories`, `/budget`, `/reports`, `/settings`
- Detail routes: `/accounts/:id`, `/categories/:id`

### Component Organization

Components are organized by feature:
- **Accounts**: Account management, detail pages, cards, tables
- **Budget**: Budget configuration, category allocation, period selection
- **Categories**: Category CRUD, detail pages, budgeted vs unbudgeted views
- **Dashboard**: Overview cards, charts, recent activity
- **Transactions**: Transaction list/table, forms, filters, stats
- **Layout**: Sidebar, navigation, responsive header, bottom navigation (mobile)
- **Auth**: Login, register, forgot password pages
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
- **PostCSS** with `postcss-preset-mantine` for CSS processing
- **CSS Modules** available (e.g., `Budget.module.css`, `Dashboard.module.css`)
- Global styles in `src/global.css`

## Type System

TypeScript types are organized in `src/types/`:
- `account.ts`: Account types and currency response
- `category.ts`: Category types (Incoming, Outgoing, Transfer)
- `transaction.ts`: Transaction types and responses
- `budget.ts`: Budget period and budgeted category types
- `dashboard.ts`: Dashboard-specific aggregations
- `vendor.ts`: Vendor data types

## Backend API Proxy

Vite dev server proxies `/api` requests to `http://localhost:8000` (configured in `vite.config.mjs`). Ensure the backend is running on port 8000 during development.

## Path Aliases

The project uses `@/` as an alias for `src/`:
```typescript
import { useCategories } from '@/hooks/useCategories';
import { BudgetContext } from '@/context/BudgetContext';
```

## Design Resources

### Vendors Page Implementation

The `redesign/vendors/` directory contains comprehensive documentation and design specifications for creating a vendors management page:
- **Implementation guides**: Step-by-step guides for both desktop and mobile implementations
- **Design specifications**: HTML mockups and visual references for the vendors page
- **Documentation index**: `DOCUMENTATION_INDEX.md` provides an overview of all available resources
- **Quick reference**: `QUICK_REFERENCE.md` for rapid implementation guidance

When implementing vendors-related features, refer to this directory for design patterns, component specifications, and implementation details.
