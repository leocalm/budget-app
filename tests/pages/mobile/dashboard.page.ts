import { BasePage } from '../base.page';

export class MobileDashboardPage extends BasePage {
  async openFromBottomNavigation(): Promise<void> {
    await this.page.getByRole('button', { name: 'Dashboard' }).click();
  }
}
