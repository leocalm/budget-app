import { expect, test } from '../fixtures/auth.fixture';

test.describe('Transactions - Vendor Refresh', () => {
  test('reuses a newly created vendor without page refresh', async ({ authenticatedPage }) => {
    const vendorName = `Vendor ${Date.now()}`;

    await authenticatedPage.goto('/transactions');
    await expect(authenticatedPage).toHaveURL(/\/transactions$/);

    await authenticatedPage
      .getByPlaceholder("Description (e.g., Lunch at McDonald's)")
      .fill('Coffee');
    await authenticatedPage.getByPlaceholder('0.00').fill('4.50');

    await authenticatedPage.getByPlaceholder('Account...').click();
    await authenticatedPage.getByText('Checking Account').first().click();

    await authenticatedPage.getByPlaceholder('Category...').click();
    await authenticatedPage.getByText('Food').first().click();

    await authenticatedPage.getByPlaceholder('Vendor').fill(vendorName);
    await authenticatedPage.getByRole('button', { name: 'plus' }).click();
    await expect(authenticatedPage.getByText('Transaction added successfully')).toBeVisible();

    await authenticatedPage.getByPlaceholder("Description (e.g., Lunch at McDonald's)").fill('Tea');
    await authenticatedPage.getByPlaceholder('0.00').fill('3.00');

    await authenticatedPage.getByPlaceholder('Account...').click();
    await authenticatedPage.getByText('Checking Account').first().click();

    await authenticatedPage.getByPlaceholder('Category...').click();
    await authenticatedPage.getByText('Food').first().click();

    await authenticatedPage.getByPlaceholder('Vendor').fill(vendorName.slice(0, 8));
    await expect(authenticatedPage.getByText(vendorName).first()).toBeVisible();
    await authenticatedPage.getByText(vendorName).first().click();
    await expect(authenticatedPage.getByPlaceholder('Vendor')).toHaveValue(vendorName);
  });
});
