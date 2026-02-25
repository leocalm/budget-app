import type { Meta, StoryObj } from '@storybook/react';
import { Table } from '@mantine/core';
import { initialVendors, mockAccounts, mockCategories } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { BatchEntryRow } from './BatchEntryRow';

const meta: Meta<typeof BatchEntryRow> = {
  title: 'Components/Transactions/BatchEntryRow',
  component: BatchEntryRow,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof BatchEntryRow>;

export const Default: Story = {
  args: {
    accounts: mockAccounts,
    categories: mockCategories,
    vendors: initialVendors,
    onSave: async () => {},
  },
  render: (args) => (
    <Table>
      <Table.Tbody>
        <BatchEntryRow {...args} />
      </Table.Tbody>
    </Table>
  ),
};
