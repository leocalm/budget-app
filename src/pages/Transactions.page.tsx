import { useTranslation } from 'react-i18next';
import { Grid, Stack, Text, Title } from '@mantine/core';
import { BasicAppShell } from '@/AppShell';
import { TransactionsTable } from '@/components/Transactions';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useTransactions } from '@/hooks/useTransactions';

export function TransactionsPage() {
  const { t } = useTranslation();
  const { selectedPeriodId } = useBudgetPeriodSelection();

  const { data: transactions, isLoading, isError, refetch } = useTransactions(selectedPeriodId);

  return (
    <BasicAppShell>
      <Stack gap="md" w="100%">
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Title order={2} fw={800}>
              {t('transactionsPage.title')}
            </Title>
            <Text size="sm" c="dimmed">
              {t('transactionsPage.subtitle')}
            </Text>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }} visibleFrom="md" />
        </Grid>

        <TransactionsTable
          transactions={transactions}
          isLocked={selectedPeriodId === null}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => {
            void refetch();
          }}
          insertEnabled
        />
      </Stack>
    </BasicAppShell>
  );
}
