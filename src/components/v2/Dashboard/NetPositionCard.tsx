import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Anchor, Button, Skeleton, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useAccountsSummary } from '@/hooks/v2/useAccounts';
import { useDashboardNetPosition, useDashboardNetPositionHistory } from '@/hooks/v2/useDashboard';
import { useV2Theme } from '@/theme/v2';
import { NetPositionBreakdownBar } from './NetPositionBreakdownBar';
import { NetPositionSparkline } from './NetPositionSparkline';
import classes from './NetPositionCard.module.css';

interface NetPositionCardProps {
  periodId: string;
}

export function NetPositionCard({ periodId }: NetPositionCardProps) {
  const { t } = useTranslation('v2');
  const { data, isLoading, isError, refetch } = useDashboardNetPosition(periodId);
  const { data: history } = useDashboardNetPositionHistory(periodId);
  const { data: accountsSummary, isLoading: isAccountsLoading } = useAccountsSummary(periodId);
  const { accents } = useV2Theme();
  const accounts = accountsSummary?.data ?? [];

  if (isLoading) {
    return <NetPositionCardSkeleton />;
  }

  if (isError) {
    return (
      <div className={classes.card}>
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            {t('dashboard.netPosition.title')}
          </Text>
          <Text fz="sm" c="dimmed">
            {t('dashboard.netPosition.error')}
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            {t('common.retry')}
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
            {t('dashboard.netPosition.title')}
          </Text>
          <Text fz="sm" c="dimmed">
            {t('dashboard.netPosition.empty')}
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
          {t('dashboard.netPosition.title')}
        </Text>
        <Anchor component={Link} to="/accounts" fz="xs" c="var(--v2-tertiary)">
          {t('dashboard.netPosition.accountsCount', { count: data.numberOfAccounts })}
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
            {t('common.thisPeriod')}
          </Text>
        </div>
        <div className={classes.sparklineWrapper}>
          <NetPositionSparkline
            history={history ?? undefined}
            total={data.total}
            change={data.differenceThisPeriod}
          />
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
            <BreakdownItem
              label={t('dashboard.netPosition.liquid')}
              cents={data.liquidAmount}
              color={accents.secondary}
            />
            <BreakdownItem
              label={t('dashboard.netPosition.protected')}
              cents={data.protectedAmount}
              color={accents.primary}
            />
            {data.debtAmount > 0 && (
              <BreakdownItem
                label={t('dashboard.netPosition.debt')}
                cents={data.debtAmount}
                color="var(--v2-border)"
              />
            )}
          </div>
        </>
      )}

      {/* Account list */}
      <div className={classes.accountList}>
        {isAccountsLoading
          ? Array.from({ length: data.numberOfAccounts }).map((_, i) => (
              <div key={i} className={classes.accountRow}>
                <Skeleton width={8} height={8} radius="xl" />
                <Skeleton width={120} height={12} />
                <Skeleton width={60} height={12} />
                <span className={classes.accountLeader} />
                <Skeleton width={70} height={12} />
              </div>
            ))
          : accounts.map((account) => (
              <div key={account.id} className={classes.accountRow}>
                <span
                  className={classes.accountColor}
                  style={{ backgroundColor: account.color || 'var(--v2-border)' }}
                />
                <Text fz="sm" fw={500} className={classes.accountName}>
                  {account.name}
                </Text>
                <Text fz="xs" c="dimmed" className={classes.accountType}>
                  {t(`dashboard.netPosition.accountTypes.${account.type}`, {
                    defaultValue: account.type,
                  })}
                </Text>
                <span className={classes.accountLeader} />
                <Text
                  fz="sm"
                  fw={600}
                  ff="var(--mantine-font-family-monospace)"
                  className={classes.accountBalance}
                >
                  <CurrencyValue cents={account.currentBalance} />
                </Text>
              </div>
            ))}
      </div>
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
