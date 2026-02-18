import { useTranslation } from 'react-i18next';
import { Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
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

  return (
    <Paper
      className={styles.chartCard}
      shadow="md"
      radius="lg"
      p="xl"
      withBorder
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-medium)',
      }}
    >
      <Stack gap="md">
        <Text fw={600} size="lg">
          {t('dashboard.stability.title')}
        </Text>

        {isError ? (
          <Stack gap="xs" align="flex-start">
            <Text size="sm" c="dimmed">
              {t('dashboard.stability.error')}
            </Text>
            <Button variant="subtle" size="xs" onClick={onRetry}>
              {t('dashboard.stability.retry')}
            </Button>
          </Stack>
        ) : isLoading ? (
          <Stack gap="sm">
            <Skeleton height={46} width="40%" />
            <Skeleton height={18} width="75%" />
            <Group gap={8}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={`budget-stability-dot-loading-${index}`}
                  circle
                  height={12}
                  width={12}
                />
              ))}
            </Group>
            <Skeleton height={16} width="45%" />
          </Stack>
        ) : isEmpty ? (
          <Text size="sm" c="dimmed">
            {t('dashboard.stability.empty')}
          </Text>
        ) : (
          <Stack gap="sm">
            <Text className={styles.stabilityValue}>{`${data.withinTolerancePercentage}%`}</Text>
            <Text size="sm" c="dimmed">
              {t('dashboard.stability.withinRangeCount', {
                within: data.periodsWithinTolerance,
                total: data.totalClosedPeriods,
              })}
            </Text>
            <Group gap={8}>
              {data.recentClosedPeriods.map((period) => (
                <span
                  key={period.periodId}
                  className={`${styles.stabilityDot} ${period.isOutsideTolerance ? styles.stabilityDotFilled : ''}`}
                  aria-label={
                    period.isOutsideTolerance
                      ? t('dashboard.stability.dots.outside')
                      : t('dashboard.stability.dots.within')
                  }
                />
              ))}
            </Group>
            <Text size="xs" c="dimmed">
              {t('dashboard.stability.lastClosedPeriodsLabel')}
            </Text>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
