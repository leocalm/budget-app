import type { Page } from 'playwright/test';
import { AuthPage } from '../pages/auth.page';
import { test as databaseTest, expect } from './database.fixture';

interface AuthFixtures {
  authenticatedPage: Page;
}

export const test = databaseTest.extend<AuthFixtures>({
  authenticatedPage: async ({ page, registeredUser }, use) => {
    const authPage = new AuthPage(page);

    await authPage.gotoLogin();
    await authPage.login(registeredUser.email, registeredUser.password);
    await expect(page).toHaveURL(/\/dashboard$/);

    await use(page);
  },
});

export { expect };
