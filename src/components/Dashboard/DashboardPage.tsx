import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { Dashboard } from './Dashboard';

export function DashboardPage() {
  const { selectedPeriodId } = useBudgetPeriodSelection();

  return <Dashboard selectedPeriodId={selectedPeriodId} />;
}
