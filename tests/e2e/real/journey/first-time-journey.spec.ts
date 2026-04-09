import { expect, test } from 'playwright/test';
import { createTestUserCredentials } from '../../../helpers/test-data';
import { RealAccountsPage } from '../../../pages/real/accounts.page';
import { RealAuthPage } from '../../../pages/real/auth.page';
import { RealCategoriesPage } from '../../../pages/real/categories.page';
import { RealDashboardPage } from '../../../pages/real/dashboard.page';
import { RealOnboardingPage } from '../../../pages/real/onboarding.page';
import { RealTransactionsPage } from '../../../pages/real/transactions.page';
import { RealVendorsPage } from '../../../pages/real/vendors.page';

/** Get today's date as YYYY-MM-DD */
function today(): string {
  return new Date().toISOString().split('T')[0];
}

test('first-time user journey: register → setup → transact → verify → export → re-login', async ({
  page,
}) => {
  test.setTimeout(5 * 60_000); // 5 minutes for the full journey

  const user = createTestUserCredentials('journey');
  const authPage = new RealAuthPage(page);
  const onboardingPage = new RealOnboardingPage(page);
  const accountsPage = new RealAccountsPage(page);
  const categoriesPage = new RealCategoriesPage(page);
  const vendorsPage = new RealVendorsPage(page);
  const transactionsPage = new RealTransactionsPage(page);
  const dashboardPage = new RealDashboardPage(page);

  // ── Step 1: Register ────────────────────────────────────────────────────────
  await test.step('Register new user via UI', async () => {
    await authPage.register(user.name, user.email, user.password);

    // Dismiss cookie banner if visible
    const cookieBanner = page.getByTestId('cookie-accept');
    if (await cookieBanner.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cookieBanner.click();
    }

    await authPage.expectOnDashboardOrOnboarding();
  });

  // ── Step 2: Onboarding ──────────────────────────────────────────────────────
  await test.step('Complete or skip onboarding wizard', async () => {
    const isOnboarding = page.url().includes('/onboarding');
    if (isOnboarding) {
      await onboardingPage.skipToEnd();
    }
    await onboardingPage.expectOnDashboard();
  });

  // ── Step 3: Create accounts ─────────────────────────────────────────────────
  await test.step('Create Checking and Savings accounts', async () => {
    await accountsPage.goto();
    await accountsPage.createAccount('Checking', 'Checking', '2000');
    await accountsPage.createAccount('Savings', 'Savings', '5000');
  });

  // ── Step 4: Assert net position ─────────────────────────────────────────────
  await test.step('Verify accounts net position is visible', async () => {
    const netPosition = await accountsPage.getNetPosition();
    expect(netPosition).toBeTruthy();
    // Net position should contain a currency value (Checking: 2000 + Savings: 5000)
    expect(netPosition).toMatch(/\d/);
  });

  // ── Step 5: Verify period exists (auto-created by onboarding) ────────────────
  // Onboarding auto-generates periods, so we skip manual creation.

  // ── Step 6: Create categories ───────────────────────────────────────────────
  await test.step('Create expense and income categories', async () => {
    await categoriesPage.goto();
    await categoriesPage.createCategory('Groceries', 'expense');
    await categoriesPage.createCategory('Rent', 'expense');
    await categoriesPage.createCategory('Transport', 'expense');
    await categoriesPage.createCategory('Salary', 'income');
  });

  // ── Step 7: Create vendor ───────────────────────────────────────────────────
  await test.step('Create Albert Heijn vendor', async () => {
    await vendorsPage.goto();
    await vendorsPage.createVendor('Albert Heijn');
    await expect(page.getByText('Albert Heijn')).toBeVisible();
  });

  // ── Step 8: Create transactions ─────────────────────────────────────────────
  await test.step('Create salary income transaction', async () => {
    await transactionsPage.goto();
    await transactionsPage.createTransaction({
      amount: '3000',
      description: 'April Salary',
      category: 'Salary',
      account: 'Checking',
      date: today(),
    });
  });

  await test.step('Create rent expense transaction', async () => {
    await transactionsPage.goto();
    await transactionsPage.createTransaction({
      amount: '1200',
      description: 'April Rent',
      category: 'Rent',
      account: 'Checking',
      date: today(),
    });
  });

  await test.step('Create groceries expense transaction with vendor', async () => {
    await transactionsPage.goto();
    await transactionsPage.createTransaction({
      amount: '85.50',
      description: 'Weekly groceries',
      category: 'Groceries',
      account: 'Checking',
      date: today(),
      vendor: 'Albert Heijn',
    });
  });

  await test.step('Create transport expense transaction', async () => {
    await transactionsPage.goto();
    await transactionsPage.createTransaction({
      amount: '35',
      description: 'Public transport',
      category: 'Transport',
      account: 'Checking',
      date: today(),
    });
  });

  await test.step('Create transfer between accounts', async () => {
    await transactionsPage.goto();
    await transactionsPage.createTransaction({
      amount: '500',
      description: 'Transfer to Savings',
      category: 'Transfer',
      account: 'Checking',
      date: today(),
      isTransfer: true,
      toAccount: 'Savings',
    });
  });

  // ── Step 9: Verify transaction count ────────────────────────────────────────
  await test.step('Verify 5 transactions are visible', async () => {
    const count = await transactionsPage.getVisibleCount();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  // ── Step 10: Verify dashboard ───────────────────────────────────────────────
  await test.step('Verify dashboard shows expected spent and net position', async () => {
    await dashboardPage.goto();

    const spent = await dashboardPage.getSpent();
    // Rent (1200) + Groceries (85.50) + Transport (35) = 1320.50
    expect(spent).toMatch(/1[,.]?32[05]/);

    const netPosition = await dashboardPage.getNetPosition();
    expect(netPosition).toBeTruthy();
    expect(netPosition.trim()).not.toBe('');
  });

  // ── Step 11–12: Edit and delete transactions (skipped — needs transaction row data-testid) ──
  // TODO: implement once transaction rows have data-testid for click-to-edit and kebab menu

  // ── Step 13: Export CSV (skipped — download mechanism needs investigation) ──
  // TODO: implement once the export download flow is understood

  // ── Step 14: Logout and re-login ─────────────────────────────────────────────
  await test.step('Logout and verify redirect to login', async () => {
    await authPage.logout();
    await authPage.expectOnLogin();
  });

  await test.step('Re-login with same credentials and verify dashboard loads', async () => {
    await authPage.login(user.email, user.password);
    await authPage.expectOnDashboardOrOnboarding();

    // If we land on onboarding again, navigate to dashboard directly
    if (page.url().includes('/onboarding')) {
      await dashboardPage.goto();
    }
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
