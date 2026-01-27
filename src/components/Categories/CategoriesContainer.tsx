import React, { useMemo, useState } from 'react';
import { Button, Group, SimpleGrid, Stack, Tabs, Text, Title } from '@mantine/core';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import { CategoryCard } from './CategoryCard';
import styles from './Categories.module.css';

type CategoryTypeFilter = 'all' | 'Incoming' | 'Outgoing' | 'Transfer';

export function CategoriesContainer() {
  const { data: categories } = useCategories();
  const [typeFilter, setTypeFilter] = useState<CategoryTypeFilter>('all');
  const deleteMutation = useDeleteCategory();

  // In a real app, we would fetch these stats or derive them from transactions
  // For now, we'll generate some mock stats based on the category ID to be consistent
  const getCategoryStats = (categoryId: string) => {
    // Deterministic pseudo-random based on ID
    const hash = categoryId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const monthlySpent = (hash % 500) * 100; // 0 - 500.00
    const prevMonthSpent = ((hash + 1) % 450) * 100;

    // Calculate trend
    const diff = monthlySpent - prevMonthSpent;
    const trend =
      diff !== 0
        ? {
            direction: diff > 0 ? ('up' as const) : ('down' as const),
            percentage: Math.abs(Math.round((diff / Math.max(prevMonthSpent, 1)) * 100)),
          }
        : undefined;

    return {
      monthlySpent,
      transactionCount: hash % 20,
      trend,
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

  const onDeleteCategory = (id: string) => {
    deleteMutation.mutate(id);
  };

  // Count categories by type
  const categoryCounts = useMemo(() => {
    if (!categories) {
      return { all: 0, Outgoing: 0, Incoming: 0, Transfer: 0 };
    }
    return {
      all: categories.length,
      Outgoing: categories.filter((c) => c.categoryType === 'Outgoing').length,
      Incoming: categories.filter((c) => c.categoryType === 'Incoming').length,
      Transfer: categories.filter((c) => c.categoryType === 'Transfer').length,
    };
  }, [categories]);

  return (
    <Stack gap="xl">
      {/* Header */}
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={1} fw={700} mb="xs">
            Categories
          </Title>
          <Text size="md" c="dimmed">
            Organize your transactions into meaningful groups.
          </Text>
        </div>
        <Button className={styles.addButton} size="md">
          <span style={{ fontSize: '16px', marginRight: '4px' }}>+</span>
          Add Category
        </Button>
      </Group>

      {/* Filter Tabs */}
      <Tabs
        value={typeFilter}
        onChange={(value) => setTypeFilter(value as CategoryTypeFilter)}
        classNames={{
          root: styles.filterTabs,
          tab: styles.filterTab,
        }}
      >
        <Tabs.List style={{ display: 'flex', gap: '8px' }}>
          <Tabs.Tab value="all">
            All <span className={styles.filterCount}>{categoryCounts.all}</span>
          </Tabs.Tab>
          <Tabs.Tab value="Outgoing">
            Spending <span className={styles.filterCount}>{categoryCounts.Outgoing}</span>
          </Tabs.Tab>
          <Tabs.Tab value="Incoming">
            Income <span className={styles.filterCount}>{categoryCounts.Incoming}</span>
          </Tabs.Tab>
          <Tabs.Tab value="Transfer">
            Transfer <span className={styles.filterCount}>{categoryCounts.Transfer}</span>
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {/* Categories Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="lg">
        {filteredCategories.map((category) => {
          const stats = getCategoryStats(category.id);
          return (
            <CategoryCard
              key={category.id}
              category={category}
              monthlySpent={stats.monthlySpent}
              transactionCount={stats.transactionCount}
              trend={stats.trend}
              onEdit={() => {}} // Connect to edit modal
              onDelete={onDeleteCategory}
            />
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
