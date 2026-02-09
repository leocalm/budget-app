import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '@mantine/core';
import { OverlayCard } from './OverlayCard';

const meta: Meta<typeof OverlayCard> = {
  title: 'Components/Overlays/OverlayCard',
  component: OverlayCard,
  decorators: [
    (Story) => (
      <Stack maw={760} p="md">
        <Story />
      </Stack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof OverlayCard>;

const baseOverlay = {
  id: 'overlay-1',
  name: 'Italy Trip',
  icon: '🏖️',
  startDate: '2026-08-10',
  endDate: '2026-08-20',
  inclusionMode: 'rules' as const,
  spentAmount: 68000,
  totalCapAmount: 80000,
  transactionCount: 23,
  categoryCaps: [
    { categoryId: 'cat-1', capAmount: 30000 },
    { categoryId: 'cat-2', capAmount: 40000 },
  ],
};

export const Active: Story = {
  args: {
    overlay: baseOverlay,
    status: 'active',
  },
};

export const Upcoming: Story = {
  args: {
    overlay: {
      ...baseOverlay,
      name: 'Christmas Shopping',
      icon: '🎄',
      startDate: '2026-12-01',
      endDate: '2026-12-25',
      inclusionMode: 'manual',
      spentAmount: 0,
      totalCapAmount: 50000,
      transactionCount: 0,
      categoryCaps: [],
    },
    status: 'upcoming',
  },
};

export const Past: Story = {
  args: {
    overlay: {
      ...baseOverlay,
      name: 'Birthday Week',
      icon: '🎉',
      startDate: '2026-07-10',
      endDate: '2026-07-17',
      inclusionMode: 'all',
      spentAmount: 22000,
      totalCapAmount: 20000,
      transactionCount: 11,
      categoryCaps: [],
    },
    status: 'past',
  },
};
