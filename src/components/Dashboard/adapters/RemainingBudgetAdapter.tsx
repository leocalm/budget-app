import { useAccounts } from '@/hooks/useAccounts';
import { useMonthlyBurnIn } from '@/hooks/useDashboard';
import type { CardProps } from '../cardRegistry';
import { RemainingBudgetCard } from '../RemainingBudgetCard';

export function RemainingBudgetAdapter({ selectedPeriodId }: CardProps) {
  const { data: monthlyBurnIn } = useMonthlyBurnIn(selectedPeriodId);
  const { data: accounts } = useAccounts(selectedPeriodId);

  const totalAsset = accounts?.reduce((sum, acc) => sum + acc.balance, 0);

  return <RemainingBudgetCard data={monthlyBurnIn} totalAsset={totalAsset} />;
}
