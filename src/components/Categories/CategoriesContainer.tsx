import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, SimpleGrid, Stack, Tabs } from '@mantine/core';
import { EmptyState } from '@/components/Utils';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import { CategoryType } from '@/types/category';
import { PageHeader } from '../Transactions/PageHeader';
import { CategoryCard } from './CategoryCard';
import styles from './Categories.module.css';

type CategoryTypeFilter = 'all' | CategoryType;

export function CategoriesContainer() {
  const { t } = useTranslation();

  // Get selected budget period from context
  const { selectedPeriodId } = useBudgetPeriodSelection();

  const { data: categories } = useCategories(selectedPeriodId);
  const [typeFilter, setTypeFilter] = useState<CategoryTypeFilter>('all');
  const deleteMutation = useDeleteCategory();

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
    <Box
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px',
      }}
    >
      <Stack gap="xl">
        {/* Header */}
        <PageHeader
          title="Categories"
          subtitle="Organize your transactions into meaningful groups."
          actions={
            <Button className={styles.addButton} size="md">
              <span style={{ fontSize: '16px', marginRight: '4px' }}>+</span>
              Add Category
            </Button>
          }
        />

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
        {filteredCategories.length === 0 ? (
          <EmptyState
            icon="📁"
            title={t('states.empty.categories.title')}
            message={t('states.empty.categories.message')}
            primaryAction={{
              label: t('states.empty.categories.addButton', 'Add Category'),
              icon: <span>+</span>,
              onClick: () => {},
            }}
          />
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="lg">
            {filteredCategories.map((category) => {
              // Calculate trend from differenceVsAveragePercentage
              const trendPercentage = Math.abs(category.differenceVsAveragePercentage);
              const trend =
                trendPercentage > 0
                  ? {
                      direction:
                        category.differenceVsAveragePercentage > 0
                          ? ('up' as const)
                          : ('down' as const),
                      percentage: trendPercentage,
                    }
                  : undefined;

              return (
                <CategoryCard
                  key={category.id}
                  category={category}
                  monthlySpent={category.usedInPeriod}
                  transactionCount={category.transactionCount}
                  trend={trend}
                  onEdit={() => {}} // Connect to edit modal
                  onDelete={onDeleteCategory}
                />
              );
            })}
          </SimpleGrid>
        )}
      </Stack>
    </Box>
  );
}
