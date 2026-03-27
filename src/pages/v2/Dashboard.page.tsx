import { useMemo } from 'react';
import { SimpleGrid, Stack, Text, Title } from '@mantine/core';
import {
  AccountCard,
  CashFlowCard,
  CurrentPeriodCard,
  FixedCategoriesCard,
  NetPositionCard,
  RecentTransactionsCard,
  SpendingTrendCard,
  SubscriptionsCard,
  TopVendorsCard,
  VariableCategoriesCard,
} from '@/components/v2/Dashboard';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useAccounts } from '@/hooks/v2/useAccounts';
import { usePreferences } from '@/hooks/v2/useSettings';

export function DashboardV2Page() {
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const { data: accountsData } = useAccounts();
  const { data: prefsData } = usePreferences();

  const accounts = accountsData?.data ?? [];
  const activeAccounts = accounts.filter((a) => a.status === 'active');

  const dashboardLayout = useMemo(() => {
    const layout = prefsData?.dashboardLayout;
    return {
      hiddenWidgets: new Set(layout?.hiddenWidgets ?? []),
      visibleAccountIds: layout?.visibleAccountIds ?? null,
    };
  }, [prefsData]);

  const isVisible = (widgetId: string) => !dashboardLayout.hiddenWidgets.has(widgetId);

  const visibleAccounts = useMemo(() => {
    if (dashboardLayout.visibleAccountIds === null) {
      return activeAccounts;
    }
    const idSet = new Set(dashboardLayout.visibleAccountIds);
    return activeAccounts.filter((a) => idSet.has(a.id));
  }, [activeAccounts, dashboardLayout.visibleAccountIds]);

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

  const gridCards = [
    isVisible('cash_flow') && <CashFlowCard key="cash_flow" periodId={selectedPeriodId} />,
    isVisible('recent_transactions') && (
      <RecentTransactionsCard key="recent_transactions" periodId={selectedPeriodId} />
    ),
    isVisible('spending_trend') && (
      <SpendingTrendCard key="spending_trend" periodId={selectedPeriodId} />
    ),
    isVisible('top_vendors') && <TopVendorsCard key="top_vendors" periodId={selectedPeriodId} />,
    isVisible('variable_categories') && (
      <VariableCategoriesCard key="variable_categories" periodId={selectedPeriodId} />
    ),
    isVisible('fixed_categories') && (
      <FixedCategoriesCard key="fixed_categories" periodId={selectedPeriodId} />
    ),
    isVisible('subscriptions') && (
      <SubscriptionsCard key="subscriptions" periodId={selectedPeriodId} />
    ),
  ].filter(Boolean);

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
      {isVisible('current_period') && <CurrentPeriodCard periodId={selectedPeriodId} />}
      {isVisible('net_position') && <NetPositionCard periodId={selectedPeriodId} />}

      {/* Two-column grid for smaller cards */}
      {gridCards.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {gridCards}
        </SimpleGrid>
      )}

      {/* Individual account cards */}
      {visibleAccounts.length > 0 && (
        <>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mt="md">
            Your Accounts
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {visibleAccounts.map((account) => (
              <AccountCard key={account.id} accountId={account.id} periodId={selectedPeriodId} />
            ))}
          </SimpleGrid>
        </>
      )}
    </Stack>
  );
}
