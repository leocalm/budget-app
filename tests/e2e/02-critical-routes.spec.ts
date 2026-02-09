import { expect, test } from '../fixtures/auth.fixture';
import { criticalAuthenticatedRoutes, publicAuthRoutes } from '../helpers/routes';

test.describe('Critical Routes - Desktop', () => {
  for (const route of criticalAuthenticatedRoutes) {
    test(`loads authenticated route ${route}`, async ({ authenticatedPage }) => {
      await authenticatedPage.goto(route);
      await expect(authenticatedPage).toHaveURL(new RegExp(`${route}$`));
      await expect(authenticatedPage.getByTestId('app-shell-main')).toBeVisible();
    });
  }

  for (const route of publicAuthRoutes) {
    test(`loads public auth route ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(`${route}$`));
    });
  }
});
