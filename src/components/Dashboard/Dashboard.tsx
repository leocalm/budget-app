import React from 'react';
import { Grid } from '@mantine/core';
import { BalanceLineChartCard } from '@/components/Dashboard/BalanceLineChartCard';
import { CategoriesChartCard } from '@/components/Dashboard/CategoriesChartCard';
import { MonthProgressCard } from '@/components/Dashboard/MonthProgressCard';
import { RecentTransactionsCard } from '@/components/Dashboard/RecentTransactionsCard';
import { RemainingBudgetCard } from '@/components/Dashboard/RemainingBudgetCard';
import { useAccounts } from '@/hooks/useAccounts';
import { useDashboardData } from '@/hooks/useDashboard';

interface DashboardProps {
  selectedPeriodId: string | null;
}

export const Dashboard = ({ selectedPeriodId }: DashboardProps) => {
  const { data: dashboardData } = useDashboardData(selectedPeriodId);
  const { data: accounts } = useAccounts();

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 7 }}>
        <RemainingBudgetCard
          data={dashboardData?.monthlyBurnIn}
          totalAsset={dashboardData?.totalAsset}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 5 }}>
        <MonthProgressCard data={dashboardData?.monthProgress} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, lg: 8 }}>
        <BalanceLineChartCard data={dashboardData?.budgetPerDay || []} accounts={accounts || []} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, lg: 4 }}>
        <CategoriesChartCard data={dashboardData?.spentPerCategory} />
      </Grid.Col>
      <Grid.Col span={12}>
        <RecentTransactionsCard data={dashboardData?.recentTransactions || []} />
      </Grid.Col>
    </Grid>
  );
};
