import { test } from '../fixtures/auth.fixture';
import { criticalAuthenticatedRoutes, publicAuthRoutes } from '../helpers/routes';

test.describe('App Screenshots', () => {
  for (const route of criticalAuthenticatedRoutes) {
    test(`screenshot authenticated route ${route}`, async ({ authenticatedPage }, testInfo) => {
      await authenticatedPage.goto(route);

      // Wait for the main content to be visible and stable
      await authenticatedPage.waitForSelector('[data-testid="app-shell-main"]');

      // Some routes might need extra time for animations or data fetching
      await authenticatedPage.waitForTimeout(1000);

      const screenshotName = `screenshot-authenticated-${route.replace(/\//g, '-')}-${testInfo.project.name}.png`;
      await authenticatedPage.screenshot({
        path: `screenshots/${screenshotName}`,
        fullPage: true,
      });
    });
  }

  for (const route of publicAuthRoutes) {
    test(`screenshot public route ${route}`, async ({ page }, testInfo) => {
      await page.goto(route);

      // Wait for stability
      await page.waitForTimeout(1000);

      const screenshotName = `screenshot-public-${route.replace(/\//g, '-')}-${testInfo.project.name}.png`;
      await page.screenshot({
        path: `screenshots/${screenshotName}`,
        fullPage: true,
      });
    });
  }
});
