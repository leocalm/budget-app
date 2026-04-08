import { createContext, ReactNode, useContext, useEffect, useRef } from 'react';
import { useLocalStorage } from '@mantine/hooks';
import { apiClient } from '@/api/v2client';
import { useBudgetPeriods } from '@/hooks/v2/useBudgetPeriods';
import { useAuth } from './AuthContext';

interface BudgetPeriodContextType {
  selectedPeriodId: string | null;
  setSelectedPeriodId: (id: string | null) => void;
  /** True while the initial period list is still loading (before auto-selection runs). */
  isResolvingPeriod: boolean;
}

const BudgetPeriodContext = createContext<BudgetPeriodContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedPeriodId, setSelectedPeriodId] = useLocalStorage<string | null>({
    key: 'budget-period-id',
    defaultValue: null,
  });

  const {
    data: periodsData,
    isFetched: hasFetchedPeriods,
    refetch: refetchPeriods,
  } = useBudgetPeriods({ limit: 100 });

  const periods = periodsData?.data ?? [];
  const currentPeriod = periods.find((p) => p.status === 'active') ?? null;
  const generatingRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedPeriods) {
      return;
    }

    if (periods.length === 0) {
      if (selectedPeriodId !== null) {
        setSelectedPeriodId(null);
      }

      // If the user has completed onboarding but has no periods yet (e.g.
      // their account predates the cron-on-complete change), generate them now.
      if (user?.onboardingStatus === 'completed' && !generatingRef.current) {
        generatingRef.current = true;
        apiClient
          .POST('/onboarding/complete')
          .then(() => refetchPeriods())
          .catch(() => {})
          .finally(() => {
            generatingRef.current = false;
          });
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

  const isResolvingPeriod = !hasFetchedPeriods;

  return (
    <BudgetPeriodContext.Provider
      value={{ selectedPeriodId, setSelectedPeriodId, isResolvingPeriod }}
    >
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
