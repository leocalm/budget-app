import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import React from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { Preview } from '@storybook/react';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { theme } from '../src/theme';

dayjs.extend(customParseFormat);

export const parameters = {
  layout: 'fullscreen',
  options: {
    showPanel: false,
    storySort: (a: any, b: any) => a.title.localeCompare(b.title, undefined, { numeric: true }),
  },
  backgrounds: { disable: true },
  // interactions settings for the interactions addon / test runtime
  interactions: { timeout: 2000 },
};

export const globalTypes = {
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
};

export const decorators = [
  // Use standard Story param instead of renderStory
  (Story: any, context: any) => {
    const scheme = (context.globals?.theme || 'light') as 'light' | 'dark';
    return (
      <MantineProvider theme={theme} forceColorScheme={scheme}>
        <ColorSchemeScript />
        <Story />
      </MantineProvider>
    );
  },
];

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on.*' },
  },
};

export default preview;
