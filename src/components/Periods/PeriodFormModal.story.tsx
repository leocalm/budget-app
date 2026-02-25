import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { Button } from '@mantine/core';
import { createStoryDecorator } from '@/stories/storyUtils';
import { PeriodFormModal } from './PeriodFormModal';

const meta: Meta<typeof PeriodFormModal> = {
  title: 'Components/Periods/PeriodFormModal',
  component: PeriodFormModal,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof PeriodFormModal>;

const periods = [
  { id: 'per-1', name: 'January 2026', startDate: '2026-01-01', endDate: '2026-01-31' },
];

const mutationHandlers = [
  http.post('/api/v1/budget_period', () =>
    HttpResponse.json(
      { id: 'per-new', name: 'March 2026', startDate: '2026-03-01', endDate: '2026-03-31' },
      { status: 201 }
    )
  ),
  http.put('/api/v1/budget_period/:id', () =>
    HttpResponse.json({
      id: 'per-1',
      name: 'January 2026 (updated)',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    })
  ),
];

export const Create: Story = {
  parameters: { msw: { handlers: mutationHandlers } },
  render: () => {
    const [opened, setOpened] = useState(true);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Create Period</Button>
        <PeriodFormModal opened={opened} onClose={() => setOpened(false)} periods={periods} />
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
        <Button onClick={() => setOpened(true)}>Edit Period</Button>
        <PeriodFormModal
          opened={opened}
          onClose={() => setOpened(false)}
          periods={periods}
          period={periods[0]}
        />
      </>
    );
  },
};
