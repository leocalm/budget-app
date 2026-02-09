import { expect, test } from '../../fixtures/auth.fixture';

test.describe('Navigation - Mobile', () => {
  test('navigates using bottom navigation', async ({ authenticatedPage }) => {
    await expect(authenticatedPage.getByRole('button', { name: 'Dashboard' })).toBeVisible();

    await authenticatedPage.getByRole('button', { name: 'Transactions' }).click();
    await expect(authenticatedPage).toHaveURL(/\/transactions$/);

    await authenticatedPage.getByRole('button', { name: 'Budget' }).click();
    await expect(authenticatedPage).toHaveURL(/\/budget$/);

    await authenticatedPage.getByRole('button', { name: 'Accounts' }).click();
    await expect(authenticatedPage).toHaveURL(/\/accounts$/);
  });
});
