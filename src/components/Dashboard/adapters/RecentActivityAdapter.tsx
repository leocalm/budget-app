import { useRecentTransactions } from '@/hooks/useDashboard';
import type { CardProps } from '../cardRegistry';
import { RecentActivityTable } from '../RecentActivityTable';

export function RecentActivityAdapter({ selectedPeriodId }: CardProps) {
  const { data: transactions } = useRecentTransactions(selectedPeriodId);

  return <RecentActivityTable transactions={transactions ?? []} />;
}
