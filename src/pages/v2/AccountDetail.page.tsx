import { useParams } from 'react-router-dom';
import { Stack, Text } from '@mantine/core';
import { AccountDetail } from '@/components/v2/Accounts';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';

export function AccountDetailV2Page() {
  const { id } = useParams<{ id: string }>();
  const { selectedPeriodId } = useBudgetPeriodSelection();

  if (!id) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Text c="dimmed" fz="sm">
          Account not found.
        </Text>
      </Stack>
    );
  }

  if (!selectedPeriodId) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Text c="dimmed" fz="sm">
          No budget period selected. Please select a period.
        </Text>
      </Stack>
    );
  }

  return <AccountDetail accountId={id} periodId={selectedPeriodId} />;
}
