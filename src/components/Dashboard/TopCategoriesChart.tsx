import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Text } from '@mantine/core';
import { CategoryListSkeleton, StateRenderer } from '@/components/Utils';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { SpentPerCategory } from '@/types/dashboard';
import { formatCurrency } from '@/utils/currency';
import styles from './Dashboard.module.css';

interface TopCategoriesChartProps {
  title?: string;
  isLocked?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  data: SpentPerCategory[];
  isLoading?: boolean;
}

// Array of colors for category bars
const CATEGORY_COLORS = [
  { start: '#ff6b9d', end: '#ff8fb3' }, // danger/pink
  { start: '#ffa940', end: '#ffbd6b' }, // warning/orange
  { start: '#b47aff', end: '#d4a5ff' }, // purple
  { start: '#00ffa3', end: '#5eff74' }, // success/green
  { start: '#00d4ff', end: '#5ae1ff' }, // primary/cyan
];

export function TopCategoriesChart({
  title,
  isLocked = false,
  isError = false,
  onRetry,
  data,
  isLoading,
}: TopCategoriesChartProps) {
  const { t, i18n } = useTranslation();
  const globalCurrency = useDisplayCurrency();

  const maxSpent = useMemo(() => {
    // amountSpent comes in cents
    return Math.max(...data.map((item) => item.amountSpent), 100);
  }, [data]);

  const format = (valueInCents: number): string => {
    return formatCurrency(valueInCents, globalCurrency, i18n.language);
  };

  return (
    <StateRenderer
      variant="card"
      isLocked={isLocked}
      lockMessage={t('states.locked.message.periodRequired')}
      lockAction={{ label: t('states.locked.configure'), to: '/periods' }}
      hasError={isError}
      errorMessage={t('states.error.loadFailed.message')}
      onRetry={onRetry}
      isLoading={Boolean(isLoading)}
      loadingSkeleton={
        <Stack gap="md" w="100%">
          <CategoryListSkeleton count={5} />
        </Stack>
      }
      isEmpty={!data || data.length === 0}
      emptyItemsLabel={t('states.contract.items.categories')}
      emptyMessage={t('states.empty.charts.message')}
    >
      <Stack gap="xl">
        {title ? (
          <Text fw={600} size="lg">
            {title}
          </Text>
        ) : null}
        <div className={styles.categoryBarContainer}>
          {data.map((category, index) => {
            const percentage = (category.amountSpent / maxSpent) * 100;
            const colors = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

            return (
              <div key={category.categoryName} className={styles.categoryItem}>
                <div className={styles.categoryName}>{category.categoryName}</div>
                <div className={styles.categoryBarWrapper}>
                  <div
                    className={styles.categoryBar}
                    style={
                      {
                        width: `${percentage}%`,
                        '--bar-color': colors.start,
                        '--bar-color-end': colors.end,
                      } as React.CSSProperties
                    }
                  />
                </div>
                <div className={styles.categoryAmount}>{format(category.amountSpent)}</div>
              </div>
            );
          })}
        </div>
      </Stack>
    </StateRenderer>
  );
}
