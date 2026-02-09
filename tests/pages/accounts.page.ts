import { BasePage } from './base.page';

export class AccountsPage extends BasePage {
  async gotoPage(): Promise<void> {
    await this.goto('/accounts');
  }
}
