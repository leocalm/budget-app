import { useTranslation } from 'react-i18next';
import { Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { MonthlyBurnIn, MonthProgress } from '@/types/dashboard';
import { Money } from '@/types/money';
import styles from './CurrentPeriodCard.module.css';

interface CurrentPeriodCardProps {
  selectedPeriodId: string | null;
  monthlyBurnIn?: MonthlyBurnIn;
  monthProgress?: MonthProgress;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const formatPercentUsed = (spent: number, total: number): number => {
  if (total <= 0) {
    return 0;
  }

  return Math.max(0, Math.round((spent / total) * 100));
};

const getProjectedSpend = (spent: number, currentDay: number, daysInPeriod: number): number => {
  if (currentDay <= 0 || daysInPeriod <= 0) {
    return 0;
  }

  return Math.round((spent / currentDay) * daysInPeriod);
};

export const CurrentPeriodCard = ({
  selectedPeriodId,
  monthlyBurnIn,
  monthProgress,
  isLoading,
  isError,
  onRetry,
}: CurrentPeriodCardProps) => {
  const { t, i18n } = useTranslation();
  const currency = useDisplayCurrency();

  if (isError) {
    return (
      <Paper className={styles.card} p="xl" withBorder>
        <Stack gap="sm">
          <Text className={styles.label}>{t('dashboard.currentPeriod.title')}</Text>
          <Text className={styles.stateText}>{t('dashboard.currentPeriod.states.error')}</Text>
          <Group>
            <Button size="xs" variant="light" onClick={onRetry}>
              {t('states.error.retry')}
            </Button>
          </Group>
        </Stack>
      </Paper>
    );
  }

  if (isLoading) {
    return (
      <Paper className={styles.card} p="xl" withBorder>
        <Stack gap="md">
          <Skeleton height={16} width={140} radius="md" />
          <Skeleton height={40} width="40%" radius="md" />
          <Skeleton height={18} width={180} radius="md" />
          <Skeleton height={8} width="100%" radius="xl" />
          <Group grow>
            <Skeleton height={56} radius="md" />
            <Skeleton height={56} radius="md" />
          </Group>
          <Skeleton height={16} width={260} radius="md" />
        </Stack>
      </Paper>
    );
  }

  if (!selectedPeriodId || !monthlyBurnIn || !monthProgress) {
    return (
      <Paper className={styles.card} p="xl" withBorder>
        <Stack gap="sm">
          <Text className={styles.label}>{t('dashboard.currentPeriod.title')}</Text>
          <Text className={styles.stateText}>{t('dashboard.currentPeriod.states.empty')}</Text>
        </Stack>
      </Paper>
    );
  }

  const totalBudget = monthlyBurnIn.totalBudget;
  const actualSpend = monthlyBurnIn.spentBudget;
  const remaining = totalBudget - actualSpend;
  const percentUsed = formatPercentUsed(actualSpend, totalBudget);
  const projectedSpend = getProjectedSpend(
    actualSpend,
    monthlyBurnIn.currentDay,
    monthlyBurnIn.daysInPeriod
  );

  const totalBudgetFormatted = new Money(totalBudget, currency).format(i18n.language);
  const actualSpendFormatted = new Money(actualSpend, currency).format(i18n.language);
  const remainingFormatted = new Money(remaining, currency).format(i18n.language);
  const projectedSpendFormatted = new Money(projectedSpend, currency).format(i18n.language);

  return (
    <Paper className={styles.card} p="xl" withBorder>
      <Stack gap="md">
        <Text className={styles.label}>{t('dashboard.currentPeriod.title')}</Text>

        <Text className={styles.heroValue}>
          {t('dashboard.currentPeriod.hero.remaining', {
            amount: remainingFormatted,
          })}
        </Text>

        <Text className={styles.heroMeta}>
          {t('dashboard.currentPeriod.hero.meta', {
            percent: percentUsed,
            days: monthProgress.remainingDays,
          })}
        </Text>

        <div className={styles.progressTrack} role="presentation" aria-hidden="true">
          <div
            className={styles.progressFill}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>

        <div className={styles.metricsGrid}>
          <div>
            <Text className={styles.metricLabel}>
              {t('dashboard.currentPeriod.metrics.totalBudget')}
            </Text>
            <Text className={styles.metricValue}>{totalBudgetFormatted}</Text>
          </div>
          <div>
            <Text className={styles.metricLabel}>
              {t('dashboard.currentPeriod.metrics.actualSpend')}
            </Text>
            <Text className={styles.metricValue}>{actualSpendFormatted}</Text>
          </div>
        </div>

        <Text className={styles.projection}>
          {t('dashboard.currentPeriod.projection', {
            amount: projectedSpendFormatted,
          })}
        </Text>
      </Stack>
    </Paper>
  );
};
