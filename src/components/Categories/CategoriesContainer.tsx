import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group, SegmentedControl, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import { CategoryResponse } from '@/types/category';
import { CategoryCard } from './CategoryCard';
import { CreateCategory } from './CreateCategory';

type CategoryTypeFilter = 'all' | 'Incoming' | 'Outgoing' | 'Transfer';

export function CategoriesContainer() {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useCategories();
  const [typeFilter, setTypeFilter] = useState<CategoryTypeFilter>('all');
  const deleteMutation = useDeleteCategory();

  // In a real app, we would fetch these stats or derive them from transactions
  // For now, we'll generate some mock stats based on the category ID to be consistent
  const getCategoryStats = (categoryId: string) => {
    // Deterministic pseudo-random based on ID
    const hash = categoryId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      monthlySpent: (hash % 500) * 100, // 0 - 500.00
      transactionCount: hash % 20,
      budgetLimit: hash % 2 === 0 ? (hash % 1000) * 100 : undefined,
    };
  };

  const filteredCategories = useMemo(() => {
    if (!categories) {
      return [];
    }
    if (typeFilter === 'all') {
      return categories;
    }
    return categories.filter((c) => c.categoryType === typeFilter);
  }, [categories, typeFilter]);

  // Group categories by type for better organization when "all" is selected
  const groupedCategories = useMemo(() => {
    if (typeFilter !== 'all') {
      return { [typeFilter]: filteredCategories };
    }

    const groups: Record<string, CategoryResponse[]> = {
      Outgoing: [],
      Incoming: [],
      Transfer: [],
    };

    filteredCategories.forEach((c) => {
      if (groups[c.categoryType]) {
        groups[c.categoryType].push(c);
      }
    });

    return groups;
  }, [filteredCategories, typeFilter]);

  const onDeleteCategory = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Categories</Title>
          <Text c="dimmed">Organize your transactions</Text>
        </div>
        <CreateCategory />
      </Group>

      <SegmentedControl
        value={typeFilter}
        onChange={(value) => setTypeFilter(value as CategoryTypeFilter)}
        data={[
          { label: 'All', value: 'all' },
          { label: 'Expenses', value: 'Outgoing' },
          { label: 'Income', value: 'Incoming' },
          { label: 'Transfers', value: 'Transfer' },
        ]}
        size="sm"
        radius="md"
      />

      {Object.entries(groupedCategories).map(
        ([type, cats]) =>
          cats.length > 0 && (
            <Stack key={type} gap="md">
              {typeFilter === 'all' && (
                <Text fw={700} c="dimmed" tt="uppercase" size="sm" mt="md">
                  {type === 'Outgoing' ? 'Expenses' : type === 'Incoming' ? 'Income' : 'Transfers'}
                </Text>
              )}
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
                {cats.map((category) => {
                  const stats = getCategoryStats(category.id);
                  return (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      monthlySpent={stats.monthlySpent}
                      transactionCount={stats.transactionCount}
                      budgetLimit={stats.budgetLimit}
                      onEdit={() => {}} // Connect to edit modal
                      onDelete={onDeleteCategory} // Connect to delete mutation
                      onClick={(cat) => navigate(`/categories/${cat.id}`)}
                    />
                  );
                })}
              </SimpleGrid>
            </Stack>
          )
      )}
    </Stack>
  );
}
