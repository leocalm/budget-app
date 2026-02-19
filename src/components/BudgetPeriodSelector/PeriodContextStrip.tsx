import { useTranslation } from 'react-i18next';
import { Paper, Skeleton, Text } from '@mantine/core';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useBudgetPeriods } from '@/hooks/useBudget';
import { usePeriodContextSummary } from '@/hooks/useDashboard';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { formatCurrency } from '@/utils/currency';
import classes from './BudgetPeriodSelector.module.css';

const clampPercentage = (value: number) => Math.min(100, Math.max(0, value));

export function PeriodContextStrip() {
  const { t, i18n } = useTranslation();
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const { data: periods = [] } = useBudgetPeriods();
  const currency = useDisplayCurrency();
  const { summary, isLoading } = usePeriodContextSummary(selectedPeriodId);

  const selectedPeriod = periods.find((period) => period.id === selectedPeriodId) ?? null;
  const elapsedPercentage = clampPercentage(summary.daysPassedPercentage);

  const format = (amountInCents: number) => formatCurrency(amountInCents, currency, i18n.language);

  const periodLabel = selectedPeriod?.name ?? '—';
  const hasPeriodSummary = selectedPeriodId !== null && summary.daysInPeriod > 0;
  const spentBudgetLabel = hasPeriodSummary && !isLoading ? format(summary.spentBudget) : '—';
  const totalBudget = hasPeriodSummary ? summary.totalBudget : 0;
  const totalBudgetLabel = hasPeriodSummary && !isLoading ? format(totalBudget) : '—';
  const varianceInCents = hasPeriodSummary ? summary.spentBudget - summary.totalBudget : 0;
  const varianceLabel =
    hasPeriodSummary && !isLoading
      ? `${varianceInCents > 0 ? '+' : varianceInCents < 0 ? '-' : ''}${format(Math.abs(varianceInCents))}`
      : '—';

  return (
    <Paper
      withBorder
      radius="lg"
      p={14}
      className={classes.periodContextStrip}
      data-testid="period-context-strip"
    >
      <div className={classes.periodContextGrid}>
        <div className={classes.periodContextBlock}>
          <Text className={classes.periodContextMetricLabel}>
            {t('periodContext.labels.period')}
          </Text>
          {isLoading && selectedPeriodId ? (
            <Skeleton height={22} width={140} radius="sm" />
          ) : (
            <Text className={classes.periodContextMainValue}>{periodLabel}</Text>
          )}
        </div>

        <div className={classes.periodContextBlock}>
          <Text className={classes.periodContextMetricLabel}>
            {t('periodContext.labels.elapsedInPeriod')}
          </Text>
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

        <div className={classes.periodContextBlock}>
          <Text className={classes.periodContextMetricLabel}>
            {t('periodContext.labels.summary')}
          </Text>
          {isLoading && selectedPeriodId ? (
            <Skeleton height={22} width={220} radius="sm" />
          ) : (
            <Text className={classes.periodContextSummaryValue}>
              {t('periodContext.labels.varianceLabel', {
                spentBudgetLabel,
                totalBudgetLabel,
                varianceLabel,
              })}
            </Text>
          )}
        </div>
      </div>
    </Paper>
  );
}
