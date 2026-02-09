import { expect } from 'playwright/test';
import { test } from '../fixtures/database.fixture';
import { createTestUserCredentials } from '../helpers/test-data';
import { selectMantineOptionByLabel } from '../helpers/ui-helpers';
import { AuthPage } from '../pages/auth.page';

test.describe('Complete User Journey - Desktop', () => {
  test('registers, logs in, configures budget basics, and verifies dashboard activity', async ({
    page,
  }) => {
    const credentials = createTestUserCredentials('complete-user-journey');
    const authPage = new AuthPage(page);

    await authPage.gotoLogin();

    const registerResponse = await page.evaluate(async (payload) => {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      return { status: response.status };
    }, credentials);

    expect(registerResponse.status).toBe(201);

    await authPage.login(credentials.email, credentials.password);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Financial Dashboard' })).toBeVisible();

    const periodName = `E2E Journey ${Date.now()}`;
    await page.goto('/periods');
    await expect(page.getByRole('heading', { name: 'Budget Periods' })).toBeVisible();
    await page.getByRole('button', { name: 'Create Period' }).first().click();
    const periodDialog = page.getByRole('dialog').first();
    await periodDialog.getByLabel('Start Date').fill('2026-03-01');
    await periodDialog.getByLabel('Period Name').fill(periodName);
    await periodDialog.getByRole('button', { name: 'Create Period' }).click();
    await expect(page.getByText(periodName)).toBeVisible();

    const accountName = `E2E Journey Wallet ${Date.now()}`;
    await page.goto('/accounts');
    await expect(page.getByRole('heading', { name: 'Accounts' })).toBeVisible();
    await page.getByRole('button', { name: 'Add Account' }).click();
    await page.getByLabel('Account Name').fill(accountName);
    await selectMantineOptionByLabel(page, 'Type', /Wallet/i);
    const initialBalanceInput = page.getByRole('textbox', { name: 'Initial Balance' });
    await initialBalanceInput.click();
    await initialBalanceInput.press('ControlOrMeta+a');
    await initialBalanceInput.type('500.00');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await page.goto('/dashboard');
    await page.goto('/accounts');
    await expect(page.getByText(accountName)).toBeVisible();

    const transactionDescription = `E2E Journey Transaction ${Date.now()}`;
    const createTransactionResponse = await page.evaluate(
      async (payload) => {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });

        return { status: response.status };
      },
      {
        description: transactionDescription,
        amount: 3200,
        occurred_at: '2026-02-09',
        category_id: 'category-2',
        from_account_id: 'account-1',
        to_account_id: null,
        vendor_id: 'vendor-1',
      }
    );
    expect(createTransactionResponse.status).toBe(201);

    await page.goto('/transactions');
    await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible();
    await page.reload();
    await expect(page.getByText(transactionDescription)).toBeVisible();

    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Financial Dashboard' })).toBeVisible();
    await expect(page.getByText('Recent Activity')).toBeVisible();
    await expect(page.getByText(transactionDescription)).toBeVisible();
  });
});
