import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { V2ThemeProvider } from '@/theme/v2';
import { Sidebar } from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'v2/AppShell/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <V2ThemeProvider colorMode="dark">
        <div
          style={{
            width: 220,
            height: '100vh',
            backgroundColor: 'var(--v2-card)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Story />
        </div>
      </V2ThemeProvider>
    ),
    createStoryDecorator({ padding: false }),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Expanded: Story = {
  args: {
    collapsed: false,
    onToggleCollapse: () => {},
    user: { name: 'Leonardo', email: 'leocalm@gmail.com' },
  },
};

export const Collapsed: Story = {
  args: {
    collapsed: true,
    onToggleCollapse: () => {},
    user: { name: 'Leonardo', email: 'leocalm@gmail.com' },
  },
  decorators: [
    (Story) => (
      <V2ThemeProvider colorMode="dark">
        <div
          style={{
            width: 60,
            height: '100vh',
            backgroundColor: 'var(--v2-card)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Story />
        </div>
      </V2ThemeProvider>
    ),
    createStoryDecorator({ padding: false }),
  ],
};

export const LightMode: Story = {
  args: {
    collapsed: false,
    onToggleCollapse: () => {},
    user: { name: 'Leonardo', email: 'leocalm@gmail.com' },
  },
  decorators: [
    (Story) => (
      <V2ThemeProvider colorMode="light">
        <div
          style={{
            width: 220,
            height: '100vh',
            backgroundColor: 'var(--v2-card)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Story />
        </div>
      </V2ThemeProvider>
    ),
    createStoryDecorator({ padding: false }),
  ],
};
