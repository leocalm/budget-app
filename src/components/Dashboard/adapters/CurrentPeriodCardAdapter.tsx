import { useMonthlyBurnIn, useMonthProgress } from '@/hooks/useDashboard';
import type { CardProps } from '../cardRegistry';
import { CurrentPeriodCard } from '../CurrentPeriodCard';

export function CurrentPeriodCardAdapter({ selectedPeriodId }: CardProps) {
  const {
    data: monthlyBurnIn,
    isLoading: isMonthlyBurnInLoading,
    error: monthlyBurnInError,
    refetch: refetchMonthlyBurnIn,
  } = useMonthlyBurnIn(selectedPeriodId);
  const {
    data: monthProgress,
    isLoading: isMonthProgressLoading,
    error: monthProgressError,
    refetch: refetchMonthProgress,
  } = useMonthProgress(selectedPeriodId);

  const isError = Boolean(monthlyBurnInError || monthProgressError);
  const isLoading =
    selectedPeriodId !== null &&
    !isError &&
    (isMonthlyBurnInLoading || isMonthProgressLoading || !monthlyBurnIn || !monthProgress);

  const onRetry = () => {
    void Promise.all([refetchMonthlyBurnIn(), refetchMonthProgress()]);
  };

  return (
    <CurrentPeriodCard
      selectedPeriodId={selectedPeriodId}
      monthlyBurnIn={monthlyBurnIn}
      monthProgress={monthProgress}
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
    />
  );
}
