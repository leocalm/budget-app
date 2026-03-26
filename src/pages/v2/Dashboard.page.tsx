import { Stack, Text, Title } from '@mantine/core';
import { AccountCard, CurrentPeriodCard, NetPositionCard } from '@/components/v2/Dashboard';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useAccounts } from '@/hooks/v2/useAccounts';

export function DashboardV2Page() {
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const { data: accountsData } = useAccounts();

  const accounts = accountsData?.data ?? [];
  const activeAccounts = accounts.filter((a) => a.status === 'active');

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

      {selectedPeriodId ? (
        <>
          <CurrentPeriodCard periodId={selectedPeriodId} />
          <NetPositionCard periodId={selectedPeriodId} />
          {activeAccounts.map((account) => (
            <AccountCard key={account.id} accountId={account.id} periodId={selectedPeriodId} />
          ))}
        </>
      ) : (
        <Text c="dimmed" fz="sm">
          No budget period selected. Please select a period to view your dashboard.
        </Text>
      )}
    </Stack>
  );
}
