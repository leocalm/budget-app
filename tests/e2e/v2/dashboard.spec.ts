import type { Page } from 'playwright/test';
import { expect, test } from '../../fixtures/auth.fixture';
import { DashboardV2Page } from '../../pages/v2/dashboard.page';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Hold a v2 endpoint until `release()` is called so the test can assert the
 * loading state before the response arrives.
 *
 * Unlike the v1 helper which uses `route.continue()`, v2 endpoints are not
 * served by the mock API server (which only handles `/api/*`). We therefore
 * respond with a successful fixture *after* the gate is opened so the test
 * can release the pending request without requiring a live backend.
 */
function holdV2Endpoint(
  page: Page,
  urlPattern: string,
  fulfillBody: object = {}
): { release: () => void } {
  let release!: () => void;
  const gate = new Promise<void>((r) => {
    release = r;
  });

  void page.route(`**${urlPattern}**`, async (route) => {
    await gate;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fulfillBody),
    });
  });

  return { release };
}

/**
 * Respond to a v2 endpoint with a 500 error immediately.
 */
async function failV2Endpoint(page: Page, urlPattern: string): Promise<void> {
  await page.route(`**${urlPattern}**`, (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Internal Server Error' }),
    })
  );
}

/**
 * Stub the two v2 dashboard net-position endpoints with sensible defaults so
 * BudgetContext (v1 paths) is unaffected. Override individual defaults by
 * calling `page.route(...)` *before* this helper in the test body — Playwright
 * routes are matched in reverse registration order (LIFO).
 */
