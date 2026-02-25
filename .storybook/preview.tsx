import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React from 'react';
import type { Preview } from '@storybook/react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { MemoryRouter } from 'react-router-dom';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { handlers } from '../src/mocks/handlers';
import { theme } from '../src/theme';

import '../src/i18n';
import '../src/global.css';

// Initialize MSW
initialize(
  {
    onUnhandledRequest: 'warn',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  },
  handlers
);

dayjs.extend(customParseFormat);

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on.*' },
    msw: {
      handlers,
    },
    layout: 'fullscreen',
    options: {
      showPanel: false,
      // Storybook doesn't expose a stable, exported type for storySort args in our setup.
      // Explicitly type to satisfy TS strict mode.
      storySort: (a: any, b: any) => a.title.localeCompare(b.title, undefined, { numeric: true }),
    },
    backgrounds: { disable: true },
    interactions: { timeout: 2000 },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Mantine color scheme',
      defaultValue: 'light',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const scheme = (context.globals?.theme || 'light') as 'light' | 'dark';
      return (
        <MemoryRouter>
          <MantineProvider theme={theme} forceColorScheme={scheme}>
            <ColorSchemeScript />
            <Story />
          </MantineProvider>
        </MemoryRouter>
      );
    },
  ],
  loaders: [mswLoader],
};

export default preview;
