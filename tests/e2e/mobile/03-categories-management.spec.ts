import { expect, test } from '../../fixtures/auth.fixture';

test.describe('Categories Management - Mobile', () => {
  test('mode switch buttons should be clickable on mobile', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/categories');

    // Wait for page to load
    await expect(authenticatedPage.locator('text=Categories')).toBeVisible();

    // Check that mode switch exists
    const managementButton = authenticatedPage.locator('button:has-text("Management")');
    await expect(managementButton).toBeVisible();

    // Check if it's clickable
    await managementButton.click();

    // Verify we're in management mode - check for the + button which only appears in management mode
    await expect(authenticatedPage.locator('button:has-text("+")')).toBeVisible();
  });

  test('add category button should work on mobile', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/categories');

    // Switch to management mode
    const managementButton = authenticatedPage.locator('button:has-text("Management")');
    await managementButton.click();

    // Check add button is visible
    const addButton = authenticatedPage.locator('button:has-text("+")');
    await expect(addButton).toBeVisible();

    // Click add button
    await addButton.click();

    // Modal or drawer should open - check for drawer title
    await expect(authenticatedPage.locator('h2:has-text("Create Category")')).toBeVisible();
  });

  test('category action buttons should work on mobile', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/categories');

    // Switch to management mode
    const managementButton = authenticatedPage.locator('button:has-text("Management")');
    await managementButton.click();

    // Wait for categories to load
    await authenticatedPage.waitForTimeout(1000);

    // Check if any category rows exist
    const editButtons = authenticatedPage.locator('button:has-text("Edit")');
    const count = await editButtons.count();

    if (count > 0) {
      // Try clicking the first Edit button
      await editButtons.first().click();

      // Edit modal should open
      await expect(authenticatedPage.locator('h2:has-text("Edit Category")')).toBeVisible();
    } else {
      // No categories - check empty state
    }
  });
});
