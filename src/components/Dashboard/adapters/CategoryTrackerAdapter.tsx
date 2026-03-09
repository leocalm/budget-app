import { useCategories } from '@/hooks/useCategories';
import { useSpentPerCategory } from '@/hooks/useDashboard';
import type { CardProps } from '../cardRegistry';
import { CategoryTrackerCard } from '../CategoryTrackerCard';

export function CategoryTrackerAdapter({ selectedPeriodId, entityId }: CardProps) {
  const { data: categories, isLoading: isCategoriesLoading } = useCategories(selectedPeriodId);
  const { data: spentPerCategory, isLoading: isSpentLoading } =
    useSpentPerCategory(selectedPeriodId);

  const category = categories?.find((c) => c.id === entityId);
  const categoryData = spentPerCategory?.find((s) => s.categoryName === category?.name);

  return (
    <CategoryTrackerCard
      categoryData={categoryData}
      categoryName={category?.name}
      isLoading={isCategoriesLoading || isSpentLoading}
    />
  );
}
