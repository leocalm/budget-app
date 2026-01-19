import { useEffect, useState } from 'react';
import { BasicAppShell } from '@/AppShell';
import { Dashboard } from '@/components/Dashboard/Dashboard';
import { useCurrentBudgetPeriod } from '@/hooks/useBudget';

export function HomePage() {
  const { data: currentPeriod } = useCurrentBudgetPeriod();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);

  useEffect(() => {
    if (currentPeriod && !selectedPeriodId) {
      setSelectedPeriodId(currentPeriod.id);
    }
  }, [currentPeriod]);

  return (
    <BasicAppShell>
      <Dashboard selectedPeriodId={selectedPeriodId} />
    </BasicAppShell>
  );
}
