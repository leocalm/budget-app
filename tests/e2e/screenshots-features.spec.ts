import { test } from '../fixtures/auth.fixture';

test.describe('Feature Screenshots - Overlays & Toasts', () => {
  test('capture overlay primitives and toast notifications', async ({
    authenticatedPage,
  }, testInfo) => {
    await authenticatedPage.goto('/overlays');

    // Wait for the page to load
    await authenticatedPage.waitForSelector('[data-testid="app-shell-main"]');
    await authenticatedPage.waitForTimeout(1000);

    // Wait for overlay cards to appear (mock data includes three overlays)
    const overlayName = authenticatedPage
      .getByText(/Active Overlay|Upcoming Overlay|Past Overlay/)
      .first();
    await overlayName.waitFor({ state: 'visible', timeout: 10000 });

    // 1. Open create overlay modal and screenshot
    const createButton = authenticatedPage.getByRole('button', { name: /create overlay/i }).first();
    await createButton.waitFor({ state: 'visible' });
    await createButton.scrollIntoViewIfNeeded();
    await createButton.click();

    // Wait for modal/drawer to appear - use multiple selectors for robustness
    const modal = authenticatedPage
      .locator('.mantine-Modal-content, .mantine-Drawer-content')
      .first();
    await modal.waitFor({ state: 'visible', timeout: 10000 });

    // Take screenshot of modal
    await authenticatedPage.screenshot({
      path: `screenshots/feature-overlay-modal-${testInfo.project.name}.png`,
      fullPage: false,
    });

    // Close modal
    await authenticatedPage.keyboard.press('Escape');
    await modal.waitFor({ state: 'hidden' });

    // 2. Trigger a toast by clicking view button
    // Find first overlay card's view button (aria-label contains "view")
    const viewButton = authenticatedPage.locator('[aria-label*="view" i]').first();
    await viewButton.click();

    // Wait for toast to appear - Mantine notification
    const toast = authenticatedPage.locator('.mantine-Notification, [role="alert"]').first();
    await toast.waitFor({ state: 'visible' });

    // Screenshot toast
    await authenticatedPage.screenshot({
      path: `screenshots/feature-toast-notification-${testInfo.project.name}.png`,
      fullPage: false,
    });

    // Close toast (click close button)
    const closeToastButton = toast.locator('button[aria-label="Close"]');
    if ((await closeToastButton.count()) > 0) {
      await closeToastButton.click();
    }

    // 3. Open delete confirmation dialog
    const deleteButton = authenticatedPage.locator('[aria-label*="delete" i]').first();
    await deleteButton.click();

    // Wait for confirmation dialog (might be another modal)
    const confirmDialog = authenticatedPage.locator('.mantine-Modal-content').last();
    await confirmDialog.waitFor({ state: 'visible' });

    // Screenshot confirmation dialog
    await authenticatedPage.screenshot({
      path: `screenshots/feature-confirm-dialog-${testInfo.project.name}.png`,
      fullPage: false,
    });

    // Cancel delete
    const cancelButton = authenticatedPage.getByRole('button', { name: /cancel/i });
    await cancelButton.click();
    await confirmDialog.waitFor({ state: 'hidden' });
  });
});