async function stubNetPositionEndpoints(
  page: Page,
  opts: {
    netPosition?: object;
    netPositionHistory?: object;
  } = {}
): Promise<void> {
  const defaultNetPosition = {
    total: 128400,
    differenceThisPeriod: 3400,
    liquidAmount: 100000,
    protectedAmount: 28400,
    debtAmount: 0,
    numberOfAccounts: 2,
  };

  const defaultHistory = {
    history: [
      { date: '2026-02-01', total: 120000 },
      { date: '2026-02-15', total: 124000 },
      { date: '2026-02-28', total: 128400 },
    ],
  };

  await page.route('**/dashboard/net-position-history**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(opts.netPositionHistory ?? defaultHistory),
    })
  );

  await page.route('**/dashboard/net-position**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(opts.netPosition ?? defaultNetPosition),
    })
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('V2 Dashboard - Net Position Card', () => {
  // -------------------------------------------------------------------------
  // Rendering with data
  // -------------------------------------------------------------------------
  test.describe('with data', () => {
    test('displays net position card when data loads successfully', async ({
      authenticatedPage: page,
    }) => {
      const dashboard = new DashboardV2Page(page);

      await stubNetPositionEndpoints(page, {
        netPosition: {
          total: 128400,
          differenceThisPeriod: 3400,
          liquidAmount: 100000,
          protectedAmount: 28400,
          debtAmount: 0,
          numberOfAccounts: 2,
        },
      });

      await dashboard.goto();
      await dashboard.expectNetPositionCardVisible();
    });

    test('shows account count link in card header', async ({ authenticatedPage: page }) => {
      const dashboard = new DashboardV2Page(page);

      await stubNetPositionEndpoints(page, {
        netPosition: {
          total: 250000,
          differenceThisPeriod: 5000,
          liquidAmount: 250000,
          protectedAmount: 0,
          debtAmount: 0,
          numberOfAccounts: 3,
        },
      });

      await dashboard.goto();
      await dashboard.expectNetPositionCardVisible();

      // Header should link to /v2/accounts and show the account count
      const accountsLink = page.getByRole('link', { name: /3 accounts/i });
      await expect(accountsLink).toBeVisible();
      await expect(accountsLink).toHaveAttribute('href', '/v2/accounts');
    });

    test('shows total net position value as hero figure', async ({ authenticatedPage: page }) => {
      const dashboard = new DashboardV2Page(page);

      await stubNetPositionEndpoints(page, {
        netPosition: {
          total: 750000,
          differenceThisPeriod: 0,
          liquidAmount: 750000,
          protectedAmount: 0,
          debtAmount: 0,
          numberOfAccounts: 1,
        },
      });

      await dashboard.goto();
      await dashboard.expectNetPositionCardVisible();

      // €7,500.00 — matches regardless of decimal separator locale
      const card = page.locator('[data-testid="net-position-card"]');
      await expect(card.getByText(/7[,.]500/)).toBeVisible();
    });

    test('shows positive period change with + prefix', async ({ authenticatedPage: page }) => {
      const dashboard = new DashboardV2Page(page);

      await stubNetPositionEndpoints(page, {
        netPosition: {
          total: 500000,
          differenceThisPeriod: 25000,
          liquidAmount: 500000,
          protectedAmount: 0,
          debtAmount: 0,
          numberOfAccounts: 1,
        },
      });

      await dashboard.goto();
      await dashboard.expectNetPositionCardVisible();

      const card = page.locator('[data-testid="net-position-card"]');
      await expect(card.getByText(/\+/)).toBeVisible();
      await expect(card.getByText(/this period/i)).toBeVisible();
    });

    test('shows negative period change with - prefix', async ({ authenticatedPage: page }) => {
      const dashboard = new DashboardV2Page(page);

      await stubNetPositionEndpoints(page, {
        netPosition: {
          total: 500000,
          differenceThisPeriod: -12500,
          liquidAmount: 500000,
          protectedAmount: 0,
          debtAmount: 0,
          numberOfAccounts: 1,
        },
      });

      await dashboard.goto();
      await dashboard.expectNetPositionCardVisible();

      const card = page.locator('[data-testid="net-position-card"]');
      await expect(card.getByText(/-/)).toBeVisible();
      await expect(card.getByText(/this period/i)).toBeVisible();
    });

    test('shows breakdown section when liquid, protected and debt are all non-zero', async ({
      authenticatedPage: page,
    }) => {
      const dashboard = new DashboardV2Page(page);

      await stubNetPositionEndpoints(page, {
        netPosition: {
          total: 100000,
          differenceThisPeriod: 0,
          liquidAmount: 50000,
          protectedAmount: 30000,
          debtAmount: 20000,
          numberOfAccounts: 3,
        },
      });

      await dashboard.goto();
      await dashboard.expectNetPositionCardVisible();

      const card = page.locator('[data-testid="net-position-card"]');
      // All three breakdown labels should be visible
      await expect(card.getByText('Liquid')).toBeVisible();
      await expect(card.getByText('Protected')).toBeVisible();
      await expect(card.getByText('Debt')).toBeVisible();
    });

    test('hides breakdown section when all amounts are zero', async ({
      authenticatedPage: page,
    }) => {
      const dashboard = new DashboardV2Page(page);

      await stubNetPositionEndpoints(page, {
        netPosition: {
          total: 0,
          differenceThisPeriod: 0,
          liquidAmount: 0,
          protectedAmount: 0,
          debtAmount: 0,
          numberOfAccounts: 1,
        },
      });

      await dashboard.goto();
      await dashboard.expectNetPositionCardVisible();

      const card = page.locator('[data-testid="net-position-card"]');
      await expect(card.getByText('Liquid')).not.toBeVisible();
      await expect(card.getByText('Protected')).not.toBeVisible();
      await expect(card.getByText('Debt')).not.toBeVisible();
    });

    test('hides Debt breakdown item when debtAmount is zero', async ({
      authenticatedPage: page,
    }) => {
      const dashboard = new DashboardV2Page(page);

      await stubNetPositionEndpoints(page, {
        netPosition: {
          total: 80000,
          differenceThisPeriod: 1000,
          liquidAmount: 50000,
          protectedAmount: 30000,
          debtAmount: 0,
          numberOfAccounts: 2,
        },
      });

      await dashboard.goto();
      await dashboard.expectNetPositionCardVisible();

      const card = page.locator('[data-testid="net-position-card"]');
      await expect(card.getByText('Liquid')).toBeVisible();
      await expect(card.getByText('Protected')).toBeVisible();
      await expect(card.getByText('Debt')).not.toBeVisible();
    });

    test('renders correctly with a negative net position (debt > assets)', async ({
      authenticatedPage: page,
    }) => {
      const dashboard = new DashboardV2Page(page);

      await stubNetPositionEndpoints(page, {
        netPosition: {
          total: -50000,
          differenceThisPeriod: -5000,
          liquidAmount: 10000,
          protectedAmount: 0,
          debtAmount: 60000,
          numberOfAccounts: 2,
        },
      });

      await dashboard.goto();
      await dashboard.expectNetPositionCardVisible();

      const card = page.locator('[data-testid="net-position-card"]');
      await expect(card.getByText(/2 accounts/i)).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------
  test.describe('loading state', () => {
    test('shows skeleton while the net-position request is in-flight', async ({
      authenticatedPage: page,
    }) => {
      const netPositionBody = {
        total: 128400,
        differenceThisPeriod: 3400,
        liquidAmount: 100000,
        protectedAmount: 28400,
        debtAmount: 0,
        numberOfAccounts: 2,
      };

      // Hold the primary endpoint; stub history immediately so it does not block
      const { release } = holdV2Endpoint(page, '/dashboard/net-position', netPositionBody);
      await page.route('**/dashboard/net-position-history**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ history: [] }),
        })
      );

      await page.goto('/v2/dashboard');
      const dashboard = new DashboardV2Page(page);
      await dashboard.expectNetPositionCardLoading();

      release();
    });
  });

  // -------------------------------------------------------------------------
  // Error state
  // -------------------------------------------------------------------------
  test.describe('error state', () => {
    test('shows error message and retry button when net-position request fails', async ({
      authenticatedPage: page,
    }) => {
      await failV2Endpoint(page, '/dashboard/net-position');
      // History can fail silently — only the primary endpoint drives the UI state
      await page.route('**/dashboard/net-position-history**', (route) =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        })
      );

      const dashboard = new DashboardV2Page(page);
      await dashboard.goto();

      // React Query retries 3× with exponential back-off before giving up
      await dashboard.expectNetPositionCardError();
    });

    test('retry button re-fetches and shows data on success', async ({
      authenticatedPage: page,
    }) => {
      // Always fail so React Query exhausts its retries
      await failV2Endpoint(page, '/dashboard/net-position');

      const dashboard = new DashboardV2Page(page);
      await dashboard.goto();
      await dashboard.expectNetPositionCardError();

      // Remove the failing override so the successful stub can respond
      await page.unroute('**/dashboard/net-position**');
      await stubNetPositionEndpoints(page);

      await page.getByRole('button', { name: /retry/i }).click();
      await dashboard.expectNetPositionCardVisible();
    });
  });

  // -------------------------------------------------------------------------
  // Empty state (no accounts)
  // -------------------------------------------------------------------------
  test.describe('empty state', () => {
    test('shows empty-state message when numberOfAccounts is zero', async ({
      authenticatedPage: page,
    }) => {
      await stubNetPositionEndpoints(page, {
        netPosition: {
          total: 0,
          differenceThisPeriod: 0,
          liquidAmount: 0,
          protectedAmount: 0,
          debtAmount: 0,
          numberOfAccounts: 0,
        },
      });

      const dashboard = new DashboardV2Page(page);
      await dashboard.goto();
      await dashboard.expectNetPositionCardEmpty();
    });

    test('shows empty-state message when data is null/undefined', async ({
      authenticatedPage: page,
    }) => {
      // The API returns an empty object — the guard `!data || data.numberOfAccounts === 0`
      // should catch this and show the empty state.
      await page.route('**/dashboard/net-position-history**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(null),
        })
      );
      await page.route('**/dashboard/net-position**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(null),
        })
      );

      const dashboard = new DashboardV2Page(page);
      await dashboard.goto();
      await dashboard.expectNetPositionCardEmpty();
    });
  });

  // -------------------------------------------------------------------------
  // Period selection
  // -------------------------------------------------------------------------
  test.describe('period selection', () => {
    test('shows "no period selected" message when BudgetContext has no period', async ({
      authenticatedPage: page,
      mockApi,
    }) => {
      // Clear the stored period so BudgetContext starts with nothing selected
      await page.addInitScript(() => {
        localStorage.removeItem('budget-period-id');
      });

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

      const dashboard = new DashboardV2Page(page);
      await dashboard.goto();
      await dashboard.expectNoPeriodMessage();
    });
  });

  // -------------------------------------------------------------------------
  // Page structure
  // -------------------------------------------------------------------------
  test.describe('page structure', () => {
    test('shows the Dashboard heading and subtitle', async ({ authenticatedPage: page }) => {
      await stubNetPositionEndpoints(page);

      const dashboard = new DashboardV2Page(page);
      await dashboard.goto();

      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
      await expect(page.getByText('Your finance pulse, at a glance')).toBeVisible();
    });

    test('redirects to /v2/dashboard when navigating to /v2', async ({
      authenticatedPage: page,
    }) => {
      await stubNetPositionEndpoints(page);

      await page.goto('/v2');
      await expect(page).toHaveURL(/\/v2\/dashboard$/);
    });
  });
});
