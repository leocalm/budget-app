import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { V2ThemeProvider } from '@/theme/v2';
import { UserSection } from './UserSection';

const meta: Meta<typeof UserSection> = {
  title: 'v2/AppShell/UserSection',
  component: UserSection,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <V2ThemeProvider colorMode="dark">
        <div style={{ width: 200, backgroundColor: 'var(--v2-card)', padding: 8 }}>
          <Story />
        </div>
      </V2ThemeProvider>
    ),
    createStoryDecorator({ padding: false }),
  ],
};

export default meta;
type Story = StoryObj<typeof UserSection>;

export const Default: Story = {
  args: {
    name: 'Leonardo',
    email: 'user@example.com',
  },
};

export const Collapsed: Story = {
  args: {
    name: 'Leonardo',
    email: 'user@example.com',
    collapsed: true,
  },
};

export const LightMode: Story = {
  args: {
    name: 'Leonardo',
    email: 'user@example.com',
  },
  decorators: [
    (Story) => (
      <V2ThemeProvider colorMode="light">
        <div style={{ width: 200, backgroundColor: 'var(--v2-card)', padding: 8 }}>
          <Story />
        </div>
      </V2ThemeProvider>
    ),
    createStoryDecorator({ padding: false }),
  ],
};
