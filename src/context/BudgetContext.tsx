import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { useLocalStorage } from '@mantine/hooks';
import { useCurrentBudgetPeriod } from '@/hooks/useBudget';

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

  useEffect(() => {
    if (currentPeriod && !selectedPeriodId) {
      setSelectedPeriodId(currentPeriod.id);
    }
  }, [currentPeriod, selectedPeriodId, setSelectedPeriodId]);

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
