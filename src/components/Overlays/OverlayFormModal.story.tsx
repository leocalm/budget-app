import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { OverlayFormModal } from './OverlayFormModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const categories = [
  {
    id: 'category-1',
    name: 'Travel',
    icon: '✈️',
    color: '#00d4ff',
    parentId: null,
    categoryType: 'Outgoing' as const,
    usedInPeriod: 0,
    differenceVsAveragePercentage: 0,
    transactionCount: 0,
  },
  {
    id: 'category-2',
    name: 'Hotels',
    icon: '🏨',
    color: '#00d4ff',
    parentId: null,
    categoryType: 'Outgoing' as const,
    usedInPeriod: 0,
    differenceVsAveragePercentage: 0,
    transactionCount: 0,
  },
];

const vendors = [
  {
    id: 'vendor-1',
    name: 'Airline Co',
    transactionCount: 0,
  },
  {
    id: 'vendor-2',
    name: 'Hotel Group',
    transactionCount: 0,
  },
];

const accounts = [
  {
    id: 'account-1',
    name: 'Main Checking',
    icon: '💳',
    color: '#00d4ff',
    accountType: 'Checking' as const,
    currency: {
      id: 'currency-eur',
      name: 'Euro',
      symbol: '€',
      currency: 'EUR',
      decimalPlaces: 2,
    },
    balance: 0,
    balancePerDay: [],
    balanceChangeThisPeriod: 0,
    transactionCount: 0,
  },
];

const meta: Meta<typeof OverlayFormModal> = {
  title: 'Components/Overlays/OverlayFormModal',
  component: OverlayFormModal,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof OverlayFormModal>;

const ModalWrapper = () => {
  const [opened, { open, close }] = useDisclosure(true);

  return (
    <>
      <Button onClick={open}>Open</Button>
      <OverlayFormModal
        opened={opened}
        onClose={close}
        categories={categories}
        vendors={vendors}
        accounts={accounts}
      />
    </>
  );
};

const ModalWrapperWithOverlay = ({
  overlay,
}: {
  overlay: {
    id: string;
    name: string;
    icon: string;
    startDate: string;
    endDate: string;
    inclusionMode: 'manual' | 'rules' | 'all';
    rules: { categoryIds: string[]; vendorIds: string[]; accountIds: string[] };
    totalCapAmount: number;
    categoryCaps: { categoryId: string; capAmount: number }[];
  };
}) => {
  const [opened, { open, close }] = useDisclosure(true);

  return (
    <>
      <Button onClick={open}>Open</Button>
      <OverlayFormModal
        opened={opened}
        onClose={close}
        overlay={overlay}
        categories={categories}
        vendors={vendors}
        accounts={accounts}
      />
    </>
  );
};

export const CreateMode: Story = {
  render: () => <ModalWrapper />,
};

export const EditMode: Story = {
  render: () => (
    <ModalWrapperWithOverlay
      overlay={{
        id: 'overlay-1',
        name: 'Italy Trip',
        icon: '🏖️',
        startDate: '2026-08-10',
        endDate: '2026-08-20',
        inclusionMode: 'rules',
        rules: {
          categoryIds: ['category-1'],
          vendorIds: ['vendor-1'],
          accountIds: ['account-1'],
        },
        totalCapAmount: 80000,
        categoryCaps: [{ categoryId: 'category-1', capAmount: 30000 }],
      }}
    />
  ),
};
