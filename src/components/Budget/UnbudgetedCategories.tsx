import React from 'react';
import { Badge, Group, Paper, Stack, Text, UnstyledButton } from '@mantine/core';
import { useCreateBudgetCategory } from '@/hooks/useCategories';
import { CategoryResponse } from '@/types/category';

interface UnbudgetedCategoriesProps {
  onCategoryAdded?: (id: string, initialValue: number) => void;
  categories: CategoryResponse[];
  isLoading: boolean;
}

export function UnbudgetedCategories({
  onCategoryAdded,
  categories,
  isLoading,
}: UnbudgetedCategoriesProps) {
  const createMutation = useCreateBudgetCategory();

  const handleAdd = (categoryId: string) => {
    createMutation.mutate(
      { categoryId, budgetedValue: 0 },
      {
        onSuccess: (newBudgetCategory) => {
          onCategoryAdded?.(newBudgetCategory.id, 0);
        },
      }
    );
  };

  if (isLoading) {
    return <Text size="sm">Loading...</Text>;
  }

  if (!categories || categories.length === 0) {
    return (
      <Paper withBorder p="md" radius="md" style={{ borderStyle: 'dashed' }}>
        <Text size="xs" c="dimmed" ta="center">
          All categories are budgeted!
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="xs">
      <Group gap="xs">
        {categories.map((category) => (
          <UnstyledButton
            key={category.id}
            onClick={() => handleAdd(category.id)}
            disabled={createMutation.isPending}
          >
            <Badge
              variant="light"
              color="blue"
              size="lg"
              radius="sm"
              leftSection={<span>➕</span>}
              style={{ cursor: 'pointer' }}
              styles={{
                root: { textTransform: 'none', paddingLeft: 8, paddingRight: 10 },
              }}
            >
              {category.icon} {category.name}
            </Badge>
          </UnstyledButton>
        ))}
      </Group>
    </Stack>
  );
}
