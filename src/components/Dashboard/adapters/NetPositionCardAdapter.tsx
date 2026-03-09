import { useTranslation } from 'react-i18next';
import { useNetPosition } from '@/hooks/useDashboard';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import type { CardProps } from '../cardRegistry';
import { NetPositionCard } from '../NetPositionCard';

export function NetPositionCardAdapter({ selectedPeriodId }: CardProps) {
  const { i18n } = useTranslation();
  const globalCurrency = useDisplayCurrency();
  const {
    data: netPosition,
    isLoading: isNetPositionLoading,
    isError: isNetPositionError,
    refetch: refetchNetPosition,
  } = useNetPosition(selectedPeriodId);

  return (
    <NetPositionCard
      data={netPosition}
      isLoading={isNetPositionLoading}
      isError={isNetPositionError}
      onRetry={() => {
        void refetchNetPosition();
      }}
      currency={globalCurrency}
      locale={i18n.language}
    />
  );
}
