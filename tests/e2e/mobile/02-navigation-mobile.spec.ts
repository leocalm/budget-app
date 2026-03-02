import { expect, test } from '../../fixtures/auth.fixture';

test.describe('Navigation - Mobile', () => {
  test('navigates using bottom navigation', async ({ authenticatedPage }) => {
    await expect(authenticatedPage.getByRole('button', { name: 'Dashboard' })).toBeVisible();

    await authenticatedPage.getByRole('button', { name: 'Transactions' }).click();
    await expect(authenticatedPage).toHaveURL(/\/transactions$/);

    await authenticatedPage.getByRole('button', { name: 'Periods' }).click();
    await expect(authenticatedPage).toHaveURL(/\/periods$/);

    await authenticatedPage.getByRole('button', { name: 'More' }).click();
    await authenticatedPage.getByRole('button', { name: 'Accounts' }).click();
    await expect(authenticatedPage).toHaveURL(/\/accounts$/);

    await authenticatedPage.getByRole('button', { name: 'More' }).click();
    await authenticatedPage.getByRole('button', { name: 'Categories' }).click();
    await expect(authenticatedPage).toHaveURL(/\/categories$/);

    await authenticatedPage.getByRole('button', { name: 'More' }).click();
    await authenticatedPage.getByRole('button', { name: 'Vendors' }).click();
    await expect(authenticatedPage).toHaveURL(/\/vendors$/);
  });
});
