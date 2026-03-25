import { Stack, Text, Title } from '@mantine/core';
import { CurrentPeriodCard, NetPositionCard } from '@/components/v2/Dashboard';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';

export function DashboardV2Page() {
  const { selectedPeriodId } = useBudgetPeriodSelection();

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
        </>
      ) : (
        <Text c="dimmed" fz="sm">
          No budget period selected. Please select a period to view your dashboard.
        </Text>
      )}
    </Stack>
  );
}
