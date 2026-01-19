import React from 'react';
import {
  ActionIcon,
  Card,
  Group,
  Menu,
  Progress,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import { CategoryResponse } from '@/types/category';

interface CategoryCardProps {
  category: CategoryResponse;
  monthlySpent: number;
  transactionCount: number;
  budgetLimit?: number;
  onEdit: (category: CategoryResponse) => void;
  onDelete: (id: string) => void;
  onClick?: (category: CategoryResponse) => void;
}

export function CategoryCard({
  category,
  monthlySpent,
  transactionCount,
  budgetLimit,
  onEdit,
  onDelete,
  onClick,
}: CategoryCardProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  // Calculate budget progress if a limit exists
  const percentage = budgetLimit ? (monthlySpent / budgetLimit) * 100 : 0;
  const isOverBudget = percentage > 100;

  return (
    <Card
      padding="lg"
      radius="md"
      style={{
        backgroundColor: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-white)',
        border: '1px solid var(--mantine-color-default-border)',
        borderTop: `4px solid ${category.color || 'var(--mantine-color-gray-5)'}`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
      }}
      // onClick={() => onClick?.(category)}
    >
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <div>
            <Text fw={700} size="sm">
              {category.icon} {category.name}
            </Text>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              {category.categoryType}
            </Text>
          </div>
        </Group>

        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" onClick={(e) => e.stopPropagation()}>
              <span>⋮</span>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<span>✏️</span>} onClick={() => onEdit(category)}>
              Edit Category
            </Menu.Item>
            <Menu.Item
              color="red"
              leftSection={<span>🗑️</span>}
              onClick={() => onDelete(category.id)}
            >
              Delete Category
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Group justify="space-between" align="flex-end" mt="sm">
        <div>
          <Text size="xs" c="dimmed" fw={600}>
            Monthly Spent
          </Text>
          <Text fw={700} size="lg" style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}>
            € {(monthlySpent / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Text size="xs" c="dimmed" fw={600}>
            Transactions
          </Text>
          <Text fw={700} size="lg">
            {transactionCount}
          </Text>
        </div>
      </Group>

      {budgetLimit && (
        <div style={{ marginTop: 16 }}>
          <Group justify="space-between" mb={4}>
            <Text size="xs" c="dimmed">
              Budget: € {(budgetLimit / 100).toLocaleString()}
            </Text>
            <Text size="xs" c={isOverBudget ? 'red' : 'dimmed'} fw={isOverBudget ? 700 : 400}>
              {percentage.toFixed(0)}%
            </Text>
          </Group>
          <Progress
            value={Math.min(percentage, 100)}
            color={isOverBudget ? 'red' : percentage > 85 ? 'orange' : 'green'}
            size="sm"
            radius="xl"
          />
        </div>
      )}
    </Card>
  );
}
