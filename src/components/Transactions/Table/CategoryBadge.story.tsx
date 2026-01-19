import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Group } from '@mantine/core';
import { CategoryBadge } from './CategoryBadge';

const meta: Meta<typeof CategoryBadge> = {
  title: 'Components/Transactions/CategoryBadge',
  component: CategoryBadge,
  decorators: [
    (Story) => (
      <Box p="lg" style={{ background: '#0a0e14' }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CategoryBadge>;

export const Comida: Story = {
  args: {
    category: {
      id: 'c1',
      name: 'Comida',
      color: '#b47aff',
      icon: '🍔',
      parentId: null,
      categoryType: 'Outgoing',
    },
  },
};

export const Farmacia: Story = {
  args: {
    category: {
      id: 'c2',
      name: 'Farmacia',
      color: '#ffa940',
      icon: '💊',
      parentId: null,
      categoryType: 'Outgoing',
    },
  },
};

export const Mercado: Story = {
  args: {
    category: {
      id: 'c3',
      name: 'Mercado',
      color: '#ffa940',
      icon: '🛒',
      parentId: null,
      categoryType: 'Outgoing',
    },
  },
};

export const Transfer: Story = {
  args: {
    category: {
      id: 'c4',
      name: 'Transferência',
      color: '#00d4ff',
      icon: '💸',
      parentId: null,
      categoryType: 'Transfer',
    },
  },
};

export const Income: Story = {
  args: {
    category: {
      id: 'c5',
      name: 'Salary',
      color: '#00ffa3',
      icon: '💰',
      parentId: null,
      categoryType: 'Incoming',
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <Group gap="md">
      <CategoryBadge
        category={{
          id: 'c1',
          name: 'Comida',
          color: '#b47aff',
          icon: '🍔',
          parentId: null,
          categoryType: 'Outgoing',
        }}
      />
      <CategoryBadge
        category={{
          id: 'c2',
          name: 'Farmacia',
          color: '#ffa940',
          icon: '💊',
          parentId: null,
          categoryType: 'Outgoing',
        }}
      />
      <CategoryBadge
        category={{
          id: 'c3',
          name: 'Outros',
          color: '#ff6b9d',
          icon: '🎁',
          parentId: null,
          categoryType: 'Outgoing',
        }}
      />
      <CategoryBadge
        category={{
          id: 'c4',
          name: 'Transferência',
          color: '#00d4ff',
          icon: '💸',
          parentId: null,
          categoryType: 'Transfer',
        }}
      />
      <CategoryBadge
        category={{
          id: 'c5',
          name: 'Salary',
          color: '#00ffa3',
          icon: '💰',
          parentId: null,
          categoryType: 'Incoming',
        }}
      />
    </Group>
  ),
};
