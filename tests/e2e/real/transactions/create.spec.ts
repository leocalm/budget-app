import { expect, test } from '../../../fixtures/real.fixture';
import { RealAccountsPage } from '../../../pages/real/accounts.page';
import { RealCategoriesPage } from '../../../pages/real/categories.page';
import { RealPeriodsPage } from '../../../pages/real/periods.page';
import { RealTransactionsPage } from '../../../pages/real/transactions.page';

/**
 * Helper: seed the minimum structure needed to create transactions.
 * Creates one period, one checking account, and expense + income categories.
 */
async function seedStructure(page: import('playwright/test').Page): Promise<void> {
  const accountsPage = new RealAccountsPage(page);
  const periodsPage = new RealPeriodsPage(page);
  const categoriesPage = new RealCategoriesPage(page);

  await periodsPage.goto();
  await periodsPage.createPeriod('April 2026', '2026-04-01', '2026-04-30');

  await accountsPage.goto();
  await accountsPage.createAccount('Checking', 'Checking', '1000');

  await categoriesPage.goto();
  await categoriesPage.createCategory('Food', 'expense');
  await categoriesPage.createCategory('Salary', 'income');
}

test.describe('Create transactions', () => {
  test('create outgoing (expense) transaction appears in the list', async ({ loggedInPage }) => {
    await seedStructure(loggedInPage);

    const transactionsPage = new RealTransactionsPage(loggedInPage);
    await transactionsPage.goto();

    await transactionsPage.createTransaction({
      amount: '42.50',
      description: 'Lunch',
      category: 'Food',
      account: 'Checking',
      date: '2026-04-10',
    });

    await expect(loggedInPage.getByText('Lunch')).toBeVisible();
    const count = await transactionsPage.getVisibleCount();
    expect(count).toBeGreaterThanOrEqual(1);
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
      date: '2026-04-01',
    });

    await expect(loggedInPage.getByText('Monthly salary')).toBeVisible();
    const count = await transactionsPage.getVisibleCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('create transfer transaction appears in the list', async ({ loggedInPage }) => {
    const accountsPage = new RealAccountsPage(loggedInPage);
    const periodsPage = new RealPeriodsPage(loggedInPage);

    await periodsPage.goto();
    await periodsPage.createPeriod('April 2026', '2026-04-01', '2026-04-30');

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
      date: '2026-04-05',
      isTransfer: true,
      toAccount: 'Savings',
    });

    await expect(loggedInPage.getByText('Move to savings')).toBeVisible();
    const count = await transactionsPage.getVisibleCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
