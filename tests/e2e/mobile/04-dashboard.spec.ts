import { expect, test } from '../../fixtures/auth.fixture';

/**
 * Mobile-specific dashboard tests.
 *
 * These tests focus exclusively on interactions and layout differences that
 * are unique to the mobile viewport — bottom navigation access, sidebar
 * absence, and mobile-layout stacking. Functional card state coverage lives
 * in the desktop suite and is not duplicated here.
 */

test.describe('Dashboard - Mobile', () => {
  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  test.describe('Navigation', () => {
    test('reaches dashboard via bottom navigation Dashboard button', async ({
      authenticatedPage,
    }) => {
      // Navigate away first so the tap is meaningful
      await authenticatedPage.goto('/transactions');
      await expect(authenticatedPage).toHaveURL(/\/transactions/);

      await authenticatedPage.getByRole('button', { name: 'Dashboard' }).click();
      await expect(authenticatedPage).toHaveURL(/\/dashboard/);
      await expect(authenticatedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    });

    test('dashboard is the default landing page after login', async ({ authenticatedPage }) => {
      await expect(authenticatedPage).toHaveURL(/\/dashboard/);
    });
  });

  // -------------------------------------------------------------------------
  // Layout
  // -------------------------------------------------------------------------
  test.describe('Layout', () => {
    test('desktop sidebar is not visible on mobile', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/dashboard');
      // The desktop sidebar nav should not be rendered / visible at mobile widths
      await expect(authenticatedPage.locator('nav[class*="sidebar"]')).not.toBeVisible();
    });

    test('bottom navigation bar is visible', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/dashboard');
      await expect(authenticatedPage.getByRole('button', { name: 'Dashboard' })).toBeVisible();
      await expect(authenticatedPage.getByRole('button', { name: 'Transactions' })).toBeVisible();
    });

    test('dashboard heading is visible without horizontal scroll', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto('/dashboard');
      const heading = authenticatedPage.getByRole('heading', { name: 'Dashboard' });
      await expect(heading).toBeVisible();

      // Heading must be within the viewport horizontally
      const box = await heading.boundingBox();
      const viewportWidth = authenticatedPage.viewportSize()?.width ?? 0;
      expect(box).not.toBeNull();
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth);
      }
    });

    test('cards stack vertically (no horizontal overflow)', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/dashboard');

      await expect(
        authenticatedPage.locator('[data-testid="current-period-active"]')
      ).toBeVisible();

      // Detect horizontal overflow by checking the scroll width of the body
      const hasHorizontalOverflow = await authenticatedPage.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHorizontalOverflow).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Locked state (spot-check only — full coverage in desktop suite)
  // -------------------------------------------------------------------------
  test.describe('Locked state', () => {
    test('shows locked dashboard correctly on mobile when no active period', async ({
      page,
      mockApi,
    }) => {
      if (mockApi) {
        mockApi.setCurrentPeriod(null);
        mockApi.setPeriods([]);
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
      await expect(page.getByText(/Status:/i).first()).toBeVisible();

      // Bottom nav must still be accessible while locked
      await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Transactions' })).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // Overlay banner
  // -------------------------------------------------------------------------
  test.describe('ActiveOverlayBanner', () => {
    test('overlay banner is visible and tappable on mobile', async ({
      authenticatedPage: page,
    }) => {
      await page.route('**/overlays**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'ov-mobile',
              name: 'Mobile Overlay',
              icon: '📱',
              start_date: '2026-02-01',
              end_date: '2026-02-28',
              inclusion_mode: 'all',
              total_cap_amount: 20000,
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

      // Tap the banner — should navigate to /overlays
      await banner.click();
      await expect(page).toHaveURL(/\/overlays/);
    });
  });
});
