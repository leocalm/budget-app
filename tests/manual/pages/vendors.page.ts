import { expect, type Locator, type Page } from 'playwright/test';

export interface CreateVendorOpts {
  name: string;
  description?: string;
}

export interface TopStats {
  total: string;
  spent: string;
  avg: string;
}

export class VendorsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/vendors');
    await expect(this.page.getByTestId('vendors-add-button')).toBeVisible({ timeout: 15000 });
  }

  async clickAdd(): Promise<void> {
    await this.page.getByTestId('vendors-add-button').click();
  }

  async fillName(name: string): Promise<void> {
    await this.page.getByTestId('vendor-name-input').fill(name);
  }

  async fillDescription(desc: string): Promise<void> {
    await this.page.getByTestId('vendor-description-input').fill(desc);
  }

  async submitForm(): Promise<void> {
    await this.page.getByTestId('vendor-form-submit').click();
  }

  async expectFormVisible(): Promise<void> {
    // Mantine Drawer keeps the root in the DOM and lazy-mounts its content,
    // so assert on a field inside the form instead of the root testid.
    await expect(this.page.getByTestId('vendor-name-input')).toBeVisible({ timeout: 10000 });
  }

  async expectFormClosed(): Promise<void> {
    await expect(this.page.getByTestId('vendor-name-input')).toBeHidden({ timeout: 15000 });
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.page.getByTestId('vendor-form-submit')).toBeDisabled();
  }

  async expectSubmitEnabled(): Promise<void> {
    await expect(this.page.getByTestId('vendor-form-submit')).toBeEnabled();
  }

  async createVendor(opts: CreateVendorOpts): Promise<void> {
    await this.clickAdd();
    await this.expectFormVisible();
    await this.fillName(opts.name);

    if (opts.description !== undefined) {
      await this.fillDescription(opts.description);
    }

    await this.submitForm();
    await this.expectFormClosed();
  }

  vendorRow(id: string): Locator {
    return this.page.getByTestId(`vendor-row-${id}`);
  }

  vendorRowByName(name: string): Locator {
    return this.page.locator(`[data-testid^="vendor-row-"]:has-text("${name}")`).first();
  }

  async openRowMenu(id: string): Promise<void> {
    await this.page.getByTestId(`vendor-row-${id}-menu`).click();
  }

  async clickEditFromMenu(): Promise<void> {
    await this.page.getByTestId('vendor-menu-edit').click();
  }

  async clickArchiveFromMenu(): Promise<void> {
    await this.page.getByTestId('vendor-menu-archive').click();
  }

  async clickUnarchiveFromMenu(): Promise<void> {
    await this.page.getByTestId('vendor-menu-unarchive').click();
  }

  async clickDeleteFromMenu(): Promise<void> {
    await this.page.getByTestId('vendor-menu-delete').click();
  }

  async clickMergeFromMenu(): Promise<void> {
    await this.page.getByTestId('vendor-menu-merge').click();
  }

  async isDeleteMenuItemVisible(): Promise<boolean> {
    // Note: Playwright's isVisible() does NOT wait — its timeout arg is ignored.
    // Use waitFor to actually wait for the portal-rendered menu item to mount.
    return this.page
      .getByTestId('vendor-menu-delete')
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);
  }

  async isArchiveMenuItemVisible(): Promise<boolean> {
    return this.page
      .getByTestId('vendor-menu-archive')
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);
  }

  async isUnarchiveMenuItemVisible(): Promise<boolean> {
    return this.page
      .getByTestId('vendor-menu-unarchive')
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);
  }

  async isMergeMenuItemVisible(): Promise<boolean> {
    return this.page
      .getByTestId('vendor-menu-merge')
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);
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

  async expectMergeModalVisible(): Promise<void> {
    // Mantine Modal keeps the root in the DOM and lazy-mounts its content,
    // so assert on a field inside the modal instead of the root testid.
    await expect(this.page.getByTestId('vendor-merge-target')).toBeVisible({ timeout: 10000 });
  }

  async expectMergeModalClosed(): Promise<void> {
    await expect(this.page.getByTestId('vendor-merge-target')).toBeHidden({ timeout: 15000 });
  }

  async selectMergeTarget(name: string): Promise<void> {
    await this.page.getByTestId('vendor-merge-target').click();
    await this.page.getByRole('option', { name }).first().click();
  }

  async submitMerge(): Promise<void> {
    await this.page.getByTestId('vendor-merge-confirm').click();
  }

  async cancelMerge(): Promise<void> {
    await this.page.getByTestId('vendor-merge-cancel').click();
  }

  async readRowText(id: string): Promise<string> {
    return (await this.vendorRow(id).textContent()) ?? '';
  }

  async readTopStats(): Promise<TopStats> {
    const total = (await this.page.getByTestId('vendors-stat-total').textContent()) ?? '';
    const spent = (await this.page.getByTestId('vendors-stat-spent').textContent()) ?? '';
    const avg = (await this.page.getByTestId('vendors-stat-avg').textContent()) ?? '';

    return { total, spent, avg };
  }
}
