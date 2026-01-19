import { Grid, Stack, Text, Title } from '@mantine/core';
import { BasicAppShell } from '@/AppShell';
import { TransactionsTable } from '@/components/Transactions';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useBudgetPeriods } from '@/hooks/useBudget';
import { useTransactions } from '@/hooks/useTransactions';

export function TransactionsPage() {
  const { data: periods = [] } = useBudgetPeriods();
  const { selectedPeriodId, setSelectedPeriodId } = useBudgetPeriodSelection();

  const { data: transactions, isLoading, isError } = useTransactions(selectedPeriodId);

  return (
    <BasicAppShell>
      <Stack gap="md" w="100%">
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Title order={2} fw={800}>
              Transactions
            </Title>
            <Text size="sm" c="dimmed">
              Review and manage your financial activity for the selected period.
            </Text>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }} visibleFrom="md" />
        </Grid>

        <TransactionsTable
          transactions={transactions}
          isLoading={isLoading}
          isError={isError}
          insertEnabled
        />
      </Stack>
    </BasicAppShell>
  );
}
