import { Link } from 'react-router-dom';
import { Anchor, Button, Skeleton, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useDashboardNetPosition } from '@/hooks/v2/useDashboard';
import { useV2Theme } from '@/theme/v2';
import { NetPositionBreakdownBar } from './NetPositionBreakdownBar';
import { NetPositionSparkline } from './NetPositionSparkline';
import classes from './NetPositionCard.module.css';

interface NetPositionCardProps {
  periodId: string;
}

export function NetPositionCard({ periodId }: NetPositionCardProps) {
  const { data, isLoading, isError, refetch } = useDashboardNetPosition(periodId);
  const { accents } = useV2Theme();

  if (isLoading) {
    return <NetPositionCardSkeleton />;
  }

  if (isError) {
    return (
      <div className={classes.card}>
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            Net Position
          </Text>
          <Text fz="sm" c="dimmed">
            Something went wrong loading your position data.
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data || data.numberOfAccounts === 0) {
    return (
      <div className={classes.card}>
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            Net Position
          </Text>
          <Text fz="sm" c="dimmed">
            No accounts configured yet. Add an account to see your net position.
          </Text>
        </div>
      </div>
    );
  }

  const changePrefix =
    data.differenceThisPeriod > 0 ? '+' : data.differenceThisPeriod < 0 ? '-' : '';
  const showBreakdown = data.liquidAmount + data.protectedAmount + data.debtAmount !== 0;

  return (
    <div className={classes.card} data-testid="net-position-card">
      {/* Header */}
      <div className={classes.header}>
        <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
          Net Position
        </Text>
        <Anchor component={Link} to="/v2/accounts" fz="xs" c="var(--v2-tertiary)">
          {data.numberOfAccounts} accounts
        </Anchor>
      </div>

      {/* Hero + Sparkline */}
      <div className={classes.heroRow}>
        <div className={classes.heroLeft}>
          <Text fz={32} fw={700} lh={1.1} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={data.total} />
          </Text>
          <Text fz="sm" c="dimmed" mt={2}>
            <span>
              {changePrefix}
              <CurrencyValue cents={Math.abs(data.differenceThisPeriod)} />
            </span>{' '}
            this period
          </Text>
        </div>
        <div className={classes.sparklineWrapper}>
          <NetPositionSparkline total={data.total} change={data.differenceThisPeriod} />
        </div>
      </div>

      {/* Breakdown bar + detail boxes (hidden when all amounts are 0) */}
      {showBreakdown && (
        <>
          <NetPositionBreakdownBar
            liquid={data.liquidAmount}
            protected={data.protectedAmount}
            debt={data.debtAmount}
          />

          <div className={classes.breakdownGrid}>
            <BreakdownItem label="Liquid" cents={data.liquidAmount} color={accents.secondary} />
            <BreakdownItem label="Protected" cents={data.protectedAmount} color={accents.primary} />
            {data.debtAmount > 0 && (
              <BreakdownItem label="Debt" cents={data.debtAmount} color="var(--v2-border)" />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function BreakdownItem({ label, cents, color }: { label: string; cents: number; color: string }) {
  return (
    <div className={classes.breakdownItem}>
      <div className={classes.breakdownLabel}>
        <span className={classes.breakdownDot} style={{ backgroundColor: color }} />
        <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
          {label}
        </Text>
      </div>
      <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
        <CurrencyValue cents={cents} />
      </Text>
    </div>
  );
}

function NetPositionCardSkeleton() {
  return (
    <div className={classes.card} data-testid="net-position-card-loading">
      <div className={classes.header}>
        <Skeleton width={100} height={12} />
        <Skeleton width={70} height={12} />
      </div>
      <Stack gap="xs">
        <Skeleton width={180} height={36} />
        <Skeleton width={120} height={14} />
        <Skeleton height={6} radius="xl" />
        <div className={classes.breakdownGrid}>
          <div className={classes.breakdownItem}>
            <Skeleton width={50} height={10} mb={4} />
            <Skeleton width={70} height={20} />
          </div>
          <div className={classes.breakdownItem}>
            <Skeleton width={60} height={10} mb={4} />
            <Skeleton width={70} height={20} />
          </div>
          <div className={classes.breakdownItem}>
            <Skeleton width={40} height={10} mb={4} />
            <Skeleton width={70} height={20} />
          </div>
        </div>
      </Stack>
    </div>
  );
}
