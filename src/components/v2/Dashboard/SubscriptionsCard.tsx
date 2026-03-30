import { useTranslation } from 'react-i18next';
import { Button, ScrollArea, Skeleton, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useDashboardSubscriptions } from '@/hooks/v2/useDashboard';
import classes from './SubscriptionsCard.module.css';

interface SubscriptionsCardProps {
  periodId: string;
}

type DisplayStatus = 'charged' | 'today' | 'upcoming';
type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

function useCycleLabel() {
  const { t } = useTranslation('v2');
  return (cycle: BillingCycle): string => {
    switch (cycle) {
      case 'quarterly':
        return t('dashboard.subscriptions.perQuarter');
      case 'yearly':
        return t('dashboard.subscriptions.perYear');
      default:
        return t('dashboard.subscriptions.perMonth');
    }
  };
}

function useUpcomingLabel() {
  const { t } = useTranslation('v2');
  return (nextChargeDate: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const charge = new Date(`${nextChargeDate}T00:00:00`);
    const days = Math.round((charge.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return t('dashboard.subscriptions.today');
    }
    if (days === 1) {
      return t('dashboard.subscriptions.inOneDay');
    }
    if (days < 7) {
      return t('dashboard.subscriptions.inDays', { count: days });
    }
    const weeks = Math.round(days / 7);
    if (days < 28) {
      return weeks === 1
        ? t('dashboard.subscriptions.inOneWeek')
        : t('dashboard.subscriptions.inWeeks', { count: weeks });
    }
    const months = Math.max(1, Math.floor(days / 30));
    return months === 1
      ? t('dashboard.subscriptions.inOneMonth')
      : t('dashboard.subscriptions.inMonths', { count: months });
  };
}

function formatChargeDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function SubscriptionsCard({ periodId }: SubscriptionsCardProps) {
  const { t } = useTranslation('v2');
  const { data, isLoading, isError, refetch } = useDashboardSubscriptions(periodId);
  const getCycleLabel = useCycleLabel();

  if (isLoading) {
    return <SubscriptionsCardSkeleton />;
  }

  if (isError) {
    return (
      <div className={classes.card} data-testid="subscriptions-card-error">
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            {t('dashboard.subscriptions.title')}
          </Text>
          <Text fz="sm" c="dimmed">
            {t('dashboard.subscriptions.error')}
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  const subscriptions = data?.subscriptions ?? [];

  if (subscriptions.length === 0) {
    return (
      <div className={classes.card} data-testid="subscriptions-card-empty">
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            {t('dashboard.subscriptions.title')}
          </Text>
          <Text fz="sm" c="dimmed" ta="center">
            {t('dashboard.subscriptions.empty')}
          </Text>
        </div>
      </div>
    );
  }

  const activeCount = data?.activeCount ?? subscriptions.length;
  const monthlyTotal = data?.monthlyTotal ?? 0;
  const yearlyTotal = data?.yearlyTotal ?? 0;

  return (
    <div className={classes.card} data-testid="subscriptions-card">
      <div className={classes.header}>
        <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
          {t('dashboard.subscriptions.title')}
        </Text>
        <Text fz="xs" fw={600} c="var(--v2-primary)">
          {t('dashboard.subscriptions.activeCount', { count: activeCount })}
        </Text>
      </div>

      <div className={classes.summary}>
        <Text fz={22} fw={700} ff="var(--mantine-font-family-monospace)">
          <CurrencyValue cents={monthlyTotal} />
          <Text
            component="span"
            fz="sm"
            fw={400}
            c="dimmed"
            ff="var(--mantine-font-family-monospace)"
          >
            {t('dashboard.subscriptions.perMonth')}
          </Text>
        </Text>
        <Text
          fz="xs"
          c="dimmed"
          ff="var(--mantine-font-family-monospace)"
          className={classes.summaryYear}
        >
          · <CurrencyValue cents={yearlyTotal} />
          {t('dashboard.subscriptions.perYear')}
        </Text>
      </div>

      <ScrollArea className={classes.scrollArea} type="auto" offsetScrollbars={false}>
        {subscriptions.map((sub) => (
          <div key={sub.id} className={classes.row}>
            <div className={classes.dot} data-status={sub.displayStatus} />
            <Text
              fz="sm"
              fw={500}
              truncate
              c={sub.displayStatus === 'upcoming' ? 'dimmed' : undefined}
            >
              {sub.name}
            </Text>
            <Text
              fz="xs"
              c="dimmed"
              ff="var(--mantine-font-family-monospace)"
              className={classes.amount}
            >
              <CurrencyValue cents={sub.billingAmount} />
              {getCycleLabel(sub.billingCycle)}
            </Text>
            <Text fz="xs" c="dimmed" className={classes.date}>
              {formatChargeDate(sub.nextChargeDate)}
            </Text>
            <StatusBadge status={sub.displayStatus} nextChargeDate={sub.nextChargeDate} />
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}

function StatusBadge({
  status,
  nextChargeDate,
}: {
  status: DisplayStatus;
  nextChargeDate: string;
}) {
  const { t } = useTranslation('v2');
  const getUpcomingLabel = useUpcomingLabel();

  const colorMap: Record<DisplayStatus, string> = {
    charged: 'var(--v2-tertiary)',
    today: 'var(--v2-primary)',
    upcoming: 'var(--mantine-color-dimmed)',
  };

  const label =
    status === 'charged'
      ? t('dashboard.subscriptions.charged')
      : status === 'today'
        ? t('dashboard.subscriptions.today')
        : getUpcomingLabel(nextChargeDate);

  return (
    <Text
      component="span"
      fz={10}
      fw={700}
      tt="uppercase"
      style={{ letterSpacing: '0.04em', color: colorMap[status] }}
      className={classes.badge}
    >
      {label}
    </Text>
  );
}

function SubscriptionsCardSkeleton() {
  return (
    <div className={classes.card} data-testid="subscriptions-card-loading">
      <div className={classes.header}>
        <Skeleton width={120} height={12} />
        <Skeleton width={60} height={12} />
      </div>
      <Stack gap={4} mb="md">
        <Skeleton width={120} height={28} />
        <Skeleton width={100} height={12} />
      </Stack>
      <Stack gap={0}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={classes.row}>
            <Skeleton width={12} height={12} radius="xl" />
            <Skeleton height={14} />
            <Skeleton height={14} width={70} />
            <Skeleton height={14} width={45} />
            <Skeleton height={14} width={60} />
          </div>
        ))}
      </Stack>
    </div>
  );
}
