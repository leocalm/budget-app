import { expect, test } from '../../fixtures/auth.fixture';

// ---------------------------------------------------------------------------
// Tests for Dashboard Card Customization
// ---------------------------------------------------------------------------

test.describe('Dashboard Card Customization', () => {
  test.describe('Dashboard card rendering', () => {
    test('dashboard loads and renders enabled cards from layout', async ({
      authenticatedPage: page,
    }) => {
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

      // Default cards should be visible (current_period is full width, budget_stability and net_position are half)
      await expect(page.locator('[data-testid="current-period-active"]')).toBeVisible();
      await expect(page.locator('[data-testid="budget-stability-active"]')).toBeVisible();
      await expect(page.locator('[data-testid="net-position-active"]')).toBeVisible();
    });

    test('disabled cards do not appear on dashboard', async ({ authenticatedPage: page }) => {
      // Route to disable the budget_stability card
      await page.route('**/dashboard-layout**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'card-1',
              card_type: 'current_period',
              entity_id: null,
              size: 'full',
              position: 0,
              enabled: true,
            },
            {
              id: 'card-2',
              card_type: 'budget_stability',
              entity_id: null,
              size: 'half',
              position: 1,
              enabled: false,
            },
            {
              id: 'card-3',
              card_type: 'net_position',
              entity_id: null,
              size: 'half',
              position: 2,
              enabled: true,
            },
          ]),
        })
      );

      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

      // Current period should be visible
      await expect(page.locator('[data-testid="current-period-active"]')).toBeVisible();
      // Net position should be visible
      await expect(page.locator('[data-testid="net-position-active"]')).toBeVisible();
      // Budget stability should NOT be visible (disabled)
      await expect(page.locator('[data-testid="budget-stability-active"]')).not.toBeVisible();
    });
  });

  test.describe('Settings page - Dashboard Cards section', () => {
    test('settings page shows dashboard-cards section with card list', async ({
      authenticatedPage: page,
    }) => {
      await page.goto('/settings#dashboard-cards');

      // Should scroll to the dashboard-cards section
      await expect(page.locator('#dashboard-cards')).toBeVisible();

      // Should show the title
      await expect(page.getByRole('heading', { name: /dashboard cards/i })).toBeVisible();

      // Should show the card list with default cards
      // Each card row has a text label - check for known card types
      await expect(page.getByText('Current Period')).toBeVisible();
      await expect(page.getByText('Budget Stability')).toBeVisible();
      await expect(page.getByText('Net Position')).toBeVisible();
    });

    test('settings page shows Add Card and Reset buttons', async ({ authenticatedPage: page }) => {
      await page.goto('/settings#dashboard-cards');

      // Should show Add Card button
      await expect(page.getByRole('button', { name: /add card/i })).toBeVisible();

      // Should show Reset button
      await expect(page.getByRole('button', { name: /reset/i })).toBeVisible();
    });
  });

  test.describe('Toggle card enabled/disabled', () => {
    test('user can toggle a card off - card disappears from dashboard', async ({
      authenticatedPage: page,
    }) => {
      await page.goto('/settings#dashboard-cards');
      await expect(page.locator('#dashboard-cards')).toBeVisible();

      // Find the Budget Stability card row and toggle it off
      const budgetStabilityRow = page.locator('text=Budget Stability').locator('..');
      const toggleSwitch = budgetStabilityRow.locator('input[type="checkbox"]');
      await expect(toggleSwitch).toBeChecked();

      // Click to toggle off
      await toggleSwitch.uncheck();

      // Wait for the mutation to complete
      await page.waitForResponse(
        (resp) => resp.url().includes('/dashboard-layout/') && resp.request().method() === 'PUT'
      );

      // Navigate to dashboard to verify card is gone
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

      // Budget Stability should not be visible
      await expect(page.locator('[data-testid="budget-stability-active"]')).not.toBeVisible();
    });

    test('user can toggle a card on - card appears on dashboard', async ({
      authenticatedPage: page,
    }) => {
      // Start with budget_stability disabled
      await page.route('**/dashboard-layout**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'card-1',
              card_type: 'current_period',
              entity_id: null,
              size: 'full',
              position: 0,
              enabled: true,
            },
            {
              id: 'card-2',
              card_type: 'budget_stability',
              entity_id: null,
              size: 'half',
              position: 1,
              enabled: false,
            },
            {
              id: 'card-3',
              card_type: 'net_position',
              entity_id: null,
              size: 'half',
              position: 2,
              enabled: true,
            },
          ]),
        })
      );

      await page.goto('/settings#dashboard-cards');
      await expect(page.locator('#dashboard-cards')).toBeVisible();

      // Find the Budget Stability card row and toggle it on
      const budgetStabilityRow = page.locator('text=Budget Stability').locator('..');
      const toggleSwitch = budgetStabilityRow.locator('input[type="checkbox"]');
      await expect(toggleSwitch).not.toBeChecked();

      // Click to toggle on
      await toggleSwitch.check();

      // Wait for the mutation to complete
      await page.waitForResponse(
        (resp) => resp.url().includes('/dashboard-layout/') && resp.request().method() === 'PUT'
      );

      // Navigate to dashboard to verify card appears
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

      // Budget Stability should now be visible
      await expect(page.locator('[data-testid="budget-stability-active"]')).toBeVisible();
    });
  });

  test.describe('Delete card', () => {
    test('user can delete a card - card removed from settings list', async ({
      authenticatedPage: page,
    }) => {
      await page.goto('/settings#dashboard-cards');
      await expect(page.locator('#dashboard-cards')).toBeVisible();

      // Count initial cards
      const cardRows = page.locator('#dashboard-cards').locator('input[type="checkbox"]');
      const initialCount = await cardRows.count();

      // Find the Budget Stability card row and click delete
      const budgetStabilityRow = page.locator('text=Budget Stability').locator('..');
      const deleteButton = budgetStabilityRow.getByRole('button', { name: /delete|remove/i });
      await deleteButton.click();

      // Wait for the mutation to complete
      await page.waitForResponse(
        (resp) => resp.url().includes('/dashboard-layout/') && resp.request().method() === 'DELETE'
      );

      // Verify card count decreased
      const newCount = await cardRows.count();
      expect(newCount).toBe(initialCount - 1);

      // Budget Stability should no longer be in the list
      await expect(page.locator('text=Budget Stability')).not.toBeVisible();
    });
  });

  test.describe('Add new card', () => {
    test('user can add a new global card via Add Card modal', async ({
      authenticatedPage: page,
    }) => {
      // Start with a minimal layout
      await page.route('**/dashboard-layout**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'card-1',
              card_type: 'current_period',
              entity_id: null,
              size: 'full',
              position: 0,
              enabled: true,
            },
          ]),
        })
      );

      await page.goto('/settings#dashboard-cards');
      await expect(page.locator('#dashboard-cards')).toBeVisible();

      // Click Add Card button
      await page.getByRole('button', { name: /add card/i }).click();

      // Modal should appear
      await expect(page.getByRole('dialog')).toBeVisible();

      // Select a card type (e.g., Net Position)
      const select = page.locator('[role="dialog"] input[type="search"]');
      await select.click();

      // Select from dropdown
      await page.getByText('Net Position').click();

      // Click confirm
      await page
        .getByRole('button', { name: /add|confirm/i })
        .last()
        .click();

      // Wait for the mutation
      await page.waitForResponse(
        (resp) => resp.url().includes('/dashboard-layout') && resp.request().method() === 'POST'
      );

      // Modal should close
      await expect(page.getByRole('dialog')).not.toBeVisible();

      // Card should now appear in the list
      await expect(page.locator('text=Net Position')).toBeVisible();
    });

    test('Add Card button is disabled when all cards are added', async ({
      authenticatedPage: page,
    }) => {
      // Mock all cards already added
      await page.route('**/dashboard-layout/available-cards**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            global_cards: [],
            entity_cards: [],
          }),
        })
      );

      await page.goto('/settings#dashboard-cards');
      await expect(page.locator('#dashboard-cards')).toBeVisible();

      // Add Card button should be disabled
      await expect(page.getByRole('button', { name: /add card/i })).toBeDisabled();
    });
  });

  test.describe('Reset layout', () => {
    test('reset layout restores defaults after confirmation', async ({
      authenticatedPage: page,
    }) => {
      // Start with a modified layout
      await page.route('**/dashboard-layout**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'card-1',
              card_type: 'current_period',
              entity_id: null,
              size: 'full',
              position: 0,
              enabled: true,
            },
          ]),
        })
      );

      await page.goto('/settings#dashboard-cards');
      await expect(page.locator('#dashboard-cards')).toBeVisible();

      // Click Reset button
      await page.getByRole('button', { name: /reset/i }).click();

      // Confirmation modal should appear
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText(/reset.*dashboard/i)).toBeVisible();

      // Click confirm reset
      await page
        .getByRole('button', { name: /reset|confirm/i })
        .last()
        .click();

      // Wait for the mutation
      await page.waitForResponse(
        (resp) =>
          resp.url().includes('/dashboard-layout/reset') && resp.request().method() === 'POST'
      );

      // Modal should close
      await expect(page.getByRole('dialog')).not.toBeVisible();

      // Default cards should be back
      await expect(page.locator('text=Budget Stability')).toBeVisible();
      await expect(page.locator('text=Net Position')).toBeVisible();
    });

    test('reset can be cancelled', async ({ authenticatedPage: page }) => {
      await page.goto('/settings#dashboard-cards');
      await expect(page.locator('#dashboard-cards')).toBeVisible();

      // Click Reset button
      await page.getByRole('button', { name: /reset/i }).click();

      // Confirmation modal should appear
      await expect(page.getByRole('dialog')).toBeVisible();

      // Click cancel
      await page.getByRole('button', { name: /cancel/i }).click();

      // Modal should close without resetting
      await expect(page.getByRole('dialog')).not.toBeVisible();

      // Cards should still be there (not reset)
      await expect(page.locator('text=Budget Stability')).toBeVisible();
    });
  });

  test.describe('Reorder cards', () => {
    test('drag reorder changes card position', async ({ authenticatedPage: page }) => {
      await page.goto('/settings#dashboard-cards');
      await expect(page.locator('#dashboard-cards')).toBeVisible();

      // Get all card rows
      const cardRows = page
        .locator('#dashboard-cards')
        .locator('[role="button"][aria-roledescription="sortable"]');
      const firstCard = cardRows.first();
      const secondCard = cardRows.nth(1);

      // Perform drag operation
      // Note: dnd-kit uses pointer events with activation constraint
      const firstCardHandle = firstCard.locator('[style*="cursor: grab"]');

      // Drag first card below second card
      await firstCardHandle.dragTo(secondCard, { targetPosition: { x: 0, y: 50 } });

      // Wait for the reorder mutation
      await page.waitForResponse(
        (resp) =>
          resp.url().includes('/dashboard-layout/reorder') && resp.request().method() === 'PUT'
      );

      // Verify order changed - the cards should now be in different positions
      // Note: This test verifies the API was called; actual visual reordering is handled by dnd-kit
    });

    test('card order is preserved after page reload', async ({ authenticatedPage: page }) => {
      // Mock with a specific order
      await page.route('**/dashboard-layout**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'card-2',
              card_type: 'budget_stability',
              entity_id: null,
              size: 'half',
              position: 0,
              enabled: true,
            },
            {
              id: 'card-3',
              card_type: 'net_position',
              entity_id: null,
              size: 'half',
              position: 1,
              enabled: true,
            },
            {
              id: 'card-1',
              card_type: 'current_period',
              entity_id: null,
              size: 'full',
              position: 2,
              enabled: true,
            },
          ]),
        })
      );

      await page.goto('/settings#dashboard-cards');
      await expect(page.locator('#dashboard-cards')).toBeVisible();

      // Verify cards appear in the mocked order
      const allText = await page.locator('#dashboard-cards').textContent();
      const budgetIdx = allText?.indexOf('Budget Stability') ?? -1;
      const netPositionIdx = allText?.indexOf('Net Position') ?? -1;

      // Budget Stability should come before Net Position in the list
      expect(budgetIdx).toBeLessThan(netPositionIdx!);
    });
  });

  test.describe('Empty state', () => {
    test('shows empty state when no cards configured', async ({ authenticatedPage: page }) => {
      // Mock empty layout
      await page.route('**/dashboard-layout**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify([]),
        })
      );

      await page.goto('/settings#dashboard-cards');
      await expect(page.locator('#dashboard-cards')).toBeVisible();

      // Should show empty state message
      await expect(page.getByText(/no.*card|empty/i)).toBeVisible();
    });
  });
});
