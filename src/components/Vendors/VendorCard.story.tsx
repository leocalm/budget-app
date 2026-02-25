import type { Meta, StoryObj } from '@storybook/react';
import { mockVendorsWithStats } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { VendorCard } from './VendorCard';

const meta: Meta<typeof VendorCard> = {
  title: 'Components/Vendors/VendorCard',
  component: VendorCard,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof VendorCard>;

export const Default: Story = {
  args: {
    vendor: mockVendorsWithStats[0],
    onEdit: () => {},
    onDelete: () => {},
    onArchive: () => {},
    onRestore: () => {},
    onViewTransactions: () => {},
  },
};

export const NoDescription: Story = {
  args: {
    ...Default.args,
    vendor: mockVendorsWithStats[1],
  },
};

export const Archived: Story = {
  args: {
    ...Default.args,
    vendor: mockVendorsWithStats[3],
  },
};

export const HighUsage: Story = {
  args: {
    ...Default.args,
    vendor: { ...mockVendorsWithStats[0], transactionCount: 248 },
  },
};
