import { test } from '../../../fixtures/real.fixture';

test.describe('Edit and delete transactions', () => {
  test.skip('edit transaction amount updates the value in the list', async ({
    loggedInPage: _loggedInPage,
  }) => {
    // TODO: implement — create a transaction, edit its amount, verify the updated amount is shown
  });

  test.skip('delete transaction removes it from the list', async ({
    loggedInPage: _loggedInPage,
  }) => {
    // TODO: implement — create a transaction, delete it, verify it is no longer visible
  });
});
