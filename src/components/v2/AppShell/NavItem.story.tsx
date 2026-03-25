import type { Meta, StoryObj } from '@storybook/react';
import { IconChartBar, IconLink } from '@tabler/icons-react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { V2ThemeProvider } from '@/theme/v2';
import { NavItem } from './NavItem';

const meta: Meta<typeof NavItem> = {
  title: 'v2/AppShell/NavItem',
  component: NavItem,
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
type Story = StoryObj<typeof NavItem>;

export const Default: Story = {
  args: {
    icon: IconChartBar,
    label: 'Dashboard',
    to: '/v2/dashboard',
  },
};

export const WithDot: Story = {
  args: {
    icon: IconLink,
    label: 'Overlays',
    to: '/v2/overlays',
    dot: true,
  },
};

export const Collapsed: Story = {
  args: {
    icon: IconChartBar,
    label: 'Dashboard',
    to: '/v2/dashboard',
    collapsed: true,
  },
};
