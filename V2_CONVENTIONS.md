# V2 Redesign Conventions

> **For agents:** Read this document in full before implementing any v2 page or component. These conventions are mandatory and must be followed exactly.

---

## 1. Co-existence Strategy

New v2 pages live alongside the existing app. The current app must never break.

### Routing

- New pages are registered in `src/Router.tsx` at **the same routes** as existing pages, replacing the old lazy import with the new one only when the page is fully ready.
- During development, new pages can be mounted at `/v2/<route>` (e.g., `/v2/dashboard`) for testing without disrupting the live app.
- Once validated, swap the route's component to the new one and delete the old page + its components.

### File Layout

```
src/
  pages/
    Dashboard.page.tsx          ← existing (untouched)
    v2/
      Dashboard.page.tsx        ← new v2 page (thin shell)
  components/
    Dashboard/                  ← existing (untouched)
    v2/
      Dashboard/                ← new v2 feature folder
        index.ts
        DashboardPage.tsx
        DashboardHeader.tsx
        BudgetPerDayCard.tsx
        ...
  hooks/
    useDashboard.ts             ← existing (untouched)
    v2/
      useDashboard.ts           ← new typed hooks (already created)
  api/
    client.ts                   ← existing (untouched)
    v2client.ts                 ← new openapi-fetch client (already created)
```

### Rules

- **Never modify existing v1 files** when building v2 pages.
- New pages import exclusively from `@/hooks/v2`, `@/api/v2client`, and `@/components/v2/*`.
- Shared utilities (`CurrencyValue`, `IconPicker`, `StateRenderer`, etc.) from `@/components/Utils/` are fine to reuse.
- Shared contexts (`BudgetContext`, `AuthContext`) are fine to reuse.

---

## 2. Component Structure

### Feature Folder Pattern

Every page gets a feature folder under `src/components/v2/`. Structure:

```
src/components/v2/Dashboard/
  index.ts                      ← barrel export (all public components)
  DashboardPage.tsx             ← page shell: layout, data fetching, responsive switching
  DashboardHeader.tsx           ← section component
  BudgetPerDayCard.tsx          ← presentational card
  BudgetPerDayCard.story.tsx    ← storybook story
  BudgetPerDayCard.test.tsx     ← unit test (if logic-heavy)
  SpentPerCategoryChart.tsx     ← chart component
  SpentPerCategoryChart.story.tsx
  ...
```

### Size Limits

- **No single `.tsx` file should exceed ~150 lines.** If it does, split it.
- Page components (`*Page.tsx`) should only handle:
  - Data fetching (hooks)
  - Layout composition (arranging sections/cards)
  - Responsive breakpoint switching
- Presentational components receive data as props and render UI.

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Page shell | `FeaturePage.tsx` | `DashboardPage.tsx` |
| Section | `FeatureSection.tsx` | `DashboardHeader.tsx` |
| Card/Widget | `DescriptiveNameCard.tsx` | `BudgetPerDayCard.tsx` |
| Chart | `DescriptiveNameChart.tsx` | `SpentPerCategoryChart.tsx` |
| Modal | `DescriptiveNameModal.tsx` | `TransactionFormModal.tsx` |
| Table | `DescriptiveNameTable.tsx` | `TransactionTable.tsx` |
| Form | `DescriptiveNameForm.tsx` | `AccountForm.tsx` |

### Barrel Exports

Every feature folder must have an `index.ts` with explicit named exports:

```typescript
export { DashboardPage } from './DashboardPage';
export { BudgetPerDayCard } from './BudgetPerDayCard';
// ... all public components
```

---

## 3. Storybook

Every presentational component **must** have a `.story.tsx` file. Page-level components should also have stories showing full-page states.

### Story File Template

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'v2/FeatureName/MyComponent',     // Always prefix with v2/
  component: MyComponent,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    // Required props with realistic mock data
  },
};

export const Loading: Story = {
  // Show loading/skeleton state
};

export const Empty: Story = {
  // Show empty state
};

export const Error: Story = {
  // Show error state
};
```

### Story Conventions

- **Title prefix**: All v2 stories use `v2/FeatureName/ComponentName`.
- **Variants**: Every component must have at minimum: `Default`, `Loading`, `Empty`, `Error` (where applicable).
- **Full-screen pages**: Use `parameters: { layout: 'fullscreen' }` and `createStoryDecorator({ padding: false })`.
- **MSW mocking**: Use `mswHandlers.success()`, `mswHandlers.error()`, `mswHandlers.loading()`, `mswHandlers.empty()` for API-dependent stories.
- **Mobile variants**: Add `Mobile` story variants using Storybook viewport parameters:
  ```typescript
  export const Mobile: Story = {
    parameters: {
      viewport: { defaultViewport: 'mobile1' },
    },
  };
  ```
- **Decorator options**:
  - `createStoryDecorator()` — default (QueryClient + BudgetProvider + padding)
  - `createStoryDecorator({ withAuthProvider: 'authenticated' })` — includes mock auth
  - `createStoryDecorator({ padding: false })` — for full-screen page stories

---

## 4. Testing

### Unit Tests (Vitest)

Co-located `.test.tsx` files for components with non-trivial logic (conditional rendering, state management, calculations).

```typescript
import { render, screen } from '@testing-library/react';
import { BudgetPerDayCard } from './BudgetPerDayCard';

