import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Paper, Stack } from '@mantine/core';
import { PageHeader } from '@/components/Transactions/PageHeader';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useBudgetedCategories, useUnbudgetedCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { BudgetedCategories } from './BudgetedCategories';
import { BudgetOverview } from './BudgetOverview';
import { UnbudgetedCategories } from './UnbudgetedCategories';

export function BudgetContainer() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Get the current period from context
  const { selectedPeriodId } = useBudgetPeriodSelection();

  // Fetch budgeted categories and transactions
  const { data: budgetedCategories } = useBudgetedCategories();
  const { data: unbudgetedCategories, isLoading: isUnbudgetedCategoriesLoading } =
    useUnbudgetedCategories();
  const { data: transactions } = useTransactions(selectedPeriodId);

  // Calculate spending per category from transactions
  const categorySpending = useMemo(() => {
    const map = new Map<string, number>();
    transactions?.forEach((t) => {
      // Only count expenses (categories with Outgoing type)
      if (t.category?.categoryType === 'Outgoing') {
        map.set(t.category.id, (map.get(t.category.id) || 0) + t.amount);
      }
    });
    return map;
  }, [transactions]);

  // Calculate totals
  const totalBudget = (budgetedCategories || []).reduce((sum, cat) => sum + cat.budgetedValue, 0);
  const totalSpent = (budgetedCategories || []).reduce(
    (sum, cat) => sum + (categorySpending.get(cat.category.id) || 0),
    0
  );
  const remaining = totalBudget - totalSpent;
  const overBudget = Math.max(0, totalSpent - totalBudget);

  const handleCategoryAdded = async (newId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['budgetedCategories'] }),
      queryClient.invalidateQueries({ queryKey: ['unbudgetedCategories'] }),
    ]);
    setEditingId(newId);
  };

  const allocationData = (budgetedCategories || []).map((cat) => ({
    name: cat.category.name,
    value: cat.budgetedValue,
    color: cat.category.color,
  }));

  return (
    <Box
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px',
      }}
    >
      <Stack gap="xl">
        <PageHeader title={t('budget.container.title')} subtitle={t('budget.container.subtitle')} />

        <BudgetOverview
          totalBudget={totalBudget}
          totalSpent={totalSpent}
          remaining={remaining}
          overBudget={overBudget}
          allocationData={allocationData}
          unbudgetedCount={unbudgetedCategories?.length || 0}
        />

        <Grid gutter={{ base: 'md', md: 'xl' }} columns={3}>
          {/* Main Area: Budgeted Categories (2fr) */}
          <Grid.Col span={{ base: 3, md: 2 }}>
            <BudgetedCategories
              editingId={editingId}
              onEditingChange={setEditingId}
              categories={budgetedCategories || []}
              categorySpending={categorySpending}
            />
          </Grid.Col>

          {/* Sidebar Area: Unbudgeted Categories (1fr) */}
          <Grid.Col span={{ base: 3, md: 1 }}>
            <Paper shadow="sm" radius="md" p="xl" withBorder h="100%">
              <Stack gap="md">
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700 }}>
                    {t('budget.unbudgetedCategories.title')}
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                    {t('budget.unbudgetedCategories.subtitle')}
                  </p>
                </div>

                <UnbudgetedCategories
                  onCategoryAdded={handleCategoryAdded}
                  categories={unbudgetedCategories || []}
                  isLoading={isUnbudgetedCategoriesLoading}
                />
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Box>
  );
}
