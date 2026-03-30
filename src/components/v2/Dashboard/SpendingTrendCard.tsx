import { useTranslation } from 'react-i18next';
import { BarChart } from '@mantine/charts';
import { Button, Skeleton, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { useDashboardSpendingTrend } from '@/hooks/v2/useDashboard';
import { useV2Theme } from '@/theme/v2';
import { convertCentsToDisplay, formatCurrencyValue } from '@/utils/currency';
import classes from './SpendingTrendCard.module.css';

interface SpendingTrendCardProps {
  periodId: string;
}

export function SpendingTrendCard({ periodId }: SpendingTrendCardProps) {
  const { t } = useTranslation('v2');
  const { data, isLoading, isError, refetch } = useDashboardSpendingTrend(periodId);
  const { accents } = useV2Theme();
  const displayCurrency = useDisplayCurrency();

  if (isLoading) {
    return <SpendingTrendCardSkeleton />;
  }

  if (isError) {
    return (
      <div className={classes.card} data-testid="spending-trend-card-error">
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            {t('dashboard.spendingTrend.title')}
          </Text>
          <Text fz="sm" c="dimmed">
            {t('dashboard.spendingTrend.error')}
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  if (!data || !data.periods || data.periods.length < 2) {
    return (
      <div className={classes.card} data-testid="spending-trend-card-empty">
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            {t('dashboard.spendingTrend.title')}
          </Text>
          <Text fz="sm" c="dimmed">
            {t('dashboard.spendingTrend.empty')}
          </Text>
        </div>
      </div>
    );
  }

  const decimalPlaces = displayCurrency.decimalPlaces ?? 2;

  // Convert cents to display units using the currency's actual decimal places
  const chartData = data.periods.map((p) => ({
    period: p.periodName,
    spent: convertCentsToDisplay(p.totalSpent, decimalPlaces),
  }));

  // Tooltip formatter: show the symbol + formatted value
  const valueFormatter = (value: number) =>
    `${displayCurrency.symbol}\u00a0${formatCurrencyValue(Math.round(value * 10 ** decimalPlaces), decimalPlaces, undefined, { clean: true })}`;

  return (
    <div className={classes.card} data-testid="spending-trend-card">
      <div className={classes.header}>
        <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
          {t('dashboard.spendingTrend.title')}
        </Text>
        <Text fz="xs" c="dimmed">
          {t('dashboard.spendingTrend.lastPeriods', { count: data.periods.length })}
        </Text>
      </div>

      <div
        className={classes.chartWrapper}
        role="img"
        aria-label={t('dashboard.spendingTrend.chartAria', { count: data.periods.length })}
      >
        <BarChart
          h={160}
          data={chartData}
          dataKey="period"
          series={[{ name: 'spent', color: accents.primary }]}
          gridAxis="none"
          withXAxis
          withYAxis={false}
          withTooltip
          withBarValueLabel={false}
          tickLine="none"
          barProps={{ radius: [4, 4, 0, 0] }}
          valueFormatter={valueFormatter}
        />
      </div>

      <div className={classes.averageRow}>
        <Text fz="xs" fw={600} c="dimmed">
          {t('dashboard.spendingTrend.periodAverage')}
        </Text>
        <Text fz="sm" fw={600} ff="var(--mantine-font-family-monospace)">
          <CurrencyValue cents={data.periodAverage} />
        </Text>
      </div>
    </div>
  );
}

function SpendingTrendCardSkeleton() {
  return (
    <div className={classes.card} data-testid="spending-trend-card-loading">
      <div className={classes.header}>
        <Skeleton width={100} height={12} />
        <Skeleton width={80} height={12} />
      </div>
      <Skeleton height={160} radius="md" mb="sm" />
      <Stack gap={4}>
        <Skeleton width={100} height={12} />
        <Skeleton width={70} height={16} />
      </Stack>
    </div>
  );
}
