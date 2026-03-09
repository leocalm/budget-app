import { useAccounts } from '@/hooks/useAccounts';
import { useBudgetPerDay } from '@/hooks/useDashboard';
import { BalanceLineChartCard } from '../BalanceLineChartCard';
import type { CardProps } from '../cardRegistry';

export function BalanceLineChartAdapter({ selectedPeriodId }: CardProps) {
  const {
    data: budgetPerDay,
    isLoading: isBudgetLoading,
    isError: isBudgetError,
    refetch: refetchBudget,
  } = useBudgetPerDay(selectedPeriodId);
  const { data: accounts } = useAccounts(selectedPeriodId);

  const isLoading = isBudgetLoading;
  const isError = isBudgetError;

  return (
    <BalanceLineChartCard
      data={budgetPerDay}
      accounts={accounts}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => {
        void refetchBudget();
      }}
    />
  );
}
