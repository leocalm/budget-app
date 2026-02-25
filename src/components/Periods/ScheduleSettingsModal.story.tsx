import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { Button } from '@mantine/core';
import { createStoryDecorator } from '@/stories/storyUtils';
import { ScheduleSettingsModal } from './ScheduleSettingsModal';

const meta: Meta<typeof ScheduleSettingsModal> = {
  title: 'Components/Periods/ScheduleSettingsModal',
  component: ScheduleSettingsModal,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof ScheduleSettingsModal>;

const mockSchedule = {
  id: 'sched-1',
  startDay: 1,
  durationValue: 1,
  durationUnit: 'months' as const,
  saturdayAdjustment: 'keep' as const,
  sundayAdjustment: 'keep' as const,
  namePattern: '{MONTH} {YEAR}',
  generateAhead: 6,
};

const mutationHandlers = [
  http.post('/api/v1/budget_period/schedule', () =>
    HttpResponse.json(mockSchedule, { status: 201 })
  ),
  http.put('/api/v1/budget_period/schedule', () => HttpResponse.json(mockSchedule)),
  http.delete('/api/v1/budget_period/schedule', () => new HttpResponse(null, { status: 204 })),
];

export const Create: Story = {
  parameters: { msw: { handlers: mutationHandlers } },
  render: () => {
    const [opened, setOpened] = useState(true);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Configure Schedule</Button>
        <ScheduleSettingsModal opened={opened} onClose={() => setOpened(false)} schedule={null} />
      </>
    );
  },
};

export const Edit: Story = {
  parameters: { msw: { handlers: mutationHandlers } },
  render: () => {
    const [opened, setOpened] = useState(true);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Edit Schedule</Button>
        <ScheduleSettingsModal
          opened={opened}
          onClose={() => setOpened(false)}
          schedule={mockSchedule}
        />
      </>
    );
  },
};
