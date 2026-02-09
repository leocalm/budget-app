import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { BudgetPeriodSchedule } from '@/types/budget';
import { ScheduleSettingsModal } from './ScheduleSettingsModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const activeSchedule: BudgetPeriodSchedule = {
  id: 'schedule-1',
  startDay: 1,
  durationValue: 1,
  durationUnit: 'months',
  saturdayAdjustment: 'friday',
  sundayAdjustment: 'monday',
  namePattern: '{MONTH} {YEAR}',
  generateAhead: 6,
};

const meta: Meta<typeof ScheduleSettingsModal> = {
  title: 'Components/Periods/ScheduleSettingsModal',
  component: ScheduleSettingsModal,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ScheduleSettingsModal>;

const ModalWrapper = ({ withSchedule }: { withSchedule: boolean }) => {
  const [opened, { open, close }] = useDisclosure(true);

  return (
    <>
      <Button onClick={open}>Open</Button>
      <ScheduleSettingsModal
        opened={opened}
        onClose={close}
        schedule={withSchedule ? activeSchedule : null}
      />
    </>
  );
};

export const Configure: Story = {
  render: () => <ModalWrapper withSchedule={false} />,
};

export const EditActiveSchedule: Story = {
  render: () => <ModalWrapper withSchedule />,
};
