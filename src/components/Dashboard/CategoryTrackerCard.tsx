import { useTranslation } from 'react-i18next';
import { Paper, Progress, Stack, Text } from '@mantine/core';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import type { SpentPerCategory } from '@/types/dashboard';
import { formatCurrency } from '@/utils/currency';

interface CategoryTrackerCardProps {
  categoryData: SpentPerCategory | undefined;
  categoryName: string | undefined;
  isLoading: boolean;
}

export function CategoryTrackerCard({
  categoryData,
  categoryName,
  isLoading,
}: CategoryTrackerCardProps) {
  const { i18n } = useTranslation();
  const globalCurrency = useDisplayCurrency();

  const format = (cents: number) => formatCurrency(cents, globalCurrency, i18n.language);

  if (isLoading || !categoryData || !categoryName) {
    return (
      <Paper withBorder radius="md" p="md" h="100%">
        <Text c="dimmed" size="sm">
          Loading...
        </Text>
      </Paper>
    );
  }

  const percentage = categoryData.budgetedValue
    ? (categoryData.amountSpent / categoryData.budgetedValue) * 100
    : 0;
  const isOverBudget = percentage > 100;

  return (
    <Paper withBorder radius="md" p="md" h="100%">
      <Stack gap="xs">
        <Text size="xs" c="dimmed" fw={600} tt="uppercase">
          {categoryName}
        </Text>

        <Text size="xl" fw={700} style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}>
          {format(categoryData.amountSpent)}
        </Text>

        <Progress
          value={Math.min(percentage, 100)}
          color={isOverBudget ? 'red' : percentage > 80 ? 'orange' : 'cyan'}
          size="sm"
          radius="xl"
        />

        <Text size="xs" c="dimmed">
          {format(categoryData.amountSpent)} of {format(categoryData.budgetedValue)} (
          {Math.round(percentage)}%)
        </Text>
      </Stack>
    </Paper>
  );
}
