import { useAccounts } from '@/hooks/useAccounts';
import { useBudgetPerDay } from '@/hooks/useDashboard';
import { BalanceLineChartCard } from '../BalanceLineChartCard';
import type { CardProps } from '../cardRegistry';

export function BudgetPerDayAdapter({ selectedPeriodId }: CardProps) {
  const { data: budgetPerDay, isLoading, isError, refetch } = useBudgetPerDay(selectedPeriodId);
  const { data: accounts } = useAccounts(selectedPeriodId);

  return (
    <BalanceLineChartCard
      data={budgetPerDay}
      accounts={accounts}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => {
        void refetch();
      }}
    />
  );
}
