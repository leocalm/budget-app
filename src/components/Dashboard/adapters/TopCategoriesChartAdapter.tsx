import { useSpentPerCategory } from '@/hooks/useDashboard';
import type { CardProps } from '../cardRegistry';
import { TopCategoriesChart } from '../TopCategoriesChart';

export function TopCategoriesChartAdapter({ selectedPeriodId }: CardProps) {
  const {
    data: spentPerCategory,
    isLoading,
    isError,
    refetch,
  } = useSpentPerCategory(selectedPeriodId);

  return (
    <TopCategoriesChart
      data={spentPerCategory ?? []}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => {
        void refetch();
      }}
    />
  );
}
