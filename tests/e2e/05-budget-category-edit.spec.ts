import { expect, test } from '../fixtures/auth.fixture';

test.describe('Budget - Edit Category Value', () => {
  test('updates budgeted value when saving an edited budget category', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/budget');
    await expect(authenticatedPage).toHaveURL(/\/budget$/);

    await expect(
      authenticatedPage.getByRole('button', { name: 'Edit budget category' }).first()
    ).toBeVisible();
    await authenticatedPage.getByRole('button', { name: 'Edit budget category' }).first().click();

    const budgetInput = authenticatedPage.getByPlaceholder('0.00').first();
    await budgetInput.fill('650.00');

    const updateRequestPromise = authenticatedPage.waitForRequest(
      (request) =>
        request.method() === 'PUT' &&
        /\/api(?:\/v1)?\/budget-categories\/[^/]+$/.test(new URL(request.url()).pathname)
    );

    await authenticatedPage.getByRole('button', { name: 'Save budget category' }).first().click();

    const updateRequest = await updateRequestPromise;
    expect(updateRequest.postDataJSON()).toEqual({ budgeted_value: 65000 });
  });
});
