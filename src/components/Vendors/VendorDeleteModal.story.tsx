import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@mantine/core';
import { createStoryDecorator } from '@/stories/storyUtils';
import { VendorDeleteModal } from './VendorDeleteModal';

const meta: Meta<typeof VendorDeleteModal> = {
  title: 'Components/Vendors/VendorDeleteModal',
  component: VendorDeleteModal,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof VendorDeleteModal>;

export const Default: Story = {
  render: () => {
    const [opened, setOpened] = useState(true);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Open</Button>
        <VendorDeleteModal
          opened={opened}
          onClose={() => setOpened(false)}
          onConfirm={() => setOpened(false)}
          isDeleting={false}
        />
      </>
    );
  },
};

export const Deleting: Story = {
  render: () => {
    const [opened, setOpened] = useState(true);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Open</Button>
        <VendorDeleteModal
          opened={opened}
          onClose={() => setOpened(false)}
          onConfirm={() => {}}
          isDeleting
        />
      </>
    );
  },
};

export const WithConflictError: Story = {
  render: () => {
    const [opened, setOpened] = useState(true);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Open</Button>
        <VendorDeleteModal
          opened={opened}
          onClose={() => setOpened(false)}
          onConfirm={() => {}}
          isDeleting={false}
          error={{ transactionCount: 12, vendorId: 'ven-1' }}
        />
      </>
    );
  },
};
