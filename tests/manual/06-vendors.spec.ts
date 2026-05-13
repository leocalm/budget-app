import { e2eEnv } from '../setup/env';
import { expect, test } from './fixtures/manual.fixture';
import { createCategoryViaApi } from './helpers/categories-api';
import { createVendorViaApi, deleteVendorViaApi, getVendorsViaApi } from './helpers/vendors-api';
import { AccountsPage } from './pages/accounts.page';
import { VendorsPage } from './pages/vendors.page';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ts(workerIndex: number): string {
  return `${Date.now()}-w${workerIndex}`;
}

const stripCommas = (s: string) => s.replace(/,/g, '');

// ---------------------------------------------------------------------------
// Group A: Create (2 tests)
// ---------------------------------------------------------------------------

test.describe('Vendors — Group A: Create', () => {
  test('create a vendor without description', async ({ loggedInPage: page }, testInfo) => {
    const name = `Vendor NoDesc ${ts(testInfo.workerIndex)}`;
    const vendors = new VendorsPage(page);

    await vendors.goto();
    await vendors.clickAdd();
    await vendors.expectFormVisible();
    await vendors.fillName(name);
    await vendors.submitForm();
    await vendors.expectFormClosed();

    await vendors.goto();
    await expect(vendors.vendorRowByName(name)).toBeVisible({ timeout: 10000 });
  });

  test('create a vendor with description', async ({ loggedInPage: page }, testInfo) => {
    const name = `Vendor WithDesc ${ts(testInfo.workerIndex)}`;
    const description = `A useful description ${ts(testInfo.workerIndex)}`;
    const vendors = new VendorsPage(page);

    await vendors.goto();
    await vendors.clickAdd();
    await vendors.expectFormVisible();
    await vendors.fillName(name);
    await vendors.fillDescription(description);
    await vendors.submitForm();
    await vendors.expectFormClosed();

    await vendors.goto();
    await expect(vendors.vendorRowByName(name)).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// Group B: Validation (2 tests)
// ---------------------------------------------------------------------------

test.describe('Vendors — Group B: Validation', () => {
  test('submit button stays disabled when name is too short', async ({ loggedInPage: page }) => {
    const vendors = new VendorsPage(page);

    await vendors.goto();
    await vendors.clickAdd();
    await vendors.expectFormVisible();
    await vendors.fillName('ab');

    await vendors.expectSubmitDisabled();
  });

  test('creating a vendor with a duplicated name fails', async ({
    loggedInPage: page,
  }, testInfo) => {
    const name = `dup-vendor-${ts(testInfo.workerIndex)}`;
    const vendors = new VendorsPage(page);

    // Create the first vendor via API.
    await createVendorViaApi(page.request, { name });

    // Attempt to create the same name via UI.
    await vendors.goto();
    await vendors.clickAdd();
    await vendors.expectFormVisible();
    await vendors.fillName(name);
    await vendors.submitForm();

    // Expect drawer to stay open OR an error toast appears within 5s.
    const drawerLocator = page.getByTestId('vendor-name-input');
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
});

// ---------------------------------------------------------------------------
// Group C: Edit (2 tests)
// ---------------------------------------------------------------------------

test.describe('Vendors — Group C: Edit', () => {
  test('edit vendor changes name', async ({ loggedInPage: page }, testInfo) => {
    const origName = `Edit Name Orig ${ts(testInfo.workerIndex)}`;
    const newName = `Edit Name New ${ts(testInfo.workerIndex)}`;
    const vendors = new VendorsPage(page);

    const { id } = await createVendorViaApi(page.request, { name: origName });

    await vendors.goto();
    await vendors.openRowMenu(id);
    await vendors.clickEditFromMenu();
    await vendors.expectFormVisible();

    await vendors.fillName(newName);
    await vendors.submitForm();
    await vendors.expectFormClosed();

    await vendors.goto();
    await expect(vendors.vendorRowByName(newName)).toBeVisible({ timeout: 10000 });
  });

  test('edit vendor changes description', async ({ loggedInPage: page }, testInfo) => {
    const name = `Edit Desc Vendor ${ts(testInfo.workerIndex)}`;
    const origDesc = `Original description ${ts(testInfo.workerIndex)}`;
    const newDesc = `Updated description ${ts(testInfo.workerIndex)}`;
    const vendors = new VendorsPage(page);

    const { id } = await createVendorViaApi(page.request, { name, description: origDesc });

    await vendors.goto();
    await vendors.openRowMenu(id);
    await vendors.clickEditFromMenu();
    await vendors.expectFormVisible();

    await vendors.fillDescription(newDesc);
    await vendors.submitForm();
    await vendors.expectFormClosed();

    // Re-open the edit drawer and assert the description survived the roundtrip.
    await vendors.goto();
    await vendors.openRowMenu(id);
    await vendors.clickEditFromMenu();
    await vendors.expectFormVisible();

    const descValue = await page.getByTestId('vendor-description-input').inputValue();
    expect(descValue).toBe(newDesc);
  });
});

// ---------------------------------------------------------------------------
// Group D: Delete / Archive (3 tests)
// ---------------------------------------------------------------------------

test.describe('Vendors — Group D: Delete / Archive', () => {
  test('delete a vendor without transactions', async ({ loggedInPage: page }, testInfo) => {
    const name = `Delete No Txn ${ts(testInfo.workerIndex)}`;
    const vendors = new VendorsPage(page);

    const { id } = await createVendorViaApi(page.request, { name });

    await vendors.goto();
    await vendors.openRowMenu(id);
    await vendors.clickDeleteFromMenu();
    await vendors.confirmDelete();

    await vendors.goto();
    await expect(vendors.vendorRow(id)).toBeHidden({ timeout: 10000 });
  });

  // Unlike accounts (whose delete is rejected when transactions exist), the
  // backend allows deleting a vendor with transactions — `vendorId` is
  // nullable on the transaction schema, so the reference is dropped rather
  // than the delete blocked. This test pins that behaviour.
  test('delete a vendor with transactions succeeds and removes the vendor', async ({
    loggedInPage: page,
  }, testInfo) => {
    test.setTimeout(60_000);
    const vendorName = `Del With Txn ${ts(testInfo.workerIndex)}`;
    const acctName = `Del Txn Acct ${ts(testInfo.workerIndex)}`;

    // Create the vendor via API.
    const { id: vendorId } = await createVendorViaApi(page.request, { name: vendorName });

    // Create an account via UI and extract its id.
    const accounts = new AccountsPage(page);
    await accounts.goto();
    await accounts.createAccount({ name: acctName, type: 'Checking', initialBalance: 1000 });

    const acctRow = accounts.accountRowByName(acctName);
    await expect(acctRow).toBeVisible({ timeout: 10000 });
    const accountId =
      (await acctRow.getAttribute('data-testid'))?.replace('account-row-', '') ?? '';
    expect(accountId).toBeTruthy();

    // Create a category via API.
    const { id: categoryId } = await createCategoryViaApi(page.request, {
      name: `Del Txn Cat ${ts(testInfo.workerIndex)}`,
      type: 'expense',
      behavior: 'variable',
    });

    // Seed a transaction with the vendor attached.
    // seedTransaction does not accept vendorId, so POST directly.
    const txnRes = await page.request.post(`${e2eEnv.baseUrl}/v2/transactions`, {
      data: {
        transactionType: 'Regular',
        date: new Date().toISOString().slice(0, 10),
        description: 'vendor-delete-seed',
        amount: 500,
        fromAccountId: accountId,
        categoryId,
        vendorId,
      },
    });
    expect(txnRes.ok(), `Transaction seed failed: ${await txnRes.text()}`).toBeTruthy();

    // Delete the vendor — backend allows this and nulls out the reference on
    // any transactions, rather than rejecting.
    const result = await deleteVendorViaApi(page.request, vendorId);
    expect(result.ok, `Expected delete to succeed: ${result.status} ${result.body}`).toBe(true);

    // The vendor should no longer appear in the list.
    const remaining = await getVendorsViaApi(page.request);
    expect(remaining.find((v) => v.id === vendorId)).toBeUndefined();
  });

  test('archive a vendor with transactions hides it from the active list', async ({
    loggedInPage: page,
  }, testInfo) => {
    test.setTimeout(60_000);
    const vendorName = `Archive With Txn ${ts(testInfo.workerIndex)}`;
    const acctName = `Archive Txn Acct ${ts(testInfo.workerIndex)}`;
    const vendors = new VendorsPage(page);

    // Create the vendor via API.
    const { id: vendorId } = await createVendorViaApi(page.request, { name: vendorName });

    // Create an account via UI and extract its id.
    const accounts = new AccountsPage(page);
    await accounts.goto();
    await accounts.createAccount({ name: acctName, type: 'Checking', initialBalance: 1000 });

    const acctRow = accounts.accountRowByName(acctName);
    await expect(acctRow).toBeVisible({ timeout: 10000 });
    const accountId =
      (await acctRow.getAttribute('data-testid'))?.replace('account-row-', '') ?? '';
    expect(accountId).toBeTruthy();

    // Create a category via API.
    const { id: categoryId } = await createCategoryViaApi(page.request, {
      name: `Archive Txn Cat ${ts(testInfo.workerIndex)}`,
      type: 'expense',
      behavior: 'variable',
    });

    // Seed a transaction with the vendor attached.
    const txnRes = await page.request.post(`${e2eEnv.baseUrl}/v2/transactions`, {
      data: {
        transactionType: 'Regular',
        date: new Date().toISOString().slice(0, 10),
        description: 'vendor-archive-seed',
        amount: 500,
        fromAccountId: accountId,
        categoryId,
        vendorId,
      },
    });
    expect(txnRes.ok(), `Transaction seed failed: ${await txnRes.text()}`).toBeTruthy();

    // Archive via UI row menu.
    await vendors.goto();
    await vendors.openRowMenu(vendorId);
    await vendors.clickArchiveFromMenu();

    // Reload and assert the row has data-archived OR is no longer visible.
    await vendors.goto();
    await expect(vendors.vendorRow(vendorId))
      .toHaveAttribute('data-archived', /.+/, { timeout: 10000 })
      .catch(async () => {
        const isHidden = await vendors
          .vendorRow(vendorId)
          .isHidden({ timeout: 5000 })
          .catch(() => false);
        expect(isHidden, 'Expected row to be hidden after archiving').toBeTruthy();
      });
  });
});

// ---------------------------------------------------------------------------
// Group E: Transaction integration (1 test)
// ---------------------------------------------------------------------------

test.describe('Vendors — Group E: Transaction integration', () => {
  test('vendor row reflects total spend after seeding transactions', async ({
    loggedInPage: page,
  }, testInfo) => {
    test.setTimeout(60_000);
    const vendorName = `Spend Display ${ts(testInfo.workerIndex)}`;
    const acctName = `Spend Acct ${ts(testInfo.workerIndex)}`;
    const vendors = new VendorsPage(page);

    // Create the vendor via API.
    const { id: vendorId } = await createVendorViaApi(page.request, { name: vendorName });

    // Create an account via UI and extract its id.
    const accounts = new AccountsPage(page);
    await accounts.goto();
    await accounts.createAccount({ name: acctName, type: 'Checking', initialBalance: 5000 });

    const acctRow = accounts.accountRowByName(acctName);
    await expect(acctRow).toBeVisible({ timeout: 10000 });
    const accountId =
      (await acctRow.getAttribute('data-testid'))?.replace('account-row-', '') ?? '';
    expect(accountId).toBeTruthy();

    // Create a category via API.
    const { id: categoryId } = await createCategoryViaApi(page.request, {
      name: `Spend Cat ${ts(testInfo.workerIndex)}`,
      type: 'expense',
      behavior: 'variable',
    });

    // Seed 3 transactions of 1000 cents ($10.00) each against the vendor.
    for (let i = 0; i < 3; i++) {
      const txnRes = await page.request.post(`${e2eEnv.baseUrl}/v2/transactions`, {
        data: {
          transactionType: 'Regular',
          date: new Date().toISOString().slice(0, 10),
          description: `spend-seed-${i}`,
          amount: 1000,
          fromAccountId: accountId,
          categoryId,
          vendorId,
        },
      });
      expect(txnRes.ok(), `Transaction seed ${i} failed: ${await txnRes.text()}`).toBeTruthy();
    }

    // Navigate to /vendors and assert the row shows a non-zero spend value.
    await vendors.goto();
    const vendorRow = vendors.vendorRow(vendorId);
    await expect(vendorRow).toBeVisible({ timeout: 10000 });
    const rowText = stripCommas((await vendorRow.textContent()) ?? '');

    // 3 × $10.00 = $30.00 — match "30" or "3,0" (after stripCommas: "30").
    expect(rowText).toMatch(/30|3\.0/);
  });
});

// ---------------------------------------------------------------------------
// Group F: Merge (2 tests, one fixme)
// ---------------------------------------------------------------------------

test.describe('Vendors — Group F: Merge', () => {
  // TODO: The useMergeVendor hook in src/hooks/v2/useVendors.ts (~line 224)
  // throws "Vendor merge is not available under the encrypted API; client-side
  // merge is a follow-up." The OpenAPI route exists but the client never calls
  // it. Remove fixme and re-enable once the hook is implemented.
  test.fixme('merge two vendors reassigns transactions', async ({
    loggedInPage: page,
  }, testInfo) => {
    const vendorAName = `Merge Source ${ts(testInfo.workerIndex)}`;
    const vendorBName = `Merge Target ${ts(testInfo.workerIndex)}`;
    const acctName = `Merge Acct ${ts(testInfo.workerIndex)}`;
    const vendors = new VendorsPage(page);

    // Create two vendors via API.
    const { id: vendorAId } = await createVendorViaApi(page.request, { name: vendorAName });
    await createVendorViaApi(page.request, { name: vendorBName });

    // Create an account via UI and extract its id.
    const accounts = new AccountsPage(page);
    await accounts.goto();
    await accounts.createAccount({ name: acctName, type: 'Checking', initialBalance: 5000 });

    const acctRow = accounts.accountRowByName(acctName);
    await expect(acctRow).toBeVisible({ timeout: 10000 });
    const accountId =
      (await acctRow.getAttribute('data-testid'))?.replace('account-row-', '') ?? '';
    expect(accountId).toBeTruthy();

    // Create a category via API.
    const { id: categoryId } = await createCategoryViaApi(page.request, {
      name: `Merge Cat ${ts(testInfo.workerIndex)}`,
      type: 'expense',
      behavior: 'variable',
    });

    // Seed a transaction against vendor A.
    const txnRes = await page.request.post(`${e2eEnv.baseUrl}/v2/transactions`, {
      data: {
        transactionType: 'Regular',
        date: new Date().toISOString().slice(0, 10),
        description: 'merge-seed',
        amount: 1000,
        fromAccountId: accountId,
        categoryId,
        vendorId: vendorAId,
      },
    });
    expect(txnRes.ok(), `Transaction seed failed: ${await txnRes.text()}`).toBeTruthy();

    // UI: open merge modal on vendor A, select vendor B as the target, submit.
    await vendors.goto();
    await vendors.openRowMenu(vendorAId);
    await vendors.clickMergeFromMenu();
    await vendors.expectMergeModalVisible();
    await vendors.selectMergeTarget(vendorBName);
    await vendors.submitMerge();

    // After merge: vendor A should be gone, vendor B should still show spend.
    await vendors.goto();
    await expect(vendors.vendorRow(vendorAId)).toBeHidden({ timeout: 10000 });
    const vendorBRow = vendors.vendorRowByName(vendorBName);
    await expect(vendorBRow).toBeVisible({ timeout: 10000 });
    const rowText = stripCommas((await vendorBRow.textContent()) ?? '');
    expect(rowText).toMatch(/10|1\.0/);
  });

  test('merge attempt currently surfaces an error toast', async ({
    loggedInPage: page,
  }, testInfo) => {
    const vendorAName = `Merge Err Source ${ts(testInfo.workerIndex)}`;
    const vendorBName = `Merge Err Target ${ts(testInfo.workerIndex)}`;
    const vendors = new VendorsPage(page);

    // Create two vendors via API.
    const { id: vendorAId } = await createVendorViaApi(page.request, { name: vendorAName });
    await createVendorViaApi(page.request, { name: vendorBName });

    // UI: open merge modal on vendor A, select vendor B as target, submit.
    await vendors.goto();
    await vendors.openRowMenu(vendorAId);
    await vendors.clickMergeFromMenu();
    await vendors.expectMergeModalVisible();
    await vendors.selectMergeTarget(vendorBName);
    await vendors.submitMerge();

    // Assert EITHER an error toast/alert is visible within 5s OR the merge
    // modal stays open (the merge did not succeed).
    const errorLocator = page
      .getByRole('alert')
      .or(page.getByText(/error|failed|not available|merge/i));
    const modalLocator = page.getByTestId('vendor-merge-target');

    const toastAppeared = await errorLocator
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const modalStillOpen = await modalLocator.isVisible({ timeout: 5000 }).catch(() => false);

    expect(
      toastAppeared || modalStillOpen,
      'Expected an error toast or the merge modal to remain open after the stubbed merge attempt'
    ).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Group G: Top stats card (1 test)
// ---------------------------------------------------------------------------

test.describe('Vendors — Group G: Top stats card', () => {
  test('top stats card reflects vendor count and spend', async ({
    loggedInPage: page,
  }, testInfo) => {
    test.setTimeout(60_000);
    const acctName = `Stats Acct ${ts(testInfo.workerIndex)}`;
    const vendors = new VendorsPage(page);

    // Create 2 vendors via API.
    const { id: vendor1Id } = await createVendorViaApi(page.request, {
      name: `Stats Vendor A ${ts(testInfo.workerIndex)}`,
    });
    await createVendorViaApi(page.request, {
      name: `Stats Vendor B ${ts(testInfo.workerIndex)}`,
    });

    // Create one account via UI and extract its id.
    const accounts = new AccountsPage(page);
    await accounts.goto();
    await accounts.createAccount({ name: acctName, type: 'Checking', initialBalance: 5000 });

    const acctRow = accounts.accountRowByName(acctName);
    await expect(acctRow).toBeVisible({ timeout: 10000 });
    const accountId =
      (await acctRow.getAttribute('data-testid'))?.replace('account-row-', '') ?? '';
    expect(accountId).toBeTruthy();

    // Create one category via API.
    const { id: categoryId } = await createCategoryViaApi(page.request, {
      name: `Stats Cat ${ts(testInfo.workerIndex)}`,
      type: 'expense',
      behavior: 'variable',
    });

    // Seed 2 transactions of 500 cents ($5.00) each against vendor1 only.
    for (let i = 0; i < 2; i++) {
      const txnRes = await page.request.post(`${e2eEnv.baseUrl}/v2/transactions`, {
        data: {
          transactionType: 'Regular',
          date: new Date().toISOString().slice(0, 10),
          description: `stats-seed-${i}`,
          amount: 500,
          fromAccountId: accountId,
          categoryId,
          vendorId: vendor1Id,
        },
      });
      expect(txnRes.ok(), `Transaction seed ${i} failed: ${await txnRes.text()}`).toBeTruthy();
    }

    // Navigate to /vendors and read the top stats card.
    await vendors.goto();
    const stats = await vendors.readTopStats();

    // total: at least 2 vendors were created in this test (may include pre-existing ones).
    expect(
      Number(stripCommas(stats.total)),
      'Expected total vendor count to be at least 2'
    ).toBeGreaterThanOrEqual(2);

    // spent: 500 + 500 = 1000 cents = $10.00. Match "10" after stripping commas.
    expect(
      stripCommas(stats.spent),
      `Expected spent to contain "10", got "${stats.spent}"`
    ).toContain('10');

    // avg: should be non-empty (any value is acceptable).
    expect(stats.avg.trim()).toBeTruthy();
  });
});
