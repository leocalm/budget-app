import React, { useMemo } from 'react';
import { Group, Skeleton, Stack, Text } from '@mantine/core';
import { SpentPerCategory } from '@/types/dashboard';
import styles from './Dashboard.module.css';

interface TopCategoriesChartProps {
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

export function TopCategoriesChart({ data, isLoading }: TopCategoriesChartProps) {
  const maxSpent = useMemo(() => {
    return Math.max(...data.map((item) => item.amountSpent), 1);
  }, [data]);

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);

  if (isLoading) {
    return (
      <Stack gap="md">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={50} radius="md" />
        ))}
      </Stack>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Group justify="center" py="xl">
        <Text c="dimmed" size="sm">
          No category data available
        </Text>
      </Group>
    );
  }

  return (
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
            <div className={styles.categoryAmount}>{formatCurrency(category.amountSpent)}</div>
          </div>
        );
      })}
    </div>
  );
}
