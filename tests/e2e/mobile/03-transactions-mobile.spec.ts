import { expect, test } from '../../fixtures/auth.fixture';

test.describe('Transactions - Mobile', () => {
  test('shows transactions and supports search filtering', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/transactions');
    await expect(authenticatedPage.getByRole('heading', { name: 'Transactions' })).toBeVisible();

    await expect(
      authenticatedPage.getByRole('form', { name: /Quick add transaction form/i })
    ).toBeVisible();
    await expect(authenticatedPage.getByText('Grocery Store')).toBeVisible();

    const searchInput = authenticatedPage.getByPlaceholder('Search transactions...');
    await searchInput.fill('Grocery');
    await expect(authenticatedPage.getByText('Grocery Store')).toBeVisible();

    await searchInput.fill('No matching transaction');
    await expect(authenticatedPage.getByText('No transactions found')).toBeVisible();
  });
});