describe('BudgetPerDayCard', () => {
  it('renders the daily budget amount', () => {
    render(<BudgetPerDayCard budget={5000} currency="USD" />);
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

Every page must have a Playwright spec covering the full user flow.

#### File Structure

```
tests/
  e2e/
    v2/
      dashboard.spec.ts         ← full flow tests
  pages/
    v2/
      dashboard.page.ts         ← page object
```

#### Page Object Pattern

```typescript
import { expect, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class DashboardV2Page extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/v2/dashboard');
  }

  async expectHeaderVisible() {
    await expect(this.page.getByTestId('dashboard-header')).toBeVisible();
  }
}
```

#### Spec Pattern

```typescript
import { expect, test } from '../../fixtures/auth.fixture';
import { DashboardV2Page } from '../../pages/v2/dashboard.page';

test.describe('Dashboard V2', () => {
  test('displays budget overview for current period', async ({ authenticatedPage }) => {
    const dashboard = new DashboardV2Page(authenticatedPage);
    await dashboard.goto();
    await dashboard.expectHeaderVisible();
  });
});
```

#### E2E Test Requirements

- Use `authenticatedPage` fixture for logged-in tests.
- Mock API responses via `page.route()` — never depend on a running backend.
- Test both desktop and mobile viewports (use `test.describe` blocks or separate spec files).
- Test loading states, error states, empty states, and happy paths.
- Use `data-testid` attributes on key interactive and structural elements.

---

## 5. API Mocking from OpenAPI Spec

The v2 hooks use typed paths from `src/api/v2.d.ts`. Mock data for stories and tests must be type-safe.

### Type-Safe Mock Data

Import response types from the generated spec:

```typescript
import type { components } from '@/api/v2';

// Use schema types for mock data
const mockAccount: components['schemas']['AccountResponse'] = {
  id: '1',
  name: 'Checking',
  // ... all required fields
};
```

### MSW Handlers for v2

Create v2-specific handlers in `src/mocks/v2/handlers.ts` using the v2 API paths (no `/v1` prefix — the openapi-fetch client adds the base URL):

```typescript
import { http, HttpResponse, delay } from 'msw';

// Path matches what the browser actually requests (baseUrl + path from spec)
export const dashboardHandlers = [
  http.get('*/api/v1/dashboard/current-period*', async ({ request }) => {
    return HttpResponse.json(mockCurrentPeriodData);
  }),
];
```

### Storybook MSW Integration

Per-story handler overrides:

```typescript
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        mswHandlers.loading('*/api/v1/dashboard/current-period*'),
      ],
    },
  },
};
```

---

## 6. Responsive Design

Every page is built responsive from the start — desktop and mobile in a single pass.

### Breakpoint Strategy

Use Mantine's `useMediaQuery` with the `sm` breakpoint (existing convention):

```typescript
import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

const theme = useMantineTheme();
const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
```

### Layout Pattern

```typescript
export function DashboardPage() {
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <Stack>
      <DashboardHeader />
      {isMobile ? (
        <MobileDashboardLayout ... />
      ) : (
        <DesktopDashboardLayout ... />
      )}
    </Stack>
  );
}
```

### Storybook Viewport Stories

Every page story should have both Desktop and Mobile variants to visually verify both layouts.

---

## 7. Data Test IDs

Use `data-testid` on structural and interactive elements for Playwright selectors.

### Naming Convention

```
data-testid="feature-element-qualifier"
```

Examples:
- `data-testid="dashboard-header"`
- `data-testid="dashboard-budget-per-day-card"`
- `data-testid="transaction-form-submit"`
- `data-testid="account-card-checking"` (dynamic qualifier)

---

## 8. Design Token Usage

- **Colors**: Use Mantine theme colors (`theme.colors.cyan[5]`), never hardcoded hex.
- **Currency display**: Always use `<CurrencyValue />` from `@/components/Utils/CurrencyValue.tsx`. Never format currency manually.
- **No judgmental colors**: Never use green/red to indicate good/bad financial states. PiggyPulse is non-judgmental.
- **Spacing**: Use Mantine spacing scale (`xs`, `sm`, `md`, `lg`, `xl`).

---

## 9. Checklist Before Submitting a Page

Before opening a PR for a v2 page, verify:

- [ ] Feature folder exists under `src/components/v2/` with `index.ts` barrel
- [ ] No `.tsx` file exceeds ~150 lines
- [ ] Page component only fetches data and composes layout
- [ ] All presentational components have `.story.tsx` files
- [ ] Stories include: Default, Loading, Empty, Error, Mobile variants
- [ ] Page has a Playwright spec with page object covering happy path + error states
- [ ] Mock data uses types from `components['schemas']`
- [ ] All interactive/structural elements have `data-testid`
- [ ] Responsive layout works at both desktop and mobile breakpoints
- [ ] `yarn tsc --noEmit` passes
- [ ] `yarn vitest` passes
- [ ] `yarn prettier:write` applied
- [ ] No `console.log` statements
- [ ] Currency values use `<CurrencyValue />`
- [ ] No green/red judgmental color coding
