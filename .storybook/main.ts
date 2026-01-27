import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  core: {
    disableWhatsNewNotifications: true,
    disableTelemetry: true,
    enableCrashReports: false,
  },
  // Temporarily disabled all storybook tests
  stories: [],
  // stories: ['../src/**/*.story.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-themes', '@storybook/addon-vitest'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    config.plugins ??= [];
    config.plugins.push((await import('vite-tsconfig-paths')).default());
    return config;
  },
};

export default config;
