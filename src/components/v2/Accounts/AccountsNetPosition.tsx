import { useTranslation } from 'react-i18next';
import { Button, Skeleton, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useDashboardNetPosition } from '@/hooks/v2/useDashboard';
import { useV2Theme } from '@/theme/v2';
import classes from './Accounts.module.css';

interface AccountsNetPositionProps {
  periodId: string;
}

export function AccountsNetPosition({ periodId }: AccountsNetPositionProps) {
  const { t } = useTranslation('v2');
  const { data, isLoading, isError, refetch } = useDashboardNetPosition(periodId);
  const { accents } = useV2Theme();

  if (isLoading) {
    return (
      <div className={classes.netPositionCard}>
        <Skeleton width={100} height={12} mb="xs" />
        <Skeleton width={200} height={36} mb="sm" />
        <Skeleton height={6} radius="xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={classes.centeredState}>
        <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
          {t('accounts.netPosition.title')}
        </Text>
        <Text fz="sm" c="dimmed">
          {t('accounts.netPosition.loadError')}
        </Text>
        <Button size="xs" variant="light" onClick={() => refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  if (!data || data.numberOfAccounts === 0) {
    return null;
  }

  const changePrefix =
    data.differenceThisPeriod > 0 ? '+' : data.differenceThisPeriod < 0 ? '-' : '';
  const total = data.liquidAmount + data.protectedAmount + data.debtAmount;
  const showBar = total > 0;

  return (
    <div className={classes.netPositionCard}>
      <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="xs">
        {t('accounts.netPosition.title')}
      </Text>

      <div className={classes.netPositionHero}>
        <Stack gap={2}>
          <Text fz={36} fw={700} lh={1} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={data.total} />
          </Text>
          <Text fz="sm" c="dimmed" ff="var(--mantine-font-family-monospace)">
            <span>
              {changePrefix}
              <CurrencyValue cents={Math.abs(data.differenceThisPeriod)} />
            </span>{' '}
            {t('common.thisPeriod')}
          </Text>
        </Stack>

        <div className={classes.breakdownLegend}>
          <LegendItem
            label={t('accounts.netPosition.liquid')}
            cents={data.liquidAmount}
            color={accents.primary}
          />
          <LegendItem
            label={t('accounts.netPosition.protected')}
            cents={data.protectedAmount}
            color={accents.tertiary}
          />
          {data.debtAmount > 0 && (
            <LegendItem
              label={t('accounts.netPosition.debt')}
              cents={data.debtAmount}
              color={accents.secondary}
            />
          )}
        </div>
      </div>

      {showBar && (
        <div className={classes.barTrack} style={{ backgroundColor: 'var(--v2-elevated)' }}>
          <div
            className={classes.barSegment}
            style={{
              flex: data.liquidAmount,
              backgroundColor: accents.primary,
            }}
          />
          <div
            className={classes.barSegment}
            style={{
              flex: data.protectedAmount,
              backgroundColor: accents.tertiary,
            }}
          />
          {data.debtAmount > 0 && (
            <div
              className={classes.barSegment}
              style={{
                flex: data.debtAmount,
                backgroundColor: accents.secondary,
                opacity: 0.5,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function LegendItem({ label, cents, color }: { label: string; cents: number; color: string }) {
  return (
    <div className={classes.legendItem}>
      <span className={classes.legendDot} style={{ backgroundColor: color }} />
      <Text fz="xs" c="dimmed" ff="var(--mantine-font-family-monospace)">
        {label} <CurrencyValue cents={cents} />
      </Text>
    </div>
  );
}
