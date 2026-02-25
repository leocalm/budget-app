import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@mantine/core';
import { mockCategoriesManagement } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { CategoryFormModal } from './CategoryFormModal';

const meta: Meta<typeof CategoryFormModal> = {
  title: 'Components/Categories/CategoryFormModal',
  component: CategoryFormModal,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof CategoryFormModal>;

export const Create: Story = {
  render: () => {
    const [opened, setOpened] = useState(true);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Open</Button>
        <CategoryFormModal
          opened={opened}
          onClose={() => setOpened(false)}
          onSubmit={async () => setOpened(false)}
          mode="create"
        />
      </>
    );
  },
};

export const Edit: Story = {
  render: () => {
    const [opened, setOpened] = useState(true);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Open</Button>
        <CategoryFormModal
          opened={opened}
          onClose={() => setOpened(false)}
          onSubmit={async () => setOpened(false)}
          mode="edit"
          category={mockCategoriesManagement.outgoing[0]}
        />
      </>
    );
  },
};

export const Subcategory: Story = {
  render: () => {
    const [opened, setOpened] = useState(true);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Open</Button>
        <CategoryFormModal
          opened={opened}
          onClose={() => setOpened(false)}
          onSubmit={async () => setOpened(false)}
          mode="subcategory"
          parentCategory={mockCategoriesManagement.outgoing[0]}
        />
      </>
    );
  },
};
