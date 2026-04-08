import { expect, type Page } from 'playwright/test';

export class RealTransactionsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/transactions');
    await expect(this.page).toHaveURL(/\/transactions/);
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
    await this.page.getByTestId('transactions-add-button').click();
    await expect(this.page.getByTestId('transaction-form-drawer')).toBeVisible();

    if (opts.isTransfer) {
      // Toggle transfer mode
      await this.page.getByRole('switch').click();
    }

    await this.page.getByTestId('transaction-amount-input').fill(opts.amount);
    await this.page.getByTestId('transaction-description-input').fill(opts.description);
    await this.page.getByTestId('transaction-date-input').fill(opts.date);

    // Select category
    await this.page.getByTestId('transaction-category-select').click();
    await this.page.getByRole('option', { name: opts.category }).click();

    // Select from account
    await this.page.getByTestId('transaction-account-select').click();
    await this.page.getByRole('option', { name: opts.account }).click();

    if (opts.isTransfer && opts.toAccount) {
      await this.page.getByTestId('transaction-to-account-select').click();
      await this.page.getByRole('option', { name: opts.toAccount }).click();
    }

    if (opts.vendor) {
      await this.page.getByTestId('transaction-vendor-select').click();
      await this.page.getByRole('option', { name: opts.vendor }).click();
    }

    await this.page.getByTestId('transaction-form-submit').click();
    await expect(this.page.getByTestId('transaction-form-drawer')).not.toBeVisible();
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
    // Fallback: count transaction rows
    return this.page.locator('[data-testid^="transaction-row"]').count();
  }
}
