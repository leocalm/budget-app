import { expect, test } from '../fixtures/auth.fixture';

test.describe('Accounts - Refresh After Create', () => {
  test('shows a newly created account in the list without page reload', async ({
    authenticatedPage,
  }) => {
    const accountName = `E2E Account ${Date.now()}`;

    await authenticatedPage.goto('/accounts');
    await expect(authenticatedPage).toHaveURL(/\/accounts$/);

    await expect(authenticatedPage.getByText('Checking Account').first()).toBeVisible();

    await authenticatedPage.getByRole('button', { name: 'Add Account' }).click();
    await authenticatedPage.getByLabel('Account Name').fill(accountName);

    await authenticatedPage.getByPlaceholder('Search type...').click();
    await authenticatedPage.getByRole('option', { name: 'Checking' }).click();

    await authenticatedPage.getByLabel('Initial Balance').fill('1250.00');
    await authenticatedPage.getByRole('button', { name: 'Create Account' }).click();

    await expect(authenticatedPage.getByRole('button', { name: 'Add Account' })).toBeVisible();
    await expect(authenticatedPage.getByText(accountName).first()).toBeVisible();
  });
});
