import { useBudgetStability } from '@/hooks/useDashboard';
import { BudgetStabilityCard } from '../BudgetStabilityCard';
import type { CardProps } from '../cardRegistry';

export function BudgetStabilityCardAdapter({ selectedPeriodId }: CardProps) {
  const isPeriodMissing = selectedPeriodId === null;
  const {
    data: budgetStability,
    isLoading: isBudgetStabilityLoading,
    isError: isBudgetStabilityError,
    refetch: refetchBudgetStability,
  } = useBudgetStability({ enabled: !isPeriodMissing });

  return (
    <BudgetStabilityCard
      data={budgetStability}
      isLoading={isBudgetStabilityLoading}
      isError={isBudgetStabilityError}
      onRetry={() => {
        void refetchBudgetStability();
      }}
    />
  );
}
