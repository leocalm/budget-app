import { useTranslation } from 'react-i18next';
import { Grid, Paper, Stack, Text } from '@mantine/core';
import { BudgetAllocationChart } from './BudgetAllocationChart';
import { BudgetBreakdownList } from './BudgetBreakdownList';

interface BudgetOverviewProps {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  overBudget: number;
  allocationData: { name: string; value: number; color: string }[];
  unbudgetedCount: number;
}

export function BudgetOverview({
  totalBudget,
  totalSpent,
  remaining,
  overBudget,
  allocationData,
  unbudgetedCount,
}: BudgetOverviewProps) {
  const { t } = useTranslation();

  return (
    <Grid gutter={{ base: 'md', md: 'xl' }}>
      {/* Left: Budget Allocation Chart */}
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Paper withBorder p="xl" radius="md" h="100%">
          <Stack gap="md" h="100%">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
              {t('budget.overview.allocationTitle')}
            </Text>
            <div
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <BudgetAllocationChart data={allocationData} totalBudget={totalBudget} />
            </div>
          </Stack>
        </Paper>
      </Grid.Col>

      {/* Right: Budget Breakdown List */}
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Paper withBorder p="xl" radius="md">
          <Stack gap="md">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
              {t('budget.overview.breakdownTitle')}
            </Text>
            <BudgetBreakdownList
              totalBudget={totalBudget}
              totalSpent={totalSpent}
              remaining={remaining}
              overBudget={overBudget}
              unbudgetedCount={unbudgetedCount}
            />
          </Stack>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}
