import { SimpleGrid, Stack, Text, Title } from '@mantine/core';
import {
  AccountCard,
  CashFlowCard,
  CurrentPeriodCard,
  NetPositionCard,
  RecentTransactionsCard,
  SpendingTrendCard,
  TopVendorsCard,
} from '@/components/v2/Dashboard';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useAccounts } from '@/hooks/v2/useAccounts';

export function DashboardV2Page() {
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const { data: accountsData } = useAccounts();

  const accounts = accountsData?.data ?? [];
  const activeAccounts = accounts.filter((a) => a.status === 'active');

  if (!selectedPeriodId) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <div>
          <Title order={2} fw={700}>
            Dashboard
          </Title>
          <Text c="dimmed" fz="sm">
            No budget period selected. Please select a period to view your dashboard.
          </Text>
        </div>
      </Stack>
    );
  }

  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      <div>
        <Title order={2} fw={700}>
          Dashboard
        </Title>
        <Text c="dimmed" fz="sm">
          Your finance pulse, at a glance
        </Text>
      </div>

      {/* Hero cards */}
      <CurrentPeriodCard periodId={selectedPeriodId} />
      <NetPositionCard periodId={selectedPeriodId} />

      {/* Two-column grid for smaller cards */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <CashFlowCard periodId={selectedPeriodId} />
        <RecentTransactionsCard periodId={selectedPeriodId} />
        <SpendingTrendCard periodId={selectedPeriodId} />
        <TopVendorsCard periodId={selectedPeriodId} />
      </SimpleGrid>

      {/* Individual account cards */}
      {activeAccounts.length > 0 && (
        <>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mt="md">
            Your Accounts
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {activeAccounts.map((account) => (
              <AccountCard key={account.id} accountId={account.id} periodId={selectedPeriodId} />
            ))}
          </SimpleGrid>
        </>
      )}
    </Stack>
  );
}
