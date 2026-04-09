import { expect, test } from '../../../fixtures/real.fixture';
import { RealAccountsPage } from '../../../pages/real/accounts.page';
import { RealCategoriesPage } from '../../../pages/real/categories.page';
import { RealTransactionsPage } from '../../../pages/real/transactions.page';

/** Get today's date as YYYY-MM-DD */
function today(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Helper: seed the minimum structure needed to create transactions.
 * Creates one checking account and expense + income categories.
 * Skips period creation since onboarding auto-generates periods.
 */
async function seedStructure(page: import('playwright/test').Page): Promise<void> {
  const accountsPage = new RealAccountsPage(page);
  const categoriesPage = new RealCategoriesPage(page);

  await accountsPage.goto();
  await accountsPage.createAccount('Checking', 'Checking', '1000');

  await categoriesPage.goto();
  await categoriesPage.createCategory('Food', 'expense');
  await categoriesPage.createCategory('Salary', 'income');
}

test.describe('Create transactions', () => {
  test.describe.configure({ mode: 'parallel', timeout: 90_000 });
  test('create outgoing (expense) transaction appears in the list', async ({ loggedInPage }) => {
    await seedStructure(loggedInPage);

    const transactionsPage = new RealTransactionsPage(loggedInPage);
    await transactionsPage.goto();

    await transactionsPage.createTransaction({
      amount: '42.50',
      description: 'Lunch',
      category: 'Food',
      account: 'Checking',
      date: today(),
    });

    // Scroll to the transaction to make it visible (may be off-screen on mobile)
    await expect(loggedInPage.getByText('Lunch').first()).toBeAttached();
  });

  test('create incoming (income) transaction appears in the list', async ({ loggedInPage }) => {
    await seedStructure(loggedInPage);

    const transactionsPage = new RealTransactionsPage(loggedInPage);
    await transactionsPage.goto();

    await transactionsPage.createTransaction({
      amount: '2500',
      description: 'Monthly salary',
      category: 'Salary',
      account: 'Checking',
      date: today(),
    });

    await expect(loggedInPage.getByText('Monthly salary').first()).toBeAttached();
  });

  test('create transfer transaction appears in the list', async ({ loggedInPage }) => {
    const accountsPage = new RealAccountsPage(loggedInPage);

    await accountsPage.goto();
    await accountsPage.createAccount('Checking', 'Checking', '3000');
    await accountsPage.createAccount('Savings', 'Savings', '0');

    const transactionsPage = new RealTransactionsPage(loggedInPage);
    await transactionsPage.goto();

    await transactionsPage.createTransaction({
      amount: '500',
      description: 'Move to savings',
      category: 'Transfer',
      account: 'Checking',
      date: today(),
      isTransfer: true,
      toAccount: 'Savings',
    });

    await expect(loggedInPage.getByText('Move to savings').first()).toBeAttached();
  });
});
