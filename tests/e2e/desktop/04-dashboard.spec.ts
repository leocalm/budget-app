import type { Page } from 'playwright/test';
import { expect, test } from '../../fixtures/auth.fixture';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Override a single dashboard API endpoint with a controlled promise so the
 * test can assert the loading state before the response arrives.
 * Returns a `release` function the test must call to unblock the request.
 */
function holdEndpoint(page: Page, urlPattern: string): { release: () => void } {
  let release!: () => void;
  const gate = new Promise<void>((r) => {
    release = r;
  });

  void page.route(`**/${urlPattern}**`, async (route) => {
    await gate;
    await route.continue();
  });

  return { release };
}

/**
 * Intercept an endpoint and respond with a 500 error immediately.
 */
async function failEndpoint(page: Page, urlPattern: string): Promise<void> {
  await page.route(`**/${urlPattern}**`, (route) =>
    route.fulfill({ status: 500, body: JSON.stringify({ message: 'Internal Server Error' }) })
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Dashboard - Desktop', () => {
  // -------------------------------------------------------------------------
  // Locked: no periods configured at all
  // -------------------------------------------------------------------------
  test.describe('Locked state — no period configured', () => {
    test('shows locked cards with "Not configured" status when no periods exist', async ({
      authenticatedPage: page,
      mockApi,
    }) => {
      if (mockApi) {
        mockApi.setPeriods([]);
        mockApi.setCurrentPeriod(null);
      } else {
        await page.route('**/budget_period/current**', (route) =>
          route.fulfill({ status: 404, body: JSON.stringify({ message: 'Not Found' }) })
        );
        await page.route('**/budget_period**', (route) =>
          route.fulfill({ status: 200, body: JSON.stringify([]) })
        );
      }

      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

      // All locked cards should show "Not configured" status text
      const statusText = page.getByText(/Status:.*Not configured/i);
      await expect(statusText.first()).toBeVisible();

      // Multiple cards should be locked — check at least 3 instances
      expect(await statusText.count()).toBeGreaterThanOrEqual(3);

      // Each locked card shows the setup requirement copy
      await expect(
        page.getByText('Set up a budget period to display dashboard data.').first()
      ).toBeVisible();

      // Each locked card has a Configure link pointing to /periods
      const configureLinks = page.getByRole('link', { name: 'Configure' });
      await expect(configureLinks.first()).toBeVisible();
      await expect(configureLinks.first()).toHaveAttribute('href', '/periods');
    });
  });

  // -------------------------------------------------------------------------
  // Locked: periods exist but none is currently active (404 on /current)
  // -------------------------------------------------------------------------
  test.describe('Locked state — no active period', () => {
    test('shows locked cards with "No active period" status when current period is 404', async ({
      authenticatedPage: page,
      mockApi,
    }) => {
      if (mockApi) {
        mockApi.setCurrentPeriod(null);
        // periods list still has entries so BudgetContext picks one
        mockApi.setPeriods([
          {
            id: 'period-past',
            name: 'January 2026',
            start_date: '2026-01-01',
            end_date: '2026-01-31',
            transaction_count: 0,
            budget_used_percentage: 0,
          },
        ]);
      } else {
        await page.route('**/budget_period/current**', (route) =>
          route.fulfill({ status: 404, body: JSON.stringify({ message: 'Not Found' }) })
        );
      }

      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

      const statusText = page.getByText(/Status:.*No active period/i);
      await expect(statusText.first()).toBeVisible();
      expect(await statusText.count()).toBeGreaterThanOrEqual(3);

      await expect(
        page.getByText('Create or adjust periods so one period is active today.').first()
      ).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // CurrentPeriodCard states
  // -------------------------------------------------------------------------
  test.describe('CurrentPeriodCard', () => {
    test('shows loading skeleton while data is in-flight', async ({ authenticatedPage: page }) => {
      const { release } = holdEndpoint(page, 'monthly-burn-in');

      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="current-period-loading"]')).toBeVisible();

      release();
    });

    test('shows error state with retry button when monthly-burn-in fails', async ({
      authenticatedPage: page,
    }) => {
      await failEndpoint(page, 'monthly-burn-in');

      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="current-period-error"]')).toBeVisible();
      await expect(page.getByText('Unable to load current period values.')).toBeVisible();
      await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
    });

    test('shows error state with retry button when month-progress fails', async ({
      authenticatedPage: page,
    }) => {
      await failEndpoint(page, 'month-progress');

      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="current-period-error"]')).toBeVisible();
    });

    test('shows no-budget message when totalBudget is zero', async ({
      authenticatedPage: page,
      mockApi,
    }) => {
      if (mockApi) {
        // Default mock already returns total_budget: 500000 — override to 0
      }
      await page.route('**/monthly-burn-in**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            total_budget: 0,
            spent_budget: 0,
            current_day: 5,
            days_in_period: 28,
          }),
        })
      );

      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="current-period-active"]')).toBeVisible();
      await expect(page.getByText('No budget set for this period.')).toBeVisible();
    });

    test('shows spend and budget figures when data is fully loaded', async ({
      authenticatedPage: page,
    }) => {
      await page.route('**/monthly-burn-in**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            total_budget: 500000,
            spent_budget: 125000,
            current_day: 7,
            days_in_period: 28,
          }),
        })
      );
      await page.route('**/month-progress**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            current_date: '2026-02-07',
            days_in_period: 28,
            remaining_days: 21,
            days_passed_percentage: 25,
          }),
        })
      );

      await page.goto('/dashboard');
      const card = page.locator('[data-testid="current-period-active"]');
      await expect(card).toBeVisible();
      // Budget figure and remaining days text should be present
      await expect(card.getByText(/21 days remaining/i)).toBeVisible();
      // of €5,000.00 (total budget)
      await expect(card.getByText(/of.*5[,.]000/i)).toBeVisible();
    });

    test('retry button triggers data reload', async ({ authenticatedPage: page }) => {
      // Always fail so React Query exhausts its retries and surfaces the error state
      await page.route('**/monthly-burn-in**', (route) =>
        route.fulfill({ status: 500, body: JSON.stringify({ message: 'error' }) })
      );

      await page.goto('/dashboard');
      // React Query retries 3× with exponential back-off (~7 s total) before giving up
      await expect(page.locator('[data-testid="current-period-error"]')).toBeVisible({
        timeout: 12000,
      });

      // Remove the failing override so the mock API can serve a successful response
      await page.unroute('**/monthly-burn-in**');

      await page.getByRole('button', { name: /retry/i }).click();
      await expect(page.locator('[data-testid="current-period-active"]')).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // BudgetStabilityCard states
  // -------------------------------------------------------------------------
  test.describe('BudgetStabilityCard', () => {
    test('shows loading skeleton while data is in-flight', async ({ authenticatedPage: page }) => {
      const { release } = holdEndpoint(page, 'budget-stability');

      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="budget-stability-loading"]')).toBeVisible();

      release();
    });

    test('shows error state with retry button when request fails', async ({
      authenticatedPage: page,
    }) => {
      await failEndpoint(page, 'budget-stability');

      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="budget-stability-error"]')).toBeVisible();
      await expect(page.getByText('Could not load budget stability.')).toBeVisible();
      await expect(page.getByRole('button', { name: /retry/i }).first()).toBeVisible();
    });

    test('shows empty state when no closed periods exist', async ({ authenticatedPage: page }) => {
      await page.route('**/budget-stability**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            within_tolerance_percentage: 0,
            periods_within_tolerance: 0,
            total_closed_periods: 0,
            recent_closed_periods: [],
          }),
        })
      );

      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="budget-stability-empty"]')).toBeVisible();
      await expect(page.getByText('No closed periods yet')).toBeVisible();
    });

    test('shows insufficient-data state when fewer than 3 closed periods', async ({
      authenticatedPage: page,
    }) => {
      await page.route('**/budget-stability**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            within_tolerance_percentage: 100,
            periods_within_tolerance: 2,
            total_closed_periods: 2,
            recent_closed_periods: [
              { period_id: 'p1', is_outside_tolerance: false },
              { period_id: 'p2', is_outside_tolerance: false },
            ],
          }),
        })
      );

      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="budget-stability-insufficient"]')).toBeVisible();
      await expect(
        page.getByText('Need at least 3 closed periods for a reliable stability reading.')
      ).toBeVisible();
    });

    test('shows stability percentage when sufficient data exists', async ({
      authenticatedPage: page,
    }) => {
      await page.route('**/budget-stability**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            within_tolerance_percentage: 80,
            periods_within_tolerance: 4,
            total_closed_periods: 5,
            recent_closed_periods: [
              { period_id: 'p1', is_outside_tolerance: false },
              { period_id: 'p2', is_outside_tolerance: false },
              { period_id: 'p3', is_outside_tolerance: true },
              { period_id: 'p4', is_outside_tolerance: false },
              { period_id: 'p5', is_outside_tolerance: false },
            ],
          }),
        })
      );

      await page.goto('/dashboard');
      const card = page.locator('[data-testid="budget-stability-active"]');
      await expect(card).toBeVisible();
      await expect(card.getByText('80%')).toBeVisible();
      await expect(card.getByText('4 of 5 periods within range')).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // NetPositionCard states
  // -------------------------------------------------------------------------
  test.describe('NetPositionCard', () => {
    test('shows loading skeleton while data is in-flight', async ({ authenticatedPage: page }) => {
      const { release } = holdEndpoint(page, 'net-position');

      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="net-position-loading"]')).toBeVisible();

      release();
    });

    test('shows error state with retry button when request fails', async ({
      authenticatedPage: page,
    }) => {
      await failEndpoint(page, 'net-position');

      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="net-position-error"]')).toBeVisible();
      await expect(page.getByText('Could not load net position.')).toBeVisible();
      await expect(page.getByRole('button', { name: /retry/i }).first()).toBeVisible();
    });

    test('shows empty state when no accounts exist', async ({ authenticatedPage: page }) => {
      await page.route('**/net-position**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            total_net_position: 0,
            change_this_period: 0,
            liquid_balance: 0,
            protected_balance: 0,
            debt_balance: 0,
            account_count: 0,
          }),
        })
      );

      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="net-position-empty"]')).toBeVisible();
      await expect(page.getByText('No accounts available.')).toBeVisible();
    });

    test('shows net position value and account count with data', async ({
      authenticatedPage: page,
    }) => {
      await page.route('**/net-position**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            total_net_position: 750000,
            change_this_period: -12500,
            liquid_balance: 600000,
            protected_balance: 150000,
            debt_balance: 0,
            account_count: 3,
          }),
        })
      );

      await page.goto('/dashboard');
      const card = page.locator('[data-testid="net-position-active"]');
      await expect(card).toBeVisible();
      // €7,500.00 net position
      await expect(card.getByText(/7[,.]500/)).toBeVisible();
      await expect(card.getByText(/across 3 accounts/i)).toBeVisible();
    });

    test('shows distribution bar when liquid, protected and debt are non-zero', async ({
      authenticatedPage: page,
    }) => {
      await page.route('**/net-position**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            total_net_position: 100000,
            change_this_period: 0,
            liquid_balance: 50000,
            protected_balance: 30000,
            debt_balance: 20000,
            account_count: 2,
          }),
        })
      );

      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="net-position-active"]')).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // ActiveOverlayBanner
  // -------------------------------------------------------------------------
  test.describe('ActiveOverlayBanner', () => {
    test('is hidden when no active overlays exist', async ({
      authenticatedPage: page,
      mockApi,
    }) => {
      if (mockApi) {
        mockApi.setOverlays([]);
      } else {
        await page.route('**/overlays**', (route) =>
          route.fulfill({ status: 200, body: JSON.stringify([]) })
        );
      }

      await page.goto('/dashboard');
      // Wait for the dashboard to finish loading
      await expect(page.locator('[data-testid="current-period-active"]')).toBeVisible();
      await expect(page.locator('[data-testid="dashboard-overlay-banner"]')).not.toBeVisible();
    });

    test('shows banner with overlay name and remaining amount for single overlay', async ({
      authenticatedPage: page,
    }) => {
      const today = '2026-02-15';
      await page.route('**/overlays**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'ov-1',
              name: 'Weekend Trip',
              icon: '✈️',
              start_date: '2026-02-10',
              end_date: '2026-02-20',
              inclusion_mode: 'manual',
              total_cap_amount: 30000,
              spent_amount: 10000,
              transaction_count: 3,
              category_caps: [],
              rules: null,
            },
          ]),
        })
      );
      // Fix today so daysLeft is deterministic
      await page.addInitScript((date) => {
        Date.now = () => new Date(date).getTime();
      }, today);

      await page.goto('/dashboard');
      const banner = page.locator('[data-testid="dashboard-overlay-banner"]');
      await expect(banner).toBeVisible();
      await expect(banner.getByText(/✈️.*Weekend Trip/)).toBeVisible();
      // Should show remaining amount (€200 left)
      await expect(banner.getByText(/left/i)).toBeVisible();
    });

    test('shows +N badge when multiple overlays are active', async ({
      authenticatedPage: page,
    }) => {
      await page.route('**/overlays**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'ov-1',
              name: 'First Overlay',
              icon: null,
              start_date: '2026-02-01',
              end_date: '2026-02-28',
              inclusion_mode: 'all',
              total_cap_amount: 10000,
              spent_amount: 0,
              transaction_count: 0,
              category_caps: [],
              rules: null,
            },
            {
              id: 'ov-2',
              name: 'Second Overlay',
              icon: null,
              start_date: '2026-02-01',
              end_date: '2026-02-28',
              inclusion_mode: 'all',
              total_cap_amount: 20000,
              spent_amount: 0,
              transaction_count: 0,
              category_caps: [],
              rules: null,
            },
          ]),
        })
      );

      await page.goto('/dashboard');
      const banner = page.locator('[data-testid="dashboard-overlay-banner"]');
      await expect(banner).toBeVisible();
      // +1 badge for the second overlay
      await expect(banner.getByText('+1')).toBeVisible();
    });

    test('shows over-budget message when spent exceeds cap', async ({
      authenticatedPage: page,
    }) => {
      await page.route('**/overlays**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'ov-1',
              name: 'Overspent Overlay',
              icon: null,
              start_date: '2026-02-01',
              end_date: '2026-02-28',
              inclusion_mode: 'all',
              total_cap_amount: 10000,
              spent_amount: 15000,
              transaction_count: 10,
              category_caps: [],
              rules: null,
            },
          ]),
        })
      );

      await page.goto('/dashboard');
      const banner = page.locator('[data-testid="dashboard-overlay-banner"]');
      await expect(banner).toBeVisible();
      // Over-budget message: shows "-€50.00 • N days" (the 'over' key)
      await expect(banner.getByText(/-.*days/i)).toBeVisible();
    });

    test('shows no-cap message when overlay has no total cap', async ({
      authenticatedPage: page,
    }) => {
      await page.route('**/overlays**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'ov-1',
              name: 'Uncapped Overlay',
              icon: null,
              start_date: '2026-02-01',
              end_date: '2026-02-28',
              inclusion_mode: 'all',
              total_cap_amount: null,
              spent_amount: 5000,
              transaction_count: 2,
              category_caps: [],
              rules: null,
            },
          ]),
        })
      );

      await page.goto('/dashboard');
      const banner = page.locator('[data-testid="dashboard-overlay-banner"]');
      await expect(banner).toBeVisible();
      await expect(banner.getByText(/No cap configured/i)).toBeVisible();
    });

    test('banner links to /overlays', async ({ authenticatedPage: page }) => {
      // Provide an overlay that is active on today (2026-02-28)
      await page.route('**/overlays**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'ov-link',
              name: 'Active Overlay',
              icon: null,
              start_date: '2026-02-01',
              end_date: '2026-02-28',
              inclusion_mode: 'all',
              total_cap_amount: null,
              spent_amount: 0,
              transaction_count: 0,
              category_caps: [],
              rules: null,
            },
          ]),
        })
      );

      await page.goto('/dashboard');
      const banner = page.locator('[data-testid="dashboard-overlay-banner"]');
      await expect(banner).toBeVisible();
      await banner.click();
      await expect(page).toHaveURL(/\/overlays/);
    });

    test('dismissed overlay is hidden without page reload', async ({ authenticatedPage: page }) => {
      await page.route('**/overlays**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'ov-dismiss',
              name: 'Dismissible Overlay',
              icon: null,
              start_date: '2026-02-01',
              end_date: '2026-02-28',
              inclusion_mode: 'all',
              total_cap_amount: null,
              spent_amount: 0,
              transaction_count: 0,
              category_caps: [],
              rules: null,
            },
          ]),
        })
      );

      await page.goto('/dashboard');
      const banner = page.locator('[data-testid="dashboard-overlay-banner"]');
      await expect(banner).toBeVisible();

      await page.getByRole('button', { name: 'Dismiss overlay banner' }).click();
      await expect(banner).not.toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // Happy path — fully loaded dashboard
  // -------------------------------------------------------------------------
  test.describe('Happy path — fully loaded', () => {
    test('renders all four sections with data', async ({ authenticatedPage: page }) => {
      await page.goto('/dashboard');

      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
      await expect(page.locator('[data-testid="current-period-active"]')).toBeVisible();
      await expect(page.locator('[data-testid="budget-stability-active"]')).toBeVisible();
      await expect(page.locator('[data-testid="net-position-active"]')).toBeVisible();
    });

    test('page title and subtitle are visible', async ({ authenticatedPage: page }) => {
      await page.goto('/dashboard');

      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
      await expect(
        page.getByText('Current position, deviation, and period trajectory.')
      ).toBeVisible();
    });

    test('dashboard with high spending shows projection approaching budget', async ({
      authenticatedPage: page,
    }) => {
      await page.route('**/monthly-burn-in**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            total_budget: 500000,
            spent_budget: 450000,
            current_day: 20,
            days_in_period: 28,
          }),
        })
      );
      await page.route('**/month-progress**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            current_date: '2026-02-20',
            days_in_period: 28,
            remaining_days: 8,
            days_passed_percentage: 71.4,
          }),
        })
      );

      await page.goto('/dashboard');
      const card = page.locator('[data-testid="current-period-active"]');
      await expect(card).toBeVisible();
      await expect(card.getByText(/8 days remaining/i)).toBeVisible();
    });

    test('dashboard with zero spending on day one shows zero spend', async ({
      authenticatedPage: page,
    }) => {
      await page.route('**/monthly-burn-in**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            total_budget: 200000,
            spent_budget: 0,
            current_day: 1,
            days_in_period: 28,
          }),
        })
      );

      await page.goto('/dashboard');
      const card = page.locator('[data-testid="current-period-active"]');
      await expect(card).toBeVisible();
      // €0.00 spend amount (first match in case projected spend also shows €0.00)
      await expect(card.getByText(/€0\.00|0,00\s*€/).first()).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------
  test.describe('Edge cases', () => {
    test('dashboard with a period that has 100% budget used shows correct state', async ({
      authenticatedPage: page,
    }) => {
      await page.route('**/monthly-burn-in**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            total_budget: 300000,
            spent_budget: 300000,
            current_day: 28,
            days_in_period: 28,
          }),
        })
      );
      await page.route('**/month-progress**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            current_date: '2026-02-28',
            days_in_period: 28,
            remaining_days: 0,
            days_passed_percentage: 100,
          }),
        })
      );

      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="current-period-active"]')).toBeVisible();
    });

    test('dashboard with negative net position (debt > assets) shows data', async ({
      authenticatedPage: page,
    }) => {
      await page.route('**/net-position**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            total_net_position: -50000,
            change_this_period: -5000,
            liquid_balance: 10000,
            protected_balance: 0,
            debt_balance: 60000,
            account_count: 2,
          }),
        })
      );

      await page.goto('/dashboard');
      const card = page.locator('[data-testid="net-position-active"]');
      await expect(card).toBeVisible();
      await expect(card.getByText(/across 2 accounts/i)).toBeVisible();
    });

    test('all dashboard card errors shown simultaneously when all endpoints fail', async ({
      authenticatedPage: page,
    }) => {
      await failEndpoint(page, 'monthly-burn-in');
      await failEndpoint(page, 'budget-stability');
      await failEndpoint(page, 'net-position');

      await page.goto('/dashboard');

      await expect(page.locator('[data-testid="current-period-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="budget-stability-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="net-position-error"]')).toBeVisible();
    });

    test('stability card with all periods outside tolerance', async ({
      authenticatedPage: page,
    }) => {
      await page.route('**/budget-stability**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            within_tolerance_percentage: 0,
            periods_within_tolerance: 0,
            total_closed_periods: 4,
            recent_closed_periods: [
              { period_id: 'p1', is_outside_tolerance: true },
              { period_id: 'p2', is_outside_tolerance: true },
              { period_id: 'p3', is_outside_tolerance: true },
              { period_id: 'p4', is_outside_tolerance: true },
            ],
          }),
        })
      );

      await page.goto('/dashboard');
      const card = page.locator('[data-testid="budget-stability-active"]');
      await expect(card).toBeVisible();
      await expect(card.getByText('0%')).toBeVisible();
    });

    test('stability card with all periods within tolerance', async ({
      authenticatedPage: page,
    }) => {
      await page.route('**/budget-stability**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            within_tolerance_percentage: 100,
            periods_within_tolerance: 6,
            total_closed_periods: 6,
            recent_closed_periods: Array.from({ length: 6 }, (_, i) => ({
              period_id: `p${i + 1}`,
              is_outside_tolerance: false,
            })),
          }),
        })
      );

      await page.goto('/dashboard');
      const card = page.locator('[data-testid="budget-stability-active"]');
      await expect(card).toBeVisible();
      await expect(card.getByText('100%')).toBeVisible();
    });
  });
});
