import { expect, type Locator, type Page } from 'playwright/test';

export class RealTransactionsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/transactions');
    await expect(this.page).toHaveURL(/\/transactions/);
  }

  /** Click a Mantine Select (data-testid is on the input) and pick an option by partial text. */
  private async selectOption(locator: Locator, optionName: string): Promise<void> {
    await locator.click();
    await this.page.getByRole('option').filter({ hasText: optionName }).first().click();
  }

  async createTransaction(opts: {
    amount: string;
    description: string;
    category: string;
    account: string;
    date: string;
    vendor?: string;
    isTransfer?: boolean;
    toAccount?: string;
  }): Promise<void> {
    // Ensure any previously open drawer is closed
    const amountInput = this.page.getByTestId('transaction-amount-input');
    if (await amountInput.isVisible({ timeout: 500 }).catch(() => false)) {
      await this.page.keyboard.press('Escape');
      await expect(amountInput)
        .not.toBeVisible({ timeout: 3000 })
        .catch(() => {});
    }

    // Open the transaction form drawer
    await this.page.getByTestId('transactions-add-button').dispatchEvent('click');

    await expect(amountInput).toBeVisible();

    if (opts.isTransfer) {
      await this.page.getByRole('switch').click();
    }

    await amountInput.click();
    await amountInput.fill('');
    await amountInput.pressSequentially(opts.amount);
    await this.page.getByTestId('transaction-date-input').fill(opts.date);

    await this.selectOption(this.page.getByTestId('transaction-category-select'), opts.category);
    await this.selectOption(this.page.getByTestId('transaction-account-select'), opts.account);

    if (opts.isTransfer && opts.toAccount) {
      await this.selectOption(
        this.page.getByTestId('transaction-to-account-select'),
        opts.toAccount
      );
    }

    if (opts.vendor) {
      await this.selectOption(this.page.getByTestId('transaction-vendor-select'), opts.vendor);
    }

    await this.page.getByTestId('transaction-description-input').fill(opts.description);
    await this.page.getByTestId('transaction-form-submit').click();

    // Wait for API call to complete (button re-enables after loading)
    await expect(this.page.getByTestId('transaction-form-submit')).toBeEnabled({
      timeout: 10000,
    });
    // Verify no error toast appeared
    const errorToast = this.page.getByRole('alert').filter({ hasText: /failed|error/i });
    if (await errorToast.isVisible({ timeout: 500 }).catch(() => false)) {
      const msg = await errorToast.textContent();
      throw new Error(`Transaction creation failed: ${msg}`);
    }
    // Close the drawer (stays open for consecutive entries)
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }

  async filterByType(type: 'all' | 'incoming' | 'outgoing' | 'transfer'): Promise<void> {
    await this.page.getByTestId(`transactions-filter-${type}`).click();
  }

  async getVisibleCount(): Promise<number> {
    const countEl = this.page.getByTestId('transactions-count');
    if (await countEl.isVisible({ timeout: 2000 }).catch(() => false)) {
      const text = await countEl.textContent();
      const match = text?.match(/\d+/);
      return match ? Number.parseInt(match[0], 10) : 0;
    }
    return this.page.locator('[data-testid^="transaction-row"]').count();
  }
}
