import { expect, type Locator, type Page } from 'playwright/test';

export type AccountType = 'Checking' | 'Savings' | 'CreditCard' | 'Wallet' | 'Allowance';

export interface CreateAccountOpts {
  name: string;
  type?: AccountType;
  initialBalance?: number;
  spendLimit?: number;
  color?: string;
}

export interface NetPosition {
  total: string;
  difference: string;
  liquid: string;
  protected: string;
  debt: string | null;
}

export class AccountsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/accounts');
    await expect(this.page.getByTestId('accounts-add-button')).toBeVisible({ timeout: 15000 });
  }

  async clickAddAccount(): Promise<void> {
    await this.page.getByTestId('accounts-add-button').click();
  }

  async selectAccountType(type: AccountType): Promise<void> {
    await this.page.getByTestId(`account-type-${type}`).click();
  }

  async fillName(name: string): Promise<void> {
    await this.page.getByTestId('account-name-input').fill(name);
  }

  async fillInitialBalance(value: number | string): Promise<void> {
    await this.clearAndType(this.page.getByTestId('account-balance-input'), String(value));
  }

  async fillSpendLimit(value: number | string): Promise<void> {
    await this.clearAndType(this.page.getByTestId('account-spend-limit-input'), String(value));
  }

  private async clearAndType(input: Locator, value: string): Promise<void> {
    // Mantine NumberInput wraps react-number-format which intercepts user
    // input, so Locator.fill() / pressSequentially can be inconsistent on
    // pre-populated fields. Drive the native input setter + dispatch the
    // input event the way React's synthetic-event system expects.
    await input.evaluate((el: HTMLInputElement, val: string) => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      setter?.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
    await input.press('Tab');
  }

  async fillColor(hex: string): Promise<void> {
    // Mantine ColorInput's data-testid is not forwarded to the inner input,
    // so target the textbox by its accessible label.
    const input = this.page.getByRole('textbox', { name: 'Color' });
    await input.click({ clickCount: 3 });
    await input.fill(hex);
    await input.press('Tab');
  }

  async submitForm(): Promise<void> {
    await this.page.getByTestId('account-form-submit').click();
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.page.getByTestId('account-form-submit')).toBeDisabled();
  }

  async expectSubmitEnabled(): Promise<void> {
    await expect(this.page.getByTestId('account-form-submit')).toBeEnabled();
  }

  async expectFormDrawerVisible(): Promise<void> {
    // Mantine Drawer keeps the root in the DOM and lazy-mounts its content,
    // so assert on a field inside the form instead of the root testid.
    await expect(this.page.getByTestId('account-name-input')).toBeVisible({ timeout: 10000 });
  }

  async expectFormDrawerClosed(): Promise<void> {
    await expect(this.page.getByTestId('account-name-input')).toBeHidden({ timeout: 15000 });
  }

  async createAccount(opts: CreateAccountOpts): Promise<void> {
    await this.clickAddAccount();
    await this.expectFormDrawerVisible();

    if (opts.type) {
      await this.selectAccountType(opts.type);
    }

    await this.fillName(opts.name);

    if (opts.initialBalance !== undefined) {
      await this.fillInitialBalance(opts.initialBalance);
    }

    if (opts.spendLimit !== undefined) {
      await this.fillSpendLimit(opts.spendLimit);
    }

    if (opts.color !== undefined) {
      await this.fillColor(opts.color);
    }

    await this.submitForm();
    await this.expectFormDrawerClosed();
  }

  accountRow(accountId: string): Locator {
    return this.page.getByTestId(`account-row-${accountId}`);
  }

  accountRowByName(name: string): Locator {
    return this.page.locator(`[data-testid^="account-row-"]:has-text("${name}")`).first();
  }

  async openRowMenu(accountId: string): Promise<void> {
    await this.page.getByTestId(`account-row-${accountId}-menu`).click();
  }

  async clickEditFromMenu(): Promise<void> {
    await this.page.getByTestId('account-menu-edit').click();
  }

  async clickArchiveFromMenu(): Promise<void> {
    await this.page.getByTestId('account-menu-archive').click();
  }

  async clickUnarchiveFromMenu(): Promise<void> {
    await this.page.getByTestId('account-menu-unarchive').click();
  }

  async clickViewDetailsFromMenu(): Promise<void> {
    await this.page.getByTestId('account-menu-view-details').click();
  }

  async clickDeleteFromMenu(): Promise<void> {
    await this.page.getByTestId('account-menu-delete').click();
  }

  async confirmDelete(): Promise<void> {
    // Mantine Modal keeps the root in the DOM and lazy-mounts its content,
    // so assert on the confirm button (which only exists when the modal is open).
    await expect(this.page.getByTestId('confirm-delete-confirm')).toBeVisible({ timeout: 5000 });
    await this.page.getByTestId('confirm-delete-confirm').click();
    await expect(this.page.getByTestId('confirm-delete-confirm')).toBeHidden({ timeout: 10000 });
  }

  async cancelDelete(): Promise<void> {
    await this.page.getByTestId('confirm-delete-cancel').click();
  }

  async isDeleteMenuItemVisible(): Promise<boolean> {
    // Note: Playwright's isVisible() does NOT wait — its timeout arg is ignored.
    // Use waitFor to actually wait for the portal-rendered menu item to mount.
    return this.page
      .getByTestId('account-menu-delete')
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);
  }

  async isArchiveMenuItemVisible(): Promise<boolean> {
    return this.page
      .getByTestId('account-menu-archive')
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);
  }

  async readNetPosition(): Promise<NetPosition> {
    const total = (await this.page.getByTestId('account-net-position-value').textContent()) ?? '';
    const difference = (await this.page.getByTestId('net-position-difference').textContent()) ?? '';
    const liquid = (await this.page.getByTestId('net-position-liquid').textContent()) ?? '';
    const protectedText =
      (await this.page.getByTestId('net-position-protected').textContent()) ?? '';

    const debtLocator = this.page.getByTestId('net-position-debt');
    const debtVisible = await debtLocator.isVisible().catch(() => false);
    const debt = debtVisible ? ((await debtLocator.textContent()) ?? '') : null;

    return { total, difference, liquid, protected: protectedText, debt };
  }

  async readRowBalance(accountId: string): Promise<string> {
    return (
      (await this.accountRow(accountId)
        .locator('.balanceCell, [class*="balanceCell"]')
        .textContent()) ??
      (await this.accountRow(accountId).textContent()) ??
      ''
    );
  }

  async readRowTransactionCount(accountId: string): Promise<string> {
    return (
      (await this.accountRow(accountId)
        .locator('[class*="accountMeta"] [class*="dimmed"]')
        .first()
        .textContent()) ?? ''
    );
  }
}
