import { useTranslation } from 'react-i18next';
import { Button, Progress, Skeleton, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useDashboardCashFlow } from '@/hooks/v2/useDashboard';
import { useV2Theme } from '@/theme/v2';
import classes from './CashFlowCard.module.css';

interface CashFlowCardProps {
  periodId: string;
}

export function CashFlowCard({ periodId }: CashFlowCardProps) {
  const { t } = useTranslation('v2');
  const { data, isLoading, isError, refetch } = useDashboardCashFlow(periodId);
  const { accents } = useV2Theme();

  if (isLoading) {
    return <CashFlowCardSkeleton />;
  }

  if (isError) {
    return (
      <div className={classes.card} data-testid="cash-flow-card-error">
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            {t('dashboard.cashFlow.title')}
          </Text>
          <Text fz="sm" c="dimmed">
            {t('dashboard.cashFlow.error')}
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  if (!data || (data.inflows === 0 && data.outflows === 0)) {
    return (
      <div className={classes.card} data-testid="cash-flow-card-empty">
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            {t('dashboard.cashFlow.title')}
          </Text>
          <Text fz="sm" c="dimmed">
            {t('dashboard.cashFlow.empty')}
          </Text>
        </div>
      </div>
    );
  }

  const maxAmount = Math.max(data.inflows, data.outflows, 1);
  const inflowPct = Math.round((data.inflows / maxAmount) * 100);
  const outflowPct = Math.round((data.outflows / maxAmount) * 100);

  return (
    <div className={classes.card} data-testid="cash-flow-card">
      <div className={classes.header}>
        <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
          {t('dashboard.cashFlow.title')}
        </Text>
      </div>

      <div className={classes.barsSection}>
        <div className={classes.barRow}>
          <Text fz="xs" fw={600} c="dimmed" className={classes.barLabel}>
            {t('dashboard.cashFlow.in')}
          </Text>
          <Progress
            value={inflowPct}
            size={8}
            radius="xl"
            color={accents.primary}
            className={classes.bar}
            aria-label={t('dashboard.cashFlow.inflowsAria', { pct: inflowPct })}
          />
          <Text
            fz="sm"
            fw={500}
            ff="var(--mantine-font-family-monospace)"
            className={classes.barAmount}
            data-testid="cash-flow-income-value"
          >
            <CurrencyValue cents={data.inflows} />
          </Text>
        </div>
        <div className={classes.barRow}>
          <Text fz="xs" fw={600} c="dimmed" className={classes.barLabel}>
            {t('dashboard.cashFlow.out')}
          </Text>
          <Progress
            value={outflowPct}
            size={8}
            radius="xl"
            color={accents.secondary}
            className={classes.bar}
            aria-label={t('dashboard.cashFlow.outflowsAria', { pct: outflowPct })}
          />
          <Text
            fz="sm"
            fw={500}
            ff="var(--mantine-font-family-monospace)"
            className={classes.barAmount}
          >
            <CurrencyValue cents={data.outflows} />
          </Text>
        </div>
      </div>

      <div className={classes.netRow}>
        <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
          {t('dashboard.cashFlow.net')}
        </Text>
        <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)" c="dimmed">
          {data.net >= 0 ? '+' : '-'}
          <CurrencyValue cents={Math.abs(data.net)} />
        </Text>
      </div>
    </div>
  );
}

function CashFlowCardSkeleton() {
  return (
    <div className={classes.card} data-testid="cash-flow-card-loading">
      <Skeleton width={80} height={12} mb="md" />
      <Stack gap="xs">
        <Skeleton height={8} radius="xl" />
        <Skeleton height={8} radius="xl" width="70%" />
      </Stack>
      <Skeleton width={100} height={16} mt="md" />
    </div>
  );
}
