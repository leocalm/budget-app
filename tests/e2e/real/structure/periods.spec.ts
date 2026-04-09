import { test } from '../../../fixtures/real.fixture';

test.describe('Periods', () => {
  test.skip('create period appears in the periods list', async ({
    loggedInPage: _loggedInPage,
  }) => {
    // TODO: onboarding auto-generates periods via a schedule, which conflicts
    // with manual period creation. Need to delete the schedule first or test
    // period creation on a user without onboarding completion.
  });
});
