import { Button, Progress, Skeleton, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useBudgetPeriods } from '@/hooks/v2/useBudgetPeriods';
import {
  useDashboardCurrentPeriod,
  useDashboardCurrentPeriodHistory,
} from '@/hooks/v2/useDashboard';
import { useV2Theme } from '@/theme/v2';
import { periodDateRange } from '../PeriodSelector/periodUtils';
import { CurrentPeriodSparkline } from './CurrentPeriodSparkline';
import classes from './CurrentPeriodCard.module.css';

interface CurrentPeriodCardProps {
  periodId: string;
}

export function CurrentPeriodCard({ periodId }: CurrentPeriodCardProps) {
  const { data, isLoading, isError, refetch } = useDashboardCurrentPeriod(periodId);
  const { data: history } = useDashboardCurrentPeriodHistory(periodId);
  const { data: periodsData } = useBudgetPeriods({ limit: 20 });
  const { accents } = useV2Theme();

  const period = periodsData?.data?.find((p) => p.id === periodId);

  if (isLoading) {
    return <CurrentPeriodCardSkeleton />;
  }

  if (isError) {
    return (
      <div className={classes.card}>
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            Current Period
          </Text>
          <Text fz="sm" c="dimmed">
            Something went wrong loading your period data.
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data || !period) {
    return (
      <div className={classes.card}>
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            Current Period
          </Text>
          <Text fz="sm" c="dimmed">
            No budget period configured yet.
          </Text>
        </div>
      </div>
    );
  }

  const hasBudget = data.target > 0;
  // Guard against daysInPeriod === 0 to avoid NaN / division by zero
  const timePct =
    data.daysInPeriod > 0
      ? Math.round(((data.daysInPeriod - data.daysRemaining) / data.daysInPeriod) * 100)
      : 0;
  const budgetPct = hasBudget ? Math.round((data.spent / data.target) * 100) : 0;
  const remaining = hasBudget ? data.target - data.spent : 0;
  const perDayLeft =
    hasBudget && data.daysRemaining > 0 ? Math.round(remaining / data.daysRemaining) : 0;
  const daysElapsed = data.daysInPeriod - data.daysRemaining;
  const dateRange = periodDateRange(period);

  return (
    <div className={classes.card} data-testid="current-period-card">
      {/* Header */}
      <div className={classes.header}>
        <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
          Current Period · {dateRange}
        </Text>
        <Text fz="xs" c="dimmed">
          {data.daysRemaining} days left
        </Text>
      </div>

      {/* Hero + Sparkline */}
      <div className={classes.heroRow}>
        <div className={classes.heroLeft}>
          <Text fz={32} fw={700} lh={1.1} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={data.spent} />
          </Text>
          <Text fz="sm" c="dimmed" mt={2}>
            {hasBudget ? (
              <>
                of <CurrencyValue cents={data.target} /> budgeted
              </>
            ) : (
              'no budget set'
            )}
          </Text>
        </div>
        <div className={classes.sparklineWrapper}>
          <CurrentPeriodSparkline history={history} spent={data.spent} daysElapsed={daysElapsed} />
        </div>
      </div>

      {/* Progress bars */}
      <div className={classes.progressSection}>
        <div className={classes.progressRow} data-testid="progress-row-time">
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" className={classes.progressLabel}>
            Time
          </Text>
          <Progress
            value={timePct}
            size={6}
            radius="xl"
            color={accents.primary}
            className={classes.progressBar}
            aria-label={`Time elapsed: ${timePct}%`}
          />
          <Text fz="xs" c="dimmed" className={classes.progressPct}>
            {timePct}%
          </Text>
        </div>
        {hasBudget && (
          <div className={classes.progressRow} data-testid="progress-row-budget">
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed" className={classes.progressLabel}>
              Budget
            </Text>
            <Progress
              value={Math.min(budgetPct, 100)}
              size={6}
              radius="xl"
              color={accents.secondary}
              className={classes.progressBar}
              aria-label={`Budget used: ${Math.min(budgetPct, 100)}%`}
            />
            <Text fz="xs" c="dimmed" className={classes.progressPct}>
              {Math.min(budgetPct, 100)}%
            </Text>
          </div>
        )}
      </div>

      {/* Stat boxes */}
      <div className={classes.statsGrid} data-testid="stats-grid">
        {hasBudget ? (
          <>
            <StatItem label="Remaining" cents={remaining} />
            <StatItem label="Per Day Left" cents={perDayLeft} />
            <StatItem label="Projected" cents={data.projectedSpend} />
          </>
        ) : (
          <StatItem label="Total Spent This Period" cents={data.spent} />
        )}
      </div>
    </div>
  );
}

function StatItem({ label, cents }: { label: string; cents: number }) {
  return (
    <div className={classes.statItem}>
      <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
        <CurrencyValue cents={cents} />
      </Text>
      <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
        {label}
      </Text>
    </div>
  );
}

function CurrentPeriodCardSkeleton() {
  return (
    <div className={classes.card} data-testid="current-period-card-loading">
      <div className={classes.header}>
        <Skeleton width={160} height={12} />
        <Skeleton width={70} height={12} />
      </div>
      <Stack gap="xs">
        <Skeleton width={180} height={36} />
        <Skeleton width={140} height={14} />
        <Skeleton height={6} radius="xl" />
        <Skeleton height={6} radius="xl" />
        <div className={classes.statsGrid}>
          <div className={classes.statItem}>
            <Skeleton width={70} height={20} mb={4} />
            <Skeleton width={60} height={10} />
          </div>
          <div className={classes.statItem}>
            <Skeleton width={70} height={20} mb={4} />
            <Skeleton width={60} height={10} />
          </div>
          <div className={classes.statItem}>
            <Skeleton width={70} height={20} mb={4} />
            <Skeleton width={60} height={10} />
          </div>
        </div>
      </Stack>
    </div>
  );
}
