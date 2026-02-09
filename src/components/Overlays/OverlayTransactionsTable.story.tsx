import type { Meta, StoryObj } from '@storybook/react';
import { Paper } from '@mantine/core';
import { OverlayTransactionsTable } from './OverlayTransactionsTable';

const meta: Meta<typeof OverlayTransactionsTable> = {
  title: 'Components/Overlays/OverlayTransactionsTable',
  component: OverlayTransactionsTable,
  decorators: [
    (Story) => (
      <Paper maw={980} p="md">
        <Story />
      </Paper>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof OverlayTransactionsTable>;

const transactions = [
  {
    id: 'tx-1',
    description: 'Flight to Rome',
    amount: 34000,
    occurredAt: '2026-08-11',
    category: {
      id: 'cat-1',
      name: 'Travel',
      color: '#00d4ff',
      icon: '✈️',
      categoryType: 'Outgoing' as const,
    },
    fromAccount: {
      id: 'acc-1',
      name: 'Main Checking',
      color: '#00d4ff',
      icon: '💳',
    },
    toAccount: null,
    vendor: {
      id: 'vendor-1',
      name: 'Airline Co',
    },
    membership: {
      isIncluded: true,
      inclusionSource: 'rules' as const,
    },
  },
  {
    id: 'tx-2',
    description: 'Metro ticket',
    amount: 250,
    occurredAt: '2026-08-12',
    category: {
      id: 'cat-2',
      name: 'Transport',
      color: '#00d4ff',
      icon: '🚇',
      categoryType: 'Outgoing' as const,
    },
    fromAccount: {
      id: 'acc-1',
      name: 'Main Checking',
      color: '#00d4ff',
      icon: '💳',
    },
    toAccount: null,
    vendor: null,
    membership: {
      isIncluded: false,
      inclusionSource: null,
    },
  },
];

export const Default: Story = {
  args: {
    transactions,
    pendingTransactionId: null,
    onInclude: () => {},
    onExclude: () => {},
  },
};

export const ReadOnly: Story = {
  args: {
    transactions,
    pendingTransactionId: null,
    onInclude: () => {},
    onExclude: () => {},
    readOnly: true,
  },
};
