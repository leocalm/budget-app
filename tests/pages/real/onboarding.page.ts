import { expect, type Page } from 'playwright/test';

export class RealOnboardingPage {
  constructor(private readonly page: Page) {}

  async skipToEnd(): Promise<void> {
    await expect(this.page).toHaveURL(/\/onboarding/);

    // Dismiss cookie banner if it's blocking
    await this.page
      .getByRole('region', { name: 'Cookie consent' })
      .getByRole('button', { name: 'Accept' })
      .click({ timeout: 3000 })
      .catch(() => {});
    await this.page.waitForTimeout(300);

    // Click through onboarding steps until we reach the dashboard.
    for (let i = 0; i < 15; i++) {
      if (!this.page.url().includes('/onboarding')) {
        break;
      }

      // Currency step: select Euro if the currency list is visible
      const euroOption = this.page.getByText('Euro', { exact: true });
      if (await euroOption.isVisible({ timeout: 1000 }).catch(() => false)) {
        await euroOption.click();
        await this.page.waitForTimeout(300);
      }

      // Try each button in priority order (longer timeout for page transitions)
      for (const testId of ['onboarding-go-to-dashboard', 'onboarding-skip', 'onboarding-next']) {
        const btn = this.page.getByTestId(testId);
        if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await btn.click();
          await this.page.waitForTimeout(500);
          break;
        }
      }
    }
  }

  async expectOnDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  }
}
