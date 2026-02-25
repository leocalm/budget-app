import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { Button } from '@mantine/core';
import {
  mockAccounts,
  mockActiveOverlay,
  mockCategoryWithStats,
  mockVendorsWithStats,
} from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { OverlayFormModal } from './OverlayFormModal';

const meta: Meta<typeof OverlayFormModal> = {
  title: 'Components/Overlays/OverlayFormModal',
  component: OverlayFormModal,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof OverlayFormModal>;

const mutationHandlers = [
  http.post('/api/v1/overlays', () => HttpResponse.json(mockActiveOverlay, { status: 201 })),
  http.put('/api/v1/overlays/:id', () => HttpResponse.json(mockActiveOverlay)),
];

export const Create: Story = {
  parameters: { msw: { handlers: mutationHandlers } },
  render: () => {
    const [opened, setOpened] = useState(true);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Create Overlay</Button>
        <OverlayFormModal
          opened={opened}
          onClose={() => setOpened(false)}
          categories={mockCategoryWithStats}
          vendors={mockVendorsWithStats}
          accounts={mockAccounts}
        />
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
        <Button onClick={() => setOpened(true)}>Edit Overlay</Button>
        <OverlayFormModal
          opened={opened}
          onClose={() => setOpened(false)}
          overlay={mockActiveOverlay}
          categories={mockCategoryWithStats}
          vendors={mockVendorsWithStats}
          accounts={mockAccounts}
        />
      </>
    );
  },
};
