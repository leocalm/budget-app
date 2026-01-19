import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Divider, Grid, Paper, Stack, Text, Title, useMantineColorScheme } from '@mantine/core';
import { useBudgetedCategories, useUnbudgetedCategories } from '@/hooks/useCategories';
import { BudgetedCategories } from './BudgetedCategories';
import { BudgetOverview } from './BudgetOverview';
import { UnbudgetedCategories } from './UnbudgetedCategories';

export function BudgetContainer() {
  const queryClient = useQueryClient();
  const { colorScheme } = useMantineColorScheme();
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: budgetedCategories } = useBudgetedCategories();
  const { data: unbudgetedCategories, isLoading: isUnbudgetedCategoriesLoading } =
    useUnbudgetedCategories();

  const handleCategoryAdded = async (newId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['budgetedCategories'] }),
      queryClient.invalidateQueries({ queryKey: ['unbudgetedCategories'] }),
    ]);
    setEditingId(newId);
  };

  // Mock data for the overview - in a real app, this would be aggregated from the useBudgetedCategories hook
  const overviewData = {
    totalBudget: (budgetedCategories || []).reduce((acc, cat) => acc + cat.budgetedValue, 0), // 2500.00
    totalSpent: 125000, // 1250.00
    allocation: (budgetedCategories || []).map((cat) => ({
      name: cat.category.name,
      value: cat.budgetedValue,
      color: cat.category.color,
    })),
  };

  return (
    <Stack gap="xl">
      <div>
        <Title order={2} fw={800}>
          Monthly Budget
        </Title>
        <Text c="dimmed" size="sm">
          Manage your spending limits and assign budgets to your categories.
        </Text>
      </div>

      <BudgetOverview
        totalBudget={overviewData.totalBudget}
        totalSpent={overviewData.totalSpent}
        allocationData={overviewData.allocation}
      />

      <Grid gutter={40}>
        {/* Main Area: Existing Budgeted Items */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <BudgetedCategories
            editingId={editingId}
            onEditingChange={setEditingId}
            categories={budgetedCategories || []}
          />
        </Grid.Col>

        {/* Sidebar Area: Pending Items */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper
            withBorder
            p="lg"
            radius="md"
            style={{
              background:
                colorScheme === 'dark'
                  ? 'var(--mantine-color-dark-6)'
                  : 'var(--mantine-color-gray-0)',
            }}
          >
            <Title order={4} mb={4}>
              Unbudgeted
            </Title>
            <Text size="xs" c="dimmed" mb="lg">
              Click a category to set its monthly limit and add it to your plan.
            </Text>

            <Divider mb="lg" variant="dashed" />

            <UnbudgetedCategories
              onCategoryAdded={handleCategoryAdded}
              categories={unbudgetedCategories || []}
              isLoading={isUnbudgetedCategoriesLoading}
            />
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
