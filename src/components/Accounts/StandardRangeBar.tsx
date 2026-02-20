import { useTranslation } from 'react-i18next';
import { Box, Group, Stack, Text } from '@mantine/core';
import { AccountResponse } from '@/types/account';
import { formatCurrency } from '@/utils/currency';
import styles from './RangeBar.module.css';

type StandardRangeModel = {
  low: number;
  high: number;
  current: number;
  currentPct: number;
  zeroPct: number | null;
  isAboveHigh: boolean;
  isBelowLow: boolean;
  aboveDelta: number;
  belowDelta: number;
};

export function buildStandardRangeModel(params: {
  currentBalance: number;
  balancePerDay: Array<{ balance: number }>;
  decimalPlaces: number;
}): StandardRangeModel {
  const history = params.balancePerDay.slice(-30).map((d) => d.balance);
  const base = history.length > 0 ? history : [params.currentBalance];

  let low = Math.min(...base);
  let high = Math.max(...base);

  if (low === high) {
    const unit = 10 ** params.decimalPlaces;
    low -= unit;
    high += unit;
  }

  const toPercentClamped = (value: number): number => {
    const raw = ((value - low) / (high - low)) * 100;
    return Math.min(100, Math.max(0, raw));
  };

  const isAboveHigh = params.currentBalance > high;
  const isBelowLow = params.currentBalance < low;
  const zeroInRange = low <= 0 && high >= 0;

  return {
    low,
    high,
    current: params.currentBalance,
    currentPct: toPercentClamped(params.currentBalance),
    zeroPct: zeroInRange ? toPercentClamped(0) : null,
    isAboveHigh,
    isBelowLow,
    aboveDelta: isAboveHigh ? params.currentBalance - high : 0,
    belowDelta: isBelowLow ? low - params.currentBalance : 0,
  };
}

export function StandardRangeBar({ account }: { account: AccountResponse }) {
  const { t } = useTranslation();

  const model = buildStandardRangeModel({
    currentBalance: account.balance,
    balancePerDay: account.balancePerDay,
    decimalPlaces: account.currency.decimalPlaces,
  });

  const {
    low,
    high,
    current,
    currentPct,
    zeroPct,
    isAboveHigh,
    isBelowLow,
    aboveDelta,
    belowDelta,
  } = model;

  const ariaStatus = isAboveHigh
    ? t('accounts.overview.standardBar.ariaAboveHigh', {
        amount: formatCurrency(aboveDelta, account.currency),
      })
    : isBelowLow
      ? t('accounts.overview.standardBar.ariaBelowLow', {
          amount: formatCurrency(belowDelta, account.currency),
        })
      : t('accounts.overview.standardBar.ariaWithinRange');

  const ariaLabel = t('accounts.overview.standardBar.ariaLabel', {
    low: formatCurrency(low, account.currency),
    high: formatCurrency(high, account.currency),
    current: formatCurrency(current, account.currency),
    status: ariaStatus,
  });

  const contextText = isAboveHigh
    ? t('accounts.overview.standardBar.aboveHigh', {
        amount: formatCurrency(aboveDelta, account.currency),
      })
    : isBelowLow
      ? t('accounts.overview.standardBar.belowLow', {
          amount: formatCurrency(belowDelta, account.currency),
        })
      : t('accounts.overview.standardBar.withinRange');

  return (
    <Stack gap={8}>
      <Text size="xs" c="dimmed">
        {t('accounts.overview.standardBar.rangeLabel')}
      </Text>

      <Box className={styles.track} role="img" aria-label={ariaLabel}>
        {zeroPct !== null && <span className={styles.zeroMarker} style={{ left: `${zeroPct}%` }} />}
        <span className={styles.currentMarker} style={{ left: `${currentPct}%` }} />
      </Box>

      <Group justify="space-between">
        <Text size="xs" c="dimmed">
          {t('accounts.overview.standardBar.low', {
            value: formatCurrency(low, account.currency),
          })}
        </Text>
        <Text size="xs" c="dimmed">
          {t('accounts.overview.standardBar.high', {
            value: formatCurrency(high, account.currency),
          })}
        </Text>
      </Group>

      <Group gap="md" wrap="wrap">
        <Group gap={6} align="center">
          <span className={styles.legendDotCurrent} />
          <Text size="xs">
            {t('accounts.overview.standardBar.current', {
              value: formatCurrency(current, account.currency),
            })}
          </Text>
        </Group>
        {zeroPct !== null && (
          <Group gap={6} align="center">
            <span className={styles.legendZeroLine} />
            <Text size="xs">{t('accounts.overview.standardBar.zero')}</Text>
          </Group>
        )}
      </Group>

      <Text size="xs" c="dimmed">
        {contextText}
      </Text>

      <Group justify="space-between" mt={8}>
        <Text size="sm" c="dimmed">
          {t('accounts.overview.standardBar.netChangeThisPeriod')}
        </Text>
        <Text fw={600} size="sm">
          {formatCurrency(account.balanceChangeThisPeriod, account.currency)}
        </Text>
      </Group>
    </Stack>
  );
}
