import { expect, test } from '../../fixtures/auth.fixture';

test.describe('Dashboard - Mobile', () => {
  test('shows key widgets and navigates to transactions', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');

    await expect(
      authenticatedPage.getByRole('heading', { name: 'Financial Dashboard' })
    ).toBeVisible();
    await expect(authenticatedPage.getByText('Remaining Budget')).toBeVisible();
    await expect(authenticatedPage.getByText('Recent Activity')).toBeVisible();

    await authenticatedPage.getByRole('link', { name: 'View all' }).click();
    await expect(authenticatedPage).toHaveURL(/\/transactions$/);
    await expect(authenticatedPage.getByRole('heading', { name: 'Transactions' })).toBeVisible();
  });
});
