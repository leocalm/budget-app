import { useMemo } from 'react';
import { buildNetPosition } from './accountsAdapter';
import {
  buildBudgetStability,
  buildCashFlow,
  buildCurrentPeriod,
  buildCurrentPeriodHistory,
  buildFixedCategories,
  buildNetPositionHistory,
  buildSpendingTrend,
  buildSubscriptionsDashboard,
  buildTopVendors,
} from './dashboardAdapter';
import { useBudgetPeriods } from './useBudgetPeriods';
import { useEncryptedStore } from './useEncryptedStore';

// All 12 dashboard endpoints were retired by the encrypted v2 API (Phase
// 2c). Each hook here resolves its payload from the decrypted entity
// store — cross-period widgets (spending trend, budget stability, net-
// position history) degrade to a neutral shape per iOS Phase 4a parity
// because the current store only holds the selected period's transactions.

function pickSelectedPeriod(store: ReturnType<typeof useBudgetPeriods>, periodId: string) {
  const list = store.data?.data as { id: string }[] | undefined;
  return list?.find((p) => p.id === periodId) ?? null;
}

export function useDashboardCurrentPeriod(periodId: string) {
  const store = useEncryptedStore(periodId);
  const periods = useBudgetPeriods();
  const data = useMemo(() => {
    if (!store.data) {
      return undefined;
    }
    const period = pickSelectedPeriod(periods, periodId) as Parameters<
      typeof buildCurrentPeriod
    >[1];
    return buildCurrentPeriod(store.data, period);
  }, [store.data, periods.data, periodId]);
  return { data, isLoading: store.isLoading, isError: store.isError, refetch: store.refetch };
}

export function useDashboardNetPosition(periodId: string) {
  const store = useEncryptedStore(periodId);
  const data = useMemo(() => (store.data ? buildNetPosition(store.data) : undefined), [store.data]);
  return { data, isLoading: store.isLoading, isError: store.isError, refetch: store.refetch };
}

export function useDashboardNetPositionHistory(periodId: string) {
  const store = useEncryptedStore(periodId);
  const data = useMemo(
    () => (store.data ? buildNetPositionHistory(store.data) : undefined),
    [store.data]
  );
  return { data, isLoading: store.isLoading, isError: store.isError, refetch: store.refetch };
}

export function useDashboardCurrentPeriodHistory(periodId: string) {
  const store = useEncryptedStore(periodId);
  const data = useMemo(
    () => (store.data ? buildCurrentPeriodHistory(store.data) : undefined),
    [store.data]
  );
  return { data, isLoading: store.isLoading, isError: store.isError, refetch: store.refetch };
}

export function useDashboardCashFlow(periodId: string) {
  const store = useEncryptedStore(periodId);
  const data = useMemo(() => (store.data ? buildCashFlow(store.data) : undefined), [store.data]);
  return { data, isLoading: store.isLoading, isError: store.isError, refetch: store.refetch };
}

export function useDashboardSpendingTrend(periodId: string) {
  const store = useEncryptedStore(periodId);
  const data = useMemo(
    () => (store.data ? buildSpendingTrend(store.data) : undefined),
    [store.data]
  );
  return { data, isLoading: store.isLoading, isError: store.isError, refetch: store.refetch };
}

export function useDashboardTopVendors(periodId: string) {
  const store = useEncryptedStore(periodId);
  const data = useMemo(() => (store.data ? buildTopVendors(store.data) : undefined), [store.data]);
  return { data, isLoading: store.isLoading, isError: store.isError, refetch: store.refetch };
}

export function useDashboardBudgetStability(periodId: string) {
  const store = useEncryptedStore(periodId);
  const data = useMemo(
    () => (store.data ? buildBudgetStability(store.data) : undefined),
    [store.data]
  );
  return { data, isLoading: store.isLoading, isError: store.isError, refetch: store.refetch };
}

export function useDashboardFixedCategories(periodId: string) {
  const store = useEncryptedStore(periodId);
  const data = useMemo(
    () => (store.data ? buildFixedCategories(store.data) : undefined),
    [store.data]
  );
  return { data, isLoading: store.isLoading, isError: store.isError, refetch: store.refetch };
}

export function useDashboardSubscriptions(periodId: string) {
  const store = useEncryptedStore(periodId);
  const data = useMemo(
    () => (store.data ? buildSubscriptionsDashboard(store.data) : undefined),
    [store.data]
  );
  return { data, isLoading: store.isLoading, isError: store.isError, refetch: store.refetch };
}
