import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { V2ThemeProvider } from '@/theme/v2';
import { MobileHeader } from './MobileHeader';

const meta: Meta<typeof MobileHeader> = {
  title: 'v2/AppShell/MobileHeader',
  component: MobileHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [
    (Story) => (
      <V2ThemeProvider colorMode="dark">
        <div style={{ backgroundColor: 'var(--v2-bg)' }}>
          <Story />
        </div>
      </V2ThemeProvider>
    ),
    createStoryDecorator({ padding: false }),
  ],
};

export default meta;
type Story = StoryObj<typeof MobileHeader>;

export const Default: Story = {
  args: {
    userName: 'Leonardo',
  },
};

export const WithPeriodSelector: Story = {
  args: {
    userName: 'Leonardo',
    periodSelector: (
      <div style={{ padding: '6px 12px', border: '1px solid var(--v2-border)', borderRadius: 20 }}>
        March 2026 · 14d left
      </div>
    ),
  },
};
