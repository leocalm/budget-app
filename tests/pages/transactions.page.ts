import { BasePage } from './base.page';

export class TransactionsPage extends BasePage {
  async gotoPage(): Promise<void> {
    await this.goto('/transactions');
  }
}
