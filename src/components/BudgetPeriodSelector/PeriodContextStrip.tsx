import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useBudgetPeriods } from '@/hooks/useBudget';
import { usePeriodContextSummary } from '@/hooks/useDashboard';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { formatCurrency } from '@/utils/currency';
import { BudgetPeriodSelector } from './BudgetPeriodSelector';
import classes from './BudgetPeriodSelector.module.css';

const clampPercentage = (value: number) => Math.min(100, Math.max(0, value));

export function PeriodContextStrip() {
  const { t, i18n } = useTranslation();
  const { selectedPeriodId, setSelectedPeriodId } = useBudgetPeriodSelection();
  const { data: periods = [] } = useBudgetPeriods();
  const currency = useDisplayCurrency();
  const { summary, isLoading } = usePeriodContextSummary(selectedPeriodId);

  const selectedPeriod = periods.find((period) => period.id === selectedPeriodId) ?? null;
  const elapsedPercentage = clampPercentage(summary.daysPassedPercentage);

  const format = (amountInCents: number) => formatCurrency(amountInCents, currency, i18n.language);

  const rangeLabel = selectedPeriod
    ? t('budgetPeriodSelector.range', {
        start: dayjs(selectedPeriod.startDate).format('MMM D'),
        end: dayjs(selectedPeriod.endDate).format('MMM D'),
      })
    : t('budgetPeriodSelector.triggerMetaEmpty');
  const hasPeriodSummary = selectedPeriodId !== null && summary.daysInPeriod > 0;
  const spentBudgetLabel = hasPeriodSummary && !isLoading ? format(summary.spentBudget) : '—';
  const remainingBudgetLabel =
    hasPeriodSummary && !isLoading ? format(summary.remainingBudget) : '—';
  const daysLeftLabel =
    hasPeriodSummary && !isLoading
      ? t('budgetPeriodSelector.daysLeft', { count: summary.remainingDays })
      : '—';

  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      className={classes.periodContextStrip}
      data-testid="period-context-strip"
    >
      <div className={classes.periodContextTopRow}>
        <div className={classes.periodContextSelectorWrap}>
          <BudgetPeriodSelector
            periods={periods}
            selectedPeriodId={selectedPeriodId}
            onPeriodChange={setSelectedPeriodId}
          />
        </div>

        <Group className={classes.periodContextSummary} gap="lg" wrap="nowrap">
          <Stack gap={2} className={classes.periodContextMetric}>
            <Text className={classes.periodContextMetricLabel}>
              {t('dashboard.currentPeriod.metrics.actualSpend')}
            </Text>
            {isLoading && selectedPeriodId ? (
              <Skeleton height={18} width={72} radius="sm" />
            ) : (
              <Text className={classes.periodContextMetricValue}>{spentBudgetLabel}</Text>
            )}
          </Stack>

          <Stack gap={2} className={classes.periodContextMetric}>
            <Text className={classes.periodContextMetricLabel}>
              {t('budget.overview.remaining')}
            </Text>
            {isLoading && selectedPeriodId ? (
              <Skeleton height={18} width={72} radius="sm" />
            ) : (
              <Text className={classes.periodContextMetricValue}>{remainingBudgetLabel}</Text>
            )}
          </Stack>

          <Stack gap={2} className={classes.periodContextMetric}>
            <Text className={classes.periodContextMetricLabel}>
              {t('dashboard.stats.monthProgress.label')}
            </Text>
            {isLoading && selectedPeriodId ? (
              <Skeleton height={18} width={58} radius="sm" />
            ) : (
              <Text className={classes.periodContextMetricValue}>{daysLeftLabel}</Text>
            )}
          </Stack>
        </Group>
      </div>

      <div className={classes.periodContextProgressWrap}>
        <div
          className={classes.periodContextProgressTrack}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(elapsedPercentage)}
          aria-label={t('dashboard.stats.monthProgress.label')}
        >
          <div
            className={classes.periodContextProgressFill}
            style={{ width: `${elapsedPercentage}%` }}
          />
        </div>
      </div>

      <Text className={classes.periodContextRangeLabel}>{rangeLabel}</Text>
    </Paper>
  );
}
