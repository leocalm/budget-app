import { useEffect, useState } from 'react';
import { useCurrentBudgetPeriod } from '@/hooks/useBudget';
import { Dashboard } from './Dashboard';

export function DashboardPage() {
  const { data: currentPeriod } = useCurrentBudgetPeriod();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);

  useEffect(() => {
    if (currentPeriod && !selectedPeriodId) {
      setSelectedPeriodId(currentPeriod.id);
    }
  }, [currentPeriod, selectedPeriodId]);

  return <Dashboard selectedPeriodId={selectedPeriodId} />;
}
