import { useTranslation } from 'react-i18next';
import { Box, Group, Stack, Text, Tooltip } from '@mantine/core';
import { AccountResponse } from '@/types/account';
import { formatCurrency } from '@/utils/currency';
import styles from './RangeBar.module.css';

type RangeModel = {
  low: number;
  high: number;
  current: number;
  projected: number | null;
  currentPct: number;
  projectedPct: number | null;
  zeroPct: number;
};

export function buildAllowanceRangeModel(params: {
  currentBalance: number;
  nextTransferAmount?: number;
  balancePerDay: Array<{ balance: number }>;
  decimalPlaces: number;
}): RangeModel {
  const history = params.balancePerDay.slice(-30).map((d) => d.balance);
  const base = history.length > 0 ? history : [params.currentBalance];

  const histLow = Math.min(...base);
  const histHigh = Math.max(...base);

  const projected =
    params.nextTransferAmount == null ? null : params.currentBalance + params.nextTransferAmount;

  let low = Math.min(histLow, 0, projected ?? params.currentBalance);
  let high = Math.max(histHigh, 0, projected ?? params.currentBalance);

  if (low === high) {
    const unit = 10 ** params.decimalPlaces;
    low -= unit;
    high += unit;
  }

  const toPercent = (value: number): number => {
    if (high <= low) {
      return 50;
    }
    const raw = ((value - low) / (high - low)) * 100;
    return Math.min(100, Math.max(0, raw));
  };

  return {
    low,
    high,
    current: params.currentBalance,
    projected,
    currentPct: toPercent(params.currentBalance),
    projectedPct: projected == null ? null : toPercent(projected),
    zeroPct: toPercent(0),
  };
}

export function AllowanceRangeBar({ account }: { account: AccountResponse }) {
  const { t } = useTranslation();

  const model = buildAllowanceRangeModel({
    currentBalance: account.balance,
    nextTransferAmount: account.nextTransferAmount,
    balancePerDay: account.balancePerDay,
    decimalPlaces: account.currency.decimalPlaces,
  });

  const { low, high, current, projected, currentPct, projectedPct, zeroPct } = model;

  const ariaLabel = t('accounts.overview.allowanceBar.ariaLabel', {
    low: formatCurrency(low, account.currency),
    current: formatCurrency(current, account.currency),
    high: formatCurrency(high, account.currency),
  });

  return (
    <Stack gap={8}>
      <Group gap={6} align="center">
        <Text size="xs" c="dimmed">
          {t('accounts.overview.allowanceBar.rangeLabel')}
        </Text>
        <Tooltip label={t('accounts.overview.allowanceBar.boundsNote')} withArrow>
          <Text size="xs" c="dimmed" style={{ cursor: 'help', lineHeight: 1 }}>
            ⓘ
          </Text>
        </Tooltip>
      </Group>

      <Box className={styles.track} role="img" aria-label={ariaLabel}>
        <span className={styles.zeroMarker} style={{ left: `${zeroPct}%` }} />
        <span className={styles.currentMarker} style={{ left: `${currentPct}%` }} />
        {projectedPct !== null && (
          <span className={styles.projectedMarker} style={{ left: `${projectedPct}%` }} />
        )}
      </Box>

      <Group justify="space-between">
        <Text size="xs" c="dimmed">
          {t('accounts.overview.allowanceBar.low', {
            value: formatCurrency(low, account.currency),
          })}
        </Text>
        <Text size="xs" c="dimmed">
          {t('accounts.overview.allowanceBar.high', {
            value: formatCurrency(high, account.currency),
          })}
        </Text>
      </Group>

      <Group gap="md" wrap="wrap">
        <Group gap={6} align="center">
          <span className={styles.legendDotCurrent} />
          <Text size="xs">
            {t('accounts.overview.allowanceBar.current', {
              value: formatCurrency(current, account.currency),
            })}
          </Text>
        </Group>
        {projected !== null && (
          <Group gap={6} align="center">
            <span className={styles.legendDotProjected} />
            <Text size="xs">
              {t('accounts.overview.allowanceBar.afterNextTransfer', {
                value: formatCurrency(projected, account.currency),
              })}
            </Text>
          </Group>
        )}
        <Group gap={6} align="center">
          <span className={styles.legendZeroLine} />
          <Text size="xs">{t('accounts.overview.allowanceBar.zero')}</Text>
        </Group>
      </Group>
    </Stack>
  );
}
