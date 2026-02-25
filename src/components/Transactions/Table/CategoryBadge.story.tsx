import type { Meta, StoryObj } from '@storybook/react';
import {
  mockIncomingCategory,
  mockOutgoingCategory,
  mockTransferCategory,
} from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { CategoryBadge } from './CategoryBadge';

const meta: Meta<typeof CategoryBadge> = {
  title: 'Components/Transactions/CategoryBadge',
  component: CategoryBadge,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof CategoryBadge>;

export const Outgoing: Story = {
  args: { category: mockOutgoingCategory },
};

export const Incoming: Story = {
  args: { category: mockIncomingCategory },
};

export const Transfer: Story = {
  args: { category: mockTransferCategory },
};
