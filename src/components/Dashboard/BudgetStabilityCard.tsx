import { useTranslation } from 'react-i18next';
import { Button, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { BudgetStability } from '@/types/dashboard';
import styles from './Dashboard.module.css';

interface BudgetStabilityCardProps {
  data?: BudgetStability;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function BudgetStabilityCard({
  data,
  isLoading,
  isError,
  onRetry,
}: BudgetStabilityCardProps) {
  const { t } = useTranslation();

  const isEmpty = !data || data.totalClosedPeriods < 1;
  const hasInsufficientData = !isEmpty && data.totalClosedPeriods < 3;

  const recentPeriods = data ? data.recentClosedPeriods.slice(0, 6) : [];
  const outsideToleranceCount = recentPeriods.filter((p) => p.isOutsideTolerance).length;
  const recentPeriodCount = recentPeriods.length;

  return (
    <Paper className={styles.wireframeCard} withBorder>
      <Text component="h2">{t('dashboard.stability.title')}</Text>

      {isError ? (
        <Stack gap="xs" align="flex-start">
          <Text className={styles.meta}>{t('dashboard.stability.error')}</Text>
          <Button variant="subtle" size="xs" onClick={onRetry}>
            {t('dashboard.stability.retry')}
          </Button>
        </Stack>
      ) : isLoading ? (
        <Stack gap="sm">
          <Skeleton height={46} width="40%" />
          <Skeleton height={18} width="75%" />
          <div className={styles.stabilityStrip}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={`budget-stability-block-loading-${index}`}
                height={16}
                width={14}
                radius="md"
              />
            ))}
          </div>
          <Skeleton height={16} width="45%" />
        </Stack>
      ) : isEmpty ? (
        <Text className={styles.meta}>{t('dashboard.stability.empty')}</Text>
      ) : hasInsufficientData ? (
        <Text className={styles.meta}>{t('dashboard.stability.insufficientData')}</Text>
      ) : (
        <>
          <Text className={styles.valueHero}>{Math.round(data.withinTolerancePercentage)}%</Text>
          <Text className={styles.meta}>
            {t('dashboard.stability.withinRangeCount', {
              within: data.periodsWithinTolerance,
              total: data.totalClosedPeriods,
            })}
          </Text>
          <div className={styles.stabilityStrip}>
            {recentPeriods.map((period) => {
              const isOutside = period.isOutsideTolerance;
              let blockClass = styles.block;
              if (isOutside) {
                blockClass += ` ${styles.blockOutside}`;
              }
              // No current period indicator in data
              return (
                <span
                  key={period.periodId}
                  className={blockClass}
                  aria-label={
                    period.isOutsideTolerance
                      ? t('dashboard.stability.dots.outside')
                      : t('dashboard.stability.dots.within')
                  }
                />
              );
            })}
          </div>
          <Text className={styles.meta}>
            {t('dashboard.stability.outsideToleranceCount', {
              outside: outsideToleranceCount,
              total: recentPeriodCount,
            })}
          </Text>
        </>
      )}
    </Paper>
  );
}
