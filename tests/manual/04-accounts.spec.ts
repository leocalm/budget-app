import { expect, test } from './fixtures/manual.fixture';
import { getDefaultCategoryId, seedTransaction } from './helpers/accounts-api';
import { AccountsPage } from './pages/accounts.page';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ts(workerIndex: number): string {
  return `${Date.now()}-w${workerIndex}`;
}

// ---------------------------------------------------------------------------
// Group A: Create variants
// ---------------------------------------------------------------------------

test.describe('Accounts — Group A: Create variants', () => {
  test('create a Checking account', async ({ loggedInPage: page }, testInfo) => {
    const label = `Manual Checking ${ts(testInfo.workerIndex)}`;
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.createAccount({ name: label, type: 'Checking', initialBalance: 1000 });

    await expect(accounts.accountRowByName(label)).toBeVisible({ timeout: 10000 });
  });

  test('create a Savings account', async ({ loggedInPage: page }, testInfo) => {
    const label = `Manual Savings ${ts(testInfo.workerIndex)}`;
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.createAccount({ name: label, type: 'Savings', initialBalance: 5000 });

    await expect(accounts.accountRowByName(label)).toBeVisible({ timeout: 10000 });
  });

  test('create a Wallet account', async ({ loggedInPage: page }, testInfo) => {
    const label = `Manual Wallet ${ts(testInfo.workerIndex)}`;
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.createAccount({ name: label, type: 'Wallet', initialBalance: 50 });

    await expect(accounts.accountRowByName(label)).toBeVisible({ timeout: 10000 });
  });

  test('create a Credit Card without spending limit', async ({ loggedInPage: page }, testInfo) => {
    const label = `Manual CC NoLimit ${ts(testInfo.workerIndex)}`;
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.createAccount({ name: label, type: 'CreditCard', initialBalance: 0 });

    await expect(accounts.accountRowByName(label)).toBeVisible({ timeout: 10000 });
  });

  test('create a Credit Card with spending limit', async ({ loggedInPage: page }, testInfo) => {
    const label = `Manual CC Limit ${ts(testInfo.workerIndex)}`;
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.createAccount({
      name: label,
      type: 'CreditCard',
      initialBalance: 0,
      spendLimit: 2000,
    });

    await expect(accounts.accountRowByName(label)).toBeVisible({ timeout: 10000 });
  });

  test('create an Allowance account without spending limit', async ({
    loggedInPage: page,
  }, testInfo) => {
    const label = `Manual Allowance ${ts(testInfo.workerIndex)}`;
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.createAccount({ name: label, type: 'Allowance', initialBalance: 100 });

    await expect(accounts.accountRowByName(label)).toBeVisible({ timeout: 10000 });
  });

  test('create an Allowance account with spending limit', async ({
    loggedInPage: page,
  }, testInfo) => {
    const label = `Manual Allowance Limit ${ts(testInfo.workerIndex)}`;
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.createAccount({
      name: label,
      type: 'Allowance',
      initialBalance: 100,
      spendLimit: 500,
    });

    await expect(accounts.accountRowByName(label)).toBeVisible({ timeout: 10000 });
  });

  test('create an account without filling the initial balance', async ({
    loggedInPage: page,
  }, testInfo) => {
    const label = `Manual NoBalance ${ts(testInfo.workerIndex)}`;
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.clickAddAccount();
    await accounts.expectFormDrawerVisible();
    await accounts.selectAccountType('Checking');
    await accounts.fillName(label);
    // intentionally skip fillInitialBalance — defaults to 0
    await accounts.submitForm();
    await accounts.expectFormDrawerClosed();

    await expect(accounts.accountRowByName(label)).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// Group B: Validation
// ---------------------------------------------------------------------------

test.describe('Accounts — Group B: Validation', () => {
  test('submit button stays disabled for invalid name (under 3 chars)', async ({
    loggedInPage: page,
  }) => {
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.clickAddAccount();
    await accounts.expectFormDrawerVisible();
    await accounts.selectAccountType('Checking');
    await accounts.fillName('ab');

    await accounts.expectSubmitDisabled();
  });

  test('submit fails for already used name', async ({ loggedInPage: page }, testInfo) => {
    const label = `dup-${ts(testInfo.workerIndex)}`;
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.createAccount({ name: label, type: 'Checking', initialBalance: 0 });

    // Attempt to create another with the same name
    await accounts.clickAddAccount();
    await accounts.expectFormDrawerVisible();
    await accounts.selectAccountType('Checking');
    await accounts.fillName(label);
    await accounts.submitForm();

    // The API will reject this — form should stay open (drawer still visible)
    // OR a toast error appears within 5 s.
    const drawerLocator = page.getByTestId('account-form-drawer');
    const toastLocator = page
      .getByRole('alert')
      .or(page.getByText(/error|failed|duplicate|already/i));

    const drawerStillOpen = await drawerLocator.isVisible({ timeout: 5000 }).catch(() => false);
    const toastAppeared = await toastLocator
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    expect(
      drawerStillOpen || toastAppeared,
      'Expected drawer to stay open or error toast to appear'
    ).toBeTruthy();
  });

  test('invalid color is normalized or rejected', async ({ loggedInPage: page }, testInfo) => {
    // test.skip if we can't reliably probe ColorInput behavior
    const label = `Color Test ${ts(testInfo.workerIndex)}`;
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.clickAddAccount();
    await accounts.expectFormDrawerVisible();
    await accounts.selectAccountType('Checking');
    await accounts.fillName(label);

    // Attempt to type a non-hex string into the color input.
    // Mantine ColorInput doesn't forward data-testid to its inner input, so
    // target the textbox by its accessible label.
    const colorInput = page.getByRole('textbox', { name: 'Color' });
    await colorInput.click({ clickCount: 3 });
    await colorInput.fill('notacolor');
    await colorInput.press('Tab');

    const inputValue = await colorInput.inputValue();
    // Mantine ColorInput should sanitize; value should not be the raw "notacolor" string
    // Accept: empty, "#", "#notacolor" normalised to something valid, or simply the previous valid value
    const isValidOrNormalized =
      !inputValue.includes('notacolor') || /^#?[0-9A-Fa-f]{0,6}$/.test(inputValue);
    expect(isValidOrNormalized, `Color input accepted invalid value: "${inputValue}"`).toBeTruthy();
  });

  test('invalid balance (non-numeric) is rejected by NumberInput', async ({
    loggedInPage: page,
  }, testInfo) => {
    const label = `NonNumericBal ${ts(testInfo.workerIndex)}`;
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.clickAddAccount();
    await accounts.expectFormDrawerVisible();
    await accounts.selectAccountType('Checking');
    await accounts.fillName(label);

    // Attempt to fill a non-numeric value; NumberInput strips it
    const balInput = page.getByTestId('account-balance-input');
    await balInput.fill('abc');
    await balInput.press('Tab');

    const value = await balInput.inputValue();
    expect(value, 'NumberInput should not contain "abc"').not.toBe('abc');

    // Should still be submittable (resulting in 0 balance)
    await accounts.submitForm();
    await accounts.expectFormDrawerClosed();
    await expect(accounts.accountRowByName(label)).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// Group C: Edit
// ---------------------------------------------------------------------------

test.describe('Accounts — Group C: Edit', () => {
  test('edit account changes color', async ({ loggedInPage: page }, testInfo) => {
    const label = `Edit Color ${ts(testInfo.workerIndex)}`;
    const newColor = '#5BA8A0';
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.createAccount({ name: label, type: 'Checking', initialBalance: 0 });

    // Find the account row and get its id
    const row = accounts.accountRowByName(label);
    await expect(row).toBeVisible({ timeout: 10000 });
    const accountId = (await row.getAttribute('data-testid'))?.replace('account-row-', '') ?? '';
    expect(accountId, 'Could not extract account id from row').toBeTruthy();

    // Open kebab → edit
    await accounts.openRowMenu(accountId);
    await accounts.clickEditFromMenu();
    await accounts.expectFormDrawerVisible();

    await accounts.fillColor(newColor);
    await accounts.submitForm();
    await accounts.expectFormDrawerClosed();

    // Reload and re-open the edit drawer to verify the new color persisted.
    await accounts.goto();
    await accounts.openRowMenu(accountId);
    await accounts.clickEditFromMenu();
    await accounts.expectFormDrawerVisible();
    const colorValue = await page.getByRole('textbox', { name: 'Color' }).inputValue();
    expect(colorValue.toUpperCase()).toBe(newColor.toUpperCase());
  });

  test('edit account changes name', async ({ loggedInPage: page }, testInfo) => {
    const label = `Edit Name Orig ${ts(testInfo.workerIndex)}`;
    const newName = `Renamed-${ts(testInfo.workerIndex)}`;
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.createAccount({ name: label, type: 'Checking', initialBalance: 0 });

    const row = accounts.accountRowByName(label);
    await expect(row).toBeVisible({ timeout: 10000 });
    const accountId = (await row.getAttribute('data-testid'))?.replace('account-row-', '') ?? '';

    await accounts.openRowMenu(accountId);
    await accounts.clickEditFromMenu();
    await accounts.expectFormDrawerVisible();

    await accounts.fillName(newName);
    await accounts.submitForm();
    await accounts.expectFormDrawerClosed();

    await expect(accounts.accountRowByName(newName)).toBeVisible({ timeout: 10000 });
  });

  // TODO: re-enable once we can reliably replace a populated Mantine NumberInput
  // value from Playwright. selectText + pressSequentially, fill(), and the
  // React-friendly native input-setter all leave the field at its pre-populated
  // value. May also need the backend to honour initialBalance updates via PUT
  // (there is a separate /accounts/{id}/adjust-balance endpoint).
  test.fixme('edit account changes initial balance', async ({ loggedInPage: page }, testInfo) => {
    const label = `Edit Balance ${ts(testInfo.workerIndex)}`;
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.createAccount({ name: label, type: 'Checking', initialBalance: 100 });

    const row = accounts.accountRowByName(label);
    await expect(row).toBeVisible({ timeout: 10000 });
    const accountId = (await row.getAttribute('data-testid'))?.replace('account-row-', '') ?? '';

    await accounts.openRowMenu(accountId);
    await accounts.clickEditFromMenu();
    await accounts.expectFormDrawerVisible();

    await accounts.fillInitialBalance(250);
    await accounts.submitForm();
    await accounts.expectFormDrawerClosed();

    // Reload the page to get fresh data and assert the balance
    await accounts.goto();
    const updatedRow = accounts.accountRow(accountId);
    await expect(updatedRow).toBeVisible({ timeout: 10000 });
    const rowText = await updatedRow.textContent();
    expect(rowText).toContain('250');
  });
});

// ---------------------------------------------------------------------------
// Group D: Delete / Archive
// ---------------------------------------------------------------------------

test.describe('Accounts — Group D: Delete / Archive', () => {
  test('delete an account without transactions', async ({ loggedInPage: page }, testInfo) => {
    const label = `Delete No Txn ${ts(testInfo.workerIndex)}`;
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.createAccount({ name: label, type: 'Checking', initialBalance: 0 });

    const row = accounts.accountRowByName(label);
    await expect(row).toBeVisible({ timeout: 10000 });
    const accountId = (await row.getAttribute('data-testid'))?.replace('account-row-', '') ?? '';
    expect(accountId).toBeTruthy();

    await accounts.openRowMenu(accountId);
    expect(await accounts.isDeleteMenuItemVisible()).toBe(true);
    await accounts.clickDeleteFromMenu();
    await accounts.confirmDelete();

    await accounts.goto();
    await expect(accounts.accountRow(accountId)).toBeHidden({ timeout: 10000 });
  });

  test('with transactions the row menu shows Archive but not Delete', async ({
    loggedInPage: page,
  }, testInfo) => {
    const label = `Delete With Txn ${ts(testInfo.workerIndex)}`;
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.createAccount({ name: label, type: 'Checking', initialBalance: 500 });

    const row = accounts.accountRowByName(label);
    await expect(row).toBeVisible({ timeout: 10000 });
    const accountId = (await row.getAttribute('data-testid'))?.replace('account-row-', '') ?? '';
    expect(accountId).toBeTruthy();

    const categoryId = await getDefaultCategoryId(page.request);
    await seedTransaction(page.request, {
      fromAccountId: accountId,
      categoryId,
      amount: 500,
      description: 'block-delete-seed',
    });

    await accounts.goto();
    await accounts.openRowMenu(accountId);
    expect(await accounts.isArchiveMenuItemVisible()).toBe(true);
    expect(await accounts.isDeleteMenuItemVisible()).toBe(false);
  });

  test('archive an account with transactions hides it from the active list', async ({
    loggedInPage: page,
  }, testInfo) => {
    const label = `Archive Txn ${ts(testInfo.workerIndex)}`;
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.createAccount({ name: label, type: 'Checking', initialBalance: 500 });

    const row = accounts.accountRowByName(label);
    await expect(row).toBeVisible({ timeout: 10000 });
    const accountId = (await row.getAttribute('data-testid'))?.replace('account-row-', '') ?? '';
    expect(accountId).toBeTruthy();

    const categoryId = await getDefaultCategoryId(page.request);
    await seedTransaction(page.request, {
      fromAccountId: accountId,
      categoryId,
      amount: 500,
      description: 'archive-seed',
    });

    // Reload so the row's numberOfTransactions reflects the seeded txn and
    // the menu switches from Delete (when 0) to Archive (when > 0).
    await accounts.goto();
    await accounts.openRowMenu(accountId);
    await accounts.clickArchiveFromMenu();

    // Wait for the row to disappear from the active list or gain data-archived
    await expect(accounts.accountRow(accountId))
      .toHaveAttribute('data-archived', /.+/, { timeout: 10000 })
      .catch(async () => {
        // Fallback: row may be hidden entirely (collapsed archived section)
        const isHidden = await accounts
          .accountRow(accountId)
          .isHidden({ timeout: 5000 })
          .catch(() => false);
        expect(isHidden, 'Expected row to be hidden after archiving').toBeTruthy();
      });
  });
});

// ---------------------------------------------------------------------------
// Group E: Transaction integration
// ---------------------------------------------------------------------------

test.describe('Accounts — Group E: Transaction integration', () => {
  test('account row shows correct transaction count and balance after seeding', async ({
    loggedInPage: page,
  }, testInfo) => {
    test.setTimeout(60_000);
    const label = `Txn Count ${ts(testInfo.workerIndex)}`;
    const accounts = new AccountsPage(page);

    await accounts.goto();
    await accounts.createAccount({ name: label, type: 'Checking', initialBalance: 500 });

    const row = accounts.accountRowByName(label);
    await expect(row).toBeVisible({ timeout: 10000 });
    const accountId = (await row.getAttribute('data-testid'))?.replace('account-row-', '') ?? '';
    expect(accountId).toBeTruthy();

    const categoryId = await getDefaultCategoryId(page.request);

    // Seed 3 transactions of 1000 cents ($10.00) each
    for (let i = 0; i < 3; i++) {
      await seedTransaction(page.request, {
        fromAccountId: accountId,
        categoryId,
        amount: 1000,
        description: `seed-txn-${i}`,
      });
    }

    // Reload to get fresh data
    await accounts.goto();

    const updatedRow = accounts.accountRow(accountId);
    await expect(updatedRow).toBeVisible({ timeout: 10000 });
    const rowText = await updatedRow.textContent();

    // 3 transactions
    expect(rowText).toMatch(/3/);

    // initialBalance 500 USD = 50000 cents, minus 3 * 1000 cents = 47000 cents → $470.00
    expect(rowText).toContain('470');
  });

  test('net position card shows correct Liquid / Protected / Debt buckets and variation', async ({
    loggedInPage: page,
  }, testInfo) => {
    test.setTimeout(60_000);
    const accounts = new AccountsPage(page);
    const suffix = ts(testInfo.workerIndex);

    await accounts.goto();
    await accounts.createAccount({
      name: `NP Checking ${suffix}`,
      type: 'Checking',
      initialBalance: 1000,
    });
    await accounts.createAccount({
      name: `NP Savings ${suffix}`,
      type: 'Savings',
      initialBalance: 2000,
    });
    await accounts.createAccount({
      name: `NP CreditCard ${suffix}`,
      type: 'CreditCard',
      initialBalance: 500,
    });

    // Find the Checking account ID for seeding
    const checkingRow = accounts.accountRowByName(`NP Checking ${suffix}`);
    await expect(checkingRow).toBeVisible({ timeout: 10000 });
    const checkingId =
      (await checkingRow.getAttribute('data-testid'))?.replace('account-row-', '') ?? '';
    expect(checkingId).toBeTruthy();

    const categoryId = await getDefaultCategoryId(page.request);
    // Seed 1 transaction of 100 cents ($1.00) — differenceThisPeriod becomes -$1.00
    await seedTransaction(page.request, {
      fromAccountId: checkingId,
      categoryId,
      amount: 100,
      description: 'net-pos-seed',
    });

    // Reload
    await accounts.goto();

    const netPos = await accounts.readNetPosition();
    // Currency values are rendered with thousands separators (e.g. "$ 2,000.00"),
    // so strip them before substring-matching the expected amount.
    const stripCommas = (s: string) => s.replace(/,/g, '');

    // Liquid: Checking ($999.00 after the $1.00 expense) + Wallet types
    expect(stripCommas(netPos.liquid)).toContain('999');

    // Protected: Savings accounts — $2000.00
    expect(stripCommas(netPos.protected)).toContain('2000');

    // Debt: CreditCard — $500.00 (shown when debtAmount > 0)
    if (netPos.debt !== null) {
      expect(stripCommas(netPos.debt)).toContain('500');
    }

    // Variation: should show a non-zero negative amount for the $1.00 expense.
    // Currency display drops trailing zeros for whole amounts (e.g. "-$ 1").
    expect(netPos.difference).toMatch(/-.*1/);
  });
});
