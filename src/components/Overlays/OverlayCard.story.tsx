import type { Meta, StoryObj } from '@storybook/react';
import { mockActiveOverlay } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { OverlayCard } from './OverlayCard';

const meta: Meta<typeof OverlayCard> = {
  title: 'Components/Overlays/OverlayCard',
  component: OverlayCard,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof OverlayCard>;

export const Active: Story = {
  args: {
    overlay: mockActiveOverlay,
    status: 'active',
    onEdit: () => {},
    onDelete: () => {},
    onView: () => {},
  },
};

export const Upcoming: Story = {
  args: {
    overlay: { ...mockActiveOverlay, startDate: '2026-03-01', endDate: '2026-03-31' },
    status: 'upcoming',
    onEdit: () => {},
    onDelete: () => {},
    onView: () => {},
  },
};

export const Past: Story = {
  args: {
    overlay: { ...mockActiveOverlay, startDate: '2025-11-01', endDate: '2025-11-30' },
    status: 'past',
    onEdit: () => {},
    onDelete: () => {},
    onView: () => {},
  },
};

export const OverBudget: Story = {
  args: {
    overlay: { ...mockActiveOverlay, spentAmount: 180000 },
    status: 'active',
    onEdit: () => {},
    onDelete: () => {},
    onView: () => {},
  },
};

export const NoCap: Story = {
  args: {
    overlay: { ...mockActiveOverlay, totalCapAmount: null },
    status: 'active',
    onEdit: () => {},
    onDelete: () => {},
    onView: () => {},
  },
};
