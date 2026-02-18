import { defineConfig, devices } from 'playwright/test';
import { e2eEnv } from './tests/setup/env';

const isLocalTarget = e2eEnv.target === 'local';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: e2eEnv.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: e2eEnv.target === 'docker',
  },
  globalSetup: './tests/setup/global-setup.ts',
  globalTeardown: './tests/setup/global-teardown.ts',
  webServer: isLocalTarget
    ? {
        command: `yarn dev --host ${e2eEnv.webServerHost} --port ${e2eEnv.webServerPort}`,
        url: e2eEnv.baseUrl,
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /tests\/e2e\/mobile\//,
    },
    {
      name: 'desktop-firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: /tests\/e2e\/mobile\//,
    },
    {
      name: 'desktop-webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: /tests\/e2e\/mobile\//,
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
      testMatch: [
        /tests\/e2e\/mobile\/.*\.spec\.ts/,
        /screenshots\.spec\.ts/,
        /screenshots-features\.spec\.ts/,
      ],
    },
    {
      name: 'mobile-webkit',
      use: { ...devices['iPhone 14'] },
      testMatch: [
        /tests\/e2e\/mobile\/.*\.spec\.ts/,
        /screenshots\.spec\.ts/,
        /screenshots-features\.spec\.ts/,
      ],
    },
  ],
});
