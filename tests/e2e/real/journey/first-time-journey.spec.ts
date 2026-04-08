import { expect, test } from '../../../fixtures/real.fixture';
import { RealAccountsPage } from '../../../pages/real/accounts.page';
import { RealAuthPage } from '../../../pages/real/auth.page';
import { RealCategoriesPage } from '../../../pages/real/categories.page';
import { RealDashboardPage } from '../../../pages/real/dashboard.page';
import { RealOnboardingPage } from '../../../pages/real/onboarding.page';
import { RealPeriodsPage } from '../../../pages/real/periods.page';
import { RealSettingsPage } from '../../../pages/real/settings.page';
import { RealTransactionsPage } from '../../../pages/real/transactions.page';
import { RealVendorsPage } from '../../../pages/real/vendors.page';

test('first-time user journey: register → setup → transact → verify → export → re-login', async ({
  page,
  realUser,
}) => {
  test.slow();

  const authPage = new RealAuthPage(page);
  const onboardingPage = new RealOnboardingPage(page);
  const accountsPage = new RealAccountsPage(page);
  const periodsPage = new RealPeriodsPage(page);
  const categoriesPage = new RealCategoriesPage(page);
  const vendorsPage = new RealVendorsPage(page);
  const transactionsPage = new RealTransactionsPage(page);
  const dashboardPage = new RealDashboardPage(page);
  const settingsPage = new RealSettingsPage(page);

  // ── Step 1: Register ────────────────────────────────────────────────────────
  await test.step('Register new user via UI', async () => {
    await authPage.register(realUser.name, realUser.email, realUser.password);

    // Dismiss cookie banner if visible
    const cookieBanner = page.getByTestId('cookie-banner-accept');
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
  await test.step('Verify net position shows ~7,000', async () => {
    const netPosition = await accountsPage.getNetPosition();
    expect(netPosition).toMatch(/7[,.]?000/);
  });

  // ── Step 5: Create period ───────────────────────────────────────────────────
  await test.step('Create April 2026 budget period', async () => {
    await periodsPage.goto();
    await periodsPage.createPeriod('April 2026', '2026-04-01', '2026-04-30');
  });

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
      date: '2026-04-01',
    });
  });

  await test.step('Create rent expense transaction', async () => {
    await transactionsPage.createTransaction({
      amount: '1200',
      description: 'April Rent',
      category: 'Rent',
      account: 'Checking',
      date: '2026-04-02',
    });
  });

  await test.step('Create groceries expense transaction with vendor', async () => {
    await transactionsPage.createTransaction({
      amount: '85.50',
      description: 'Weekly groceries',
      category: 'Groceries',
      account: 'Checking',
      date: '2026-04-03',
      vendor: 'Albert Heijn',
    });
  });

  await test.step('Create transport expense transaction', async () => {
    await transactionsPage.createTransaction({
      amount: '35',
      description: 'Public transport',
      category: 'Transport',
      account: 'Checking',
      date: '2026-04-04',
    });
  });

  await test.step('Create transfer between accounts', async () => {
    await transactionsPage.createTransaction({
      amount: '500',
      description: 'Transfer to Savings',
      category: 'Transfer',
      account: 'Checking',
      date: '2026-04-05',
      isTransfer: true,
      toAccount: 'Savings',
    });
  });

  // ── Step 9: Verify transaction count ────────────────────────────────────────
  await test.step('Verify 5 transactions are visible', async () => {
    const count = await transactionsPage.getVisibleCount();
    expect(count).toBe(5);
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

  // ── Step 11: Edit transaction ────────────────────────────────────────────────
  await test.step('Edit groceries transaction amount to 120', async () => {
    await transactionsPage.goto();

    // Click the groceries transaction row to open it
    const groceriesRow = page
      .locator('[data-testid^="transaction-row"]')
      .filter({ hasText: 'Weekly groceries' })
      .first();
    // Fallback: find by description text
    const rowLocator = (await groceriesRow.isVisible({ timeout: 2000 }).catch(() => false))
      ? groceriesRow
      : page.getByText('Weekly groceries');
    await rowLocator.click();

    // Wait for the edit drawer / modal to open
    await expect(page.getByTestId('transaction-form-drawer')).toBeVisible();

    // Clear and update the amount
    const amountInput = page.getByTestId('transaction-amount-input');
    await amountInput.clear();
    await amountInput.fill('120');

    await page.getByTestId('transaction-form-submit').click();
    await expect(page.getByTestId('transaction-form-drawer')).not.toBeVisible();

    // Verify dashboard spent updated: Rent (1200) + Groceries (120) + Transport (35) = 1355
    await dashboardPage.goto();
    const updatedSpent = await dashboardPage.getSpent();
    expect(updatedSpent).toMatch(/1[,.]?35[05]/);
  });

  // ── Step 12: Delete transaction ──────────────────────────────────────────────
  await test.step('Delete transport transaction, verify count drops to 4', async () => {
    await transactionsPage.goto();

    // Open the kebab menu for the transport transaction
    const transportRow = page
      .locator('[data-testid^="transaction-row"]')
      .filter({ hasText: 'Public transport' })
      .first();
    const rowForMenu = (await transportRow.isVisible({ timeout: 2000 }).catch(() => false))
      ? transportRow
      : page.getByText('Public transport').locator('..');

    await rowForMenu.getByRole('button', { name: /more|options|menu|\.\.\./i }).click();
    await page.getByRole('menuitem', { name: /delete/i }).click();

    // Confirm deletion if a confirmation dialog appears
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmButton.click();
    }

    const countAfterDelete = await transactionsPage.getVisibleCount();
    expect(countAfterDelete).toBe(4);
  });

  // ── Step 13: Export CSV ──────────────────────────────────────────────────────
  await test.step('Export data as CSV from settings', async () => {
    await settingsPage.goto();

    // Set up download listener before clicking the button
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
    await settingsPage.exportCsv();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.csv$/i);
  });

  // ── Step 14: Logout and re-login ─────────────────────────────────────────────
  await test.step('Logout and verify redirect to login', async () => {
    await authPage.logout();
    await authPage.expectOnLogin();
  });

  await test.step('Re-login with same credentials and verify dashboard loads', async () => {
    await authPage.login(realUser.email, realUser.password);
    await authPage.expectOnDashboardOrOnboarding();

    // If we land on onboarding again, navigate to dashboard directly
    if (page.url().includes('/onboarding')) {
      await dashboardPage.goto();
    }
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
