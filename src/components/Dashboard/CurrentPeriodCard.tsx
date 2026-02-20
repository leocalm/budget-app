import { useTranslation } from 'react-i18next';
import { Button, Group, Paper, Skeleton, Text } from '@mantine/core';
import piggyLogo from '@/assets/icons/png/gradient/piggy-pulse.png';
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
        <img src={piggyLogo} className={styles.pigMark} alt="" />
        <Text className={styles.label}>{t('dashboard.currentPeriod.title')}</Text>
        <Text className={styles.stateText}>{t('dashboard.currentPeriod.states.error')}</Text>
        <Group mt="sm">
          <Button size="xs" variant="light" onClick={onRetry}>
            {t('states.error.retry')}
          </Button>
        </Group>
      </Paper>
    );
  }

  if (isLoading) {
    return (
      <Paper className={styles.card} p="xl" withBorder>
        <img src={piggyLogo} className={styles.pigMark} alt="" />
        <Skeleton height={16} width={140} radius="md" mb="sm" />
        <Skeleton height={48} width="40%" radius="md" mb="xs" />
        <Skeleton height={18} width={120} radius="md" mb="xs" />
        <Skeleton height={16} width={240} radius="md" mb="md" />
        <Skeleton height={10} width="100%" radius="xl" mb="md" />
        <Skeleton height={16} width={280} radius="md" />
      </Paper>
    );
  }

  if (!selectedPeriodId || !monthlyBurnIn || !monthProgress) {
    return (
      <Paper className={styles.card} p="xl" withBorder>
        <img src={piggyLogo} className={styles.pigMark} alt="" />
        <Text className={styles.label}>{t('dashboard.currentPeriod.title')}</Text>
        <Text className={styles.stateText}>{t('dashboard.currentPeriod.states.empty')}</Text>
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
      <img src={piggyLogo} className={styles.pigMark} alt="" />
      <Text className={styles.label}>{t('dashboard.currentPeriod.title')}</Text>
      <Text className={styles.periodAmount}>{actualSpendFormatted}</Text>
      <Text className={styles.periodMeta}>
        {t('dashboard.currentPeriod.of', { totalBudgetFormatted })}
      </Text>
      <Text className={styles.periodRemaining}>
        {t('dashboard.currentPeriod.remainingDays', {
          remainingDays: monthProgress.remainingDays,
          remainingFormatted,
        })}
      </Text>
      <div className={styles.progressBar} role="presentation" aria-hidden="true">
        <div className={styles.progressFill} style={{ width: `${Math.min(percentUsed, 100)}%` }} />
      </div>
      <Text className={styles.periodProjection}>
        {t('dashboard.currentPeriod.projectedSpend', { projectedSpendFormatted })}
      </Text>
    </Paper>
  );
};
