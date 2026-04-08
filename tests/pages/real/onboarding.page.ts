import { expect, type Page } from 'playwright/test';

export class RealOnboardingPage {
  constructor(private readonly page: Page) {}

  async skipToEnd(): Promise<void> {
    await expect(this.page).toHaveURL(/\/onboarding/);

    // Keep clicking Next/Skip until we reach the dashboard or the final step
    const maxSteps = 10;
    for (let i = 0; i < maxSteps; i++) {
      const skipButton = this.page.getByTestId('onboarding-skip');
      const nextButton = this.page.getByTestId('onboarding-next');
      const goToDashboard = this.page.getByTestId('onboarding-go-to-dashboard');

      if (await goToDashboard.isVisible({ timeout: 500 }).catch(() => false)) {
        await goToDashboard.click();
        break;
      }

      if (await skipButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await skipButton.click();
        continue;
      }

      if (await nextButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await nextButton.click();
        continue;
      }

      break;
    }
  }

  async expectOnDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/\/dashboard/);
  }
}
