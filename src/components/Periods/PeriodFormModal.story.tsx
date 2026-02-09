import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { BudgetPeriod } from '@/types/budget';
import { PeriodFormModal } from './PeriodFormModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const periods: BudgetPeriod[] = [
  {
    id: 'period-current',
    name: 'February 2026',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    transactionCount: 14,
  },
];

const meta: Meta<typeof PeriodFormModal> = {
  title: 'Components/Periods/PeriodFormModal',
  component: PeriodFormModal,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PeriodFormModal>;

const ModalWrapper = ({ editing }: { editing: boolean }) => {
  const [opened, { open, close }] = useDisclosure(true);

  return (
    <>
      <Button onClick={open}>Open</Button>
      <PeriodFormModal
        opened={opened}
        onClose={close}
        periods={periods}
        period={editing ? periods[0] : null}
      />
    </>
  );
};

export const CreateMode: Story = {
  render: () => <ModalWrapper editing={false} />,
};

export const EditMode: Story = {
  render: () => <ModalWrapper editing />,
};
