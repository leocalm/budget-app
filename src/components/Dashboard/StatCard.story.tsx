import type { Meta, StoryObj } from '@storybook/react';
import { IconCalendar, IconTrendingUp, IconWallet } from '@tabler/icons-react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Components/Dashboard/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    icon: IconWallet,
    label: 'Total Balance',
    value: '€1,450.00',
    meta: 'Across all accounts',
  },
};

export const WithTrendUp: Story = {
  args: {
    icon: IconTrendingUp,
    label: 'Monthly Income',
    value: '€2,500.00',
    meta: 'January 2026',
    trend: { direction: 'up', value: '+€200', positive: true },
  },
};

export const WithTrendDown: Story = {
  args: {
    icon: IconWallet,
    label: 'Total Spent',
    value: '€850.00',
    meta: 'This period',
    trend: { direction: 'down', value: '-€50', positive: false },
  },
};

export const Featured: Story = {
  args: {
    icon: IconWallet,
    label: 'Remaining Budget',
    value: '€1,150.00',
    meta: '57% remaining',
    featured: true,
    trend: { direction: 'up', value: '+5%', positive: true },
  },
};

export const Loading: Story = {
  args: {
    icon: IconCalendar,
    label: 'Month Progress',
    value: '48%',
    loading: true,
  },
};

export const NoMeta: Story = {
  args: {
    icon: IconWallet,
    label: 'Net Position',
    value: '€6,035.00',
  },
};
