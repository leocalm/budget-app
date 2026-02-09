import { BasePage } from '../base.page';

export class MobileTransactionsPage extends BasePage {
  async openFromBottomNavigation(): Promise<void> {
    await this.page.getByRole('button', { name: 'Transactions' }).click();
  }
}
