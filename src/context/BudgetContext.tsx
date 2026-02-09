import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { useLocalStorage } from '@mantine/hooks';
import { useBudgetPeriods, useCurrentBudgetPeriod } from '@/hooks/useBudget';

interface BudgetPeriodContextType {
  selectedPeriodId: string | null;
  setSelectedPeriodId: (id: string | null) => void;
}

const BudgetPeriodContext = createContext<BudgetPeriodContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [selectedPeriodId, setSelectedPeriodId] = useLocalStorage<string | null>({
    key: 'budget-period-id',
    defaultValue: null,
  });

  const { data: currentPeriod } = useCurrentBudgetPeriod();
  const { data: periods = [], isFetched: hasFetchedPeriods } = useBudgetPeriods();

  useEffect(() => {
    if (!hasFetchedPeriods) {
      return;
    }

    if (periods.length === 0) {
      if (selectedPeriodId !== null) {
        setSelectedPeriodId(null);
      }

      return;
    }

    const isSelectedPeriodValid = Boolean(
      selectedPeriodId && periods.some((period) => period.id === selectedPeriodId)
    );

    if (isSelectedPeriodValid) {
      return;
    }

    const fallbackPeriod =
      (currentPeriod && periods.find((period) => period.id === currentPeriod.id)) || periods[0];

    if (fallbackPeriod && fallbackPeriod.id !== selectedPeriodId) {
      setSelectedPeriodId(fallbackPeriod.id);
    }
  }, [currentPeriod, hasFetchedPeriods, periods, selectedPeriodId, setSelectedPeriodId]);

  return (
    <BudgetPeriodContext.Provider value={{ selectedPeriodId, setSelectedPeriodId }}>
      {children}
    </BudgetPeriodContext.Provider>
  );
}

export function useBudgetPeriodSelection() {
  const context = useContext(BudgetPeriodContext);
  if (context === undefined) {
    throw new Error('useBudgetPeriodSelection must be used within a BudgetProvider');
  }
  return context;
}
