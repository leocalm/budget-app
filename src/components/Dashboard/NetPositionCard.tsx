import { useTranslation } from 'react-i18next';
import { Button, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { CurrencyResponse } from '@/types/account';
import { NetPosition } from '@/types/dashboard';
import { Money } from '@/types/money';
import styles from './Dashboard.module.css';

interface NetPositionCardProps {
  data?: NetPosition;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  currency: CurrencyResponse;
  locale: string;
  lastUpdated?: Date;
}

const formatRelativeTime = (date: Date, locale: string): string => {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (diffMins < 60) {
    return rtf.format(-diffMins, 'minute');
  }
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return rtf.format(-diffHours, 'hour');
  }
  const diffDays = Math.floor(diffHours / 24);
  return rtf.format(-diffDays, 'day');
};

const formatMoney = (amount: number, currency: CurrencyResponse, locale: string): string => {
  return new Money(amount, currency).format(locale);
};

const formatSignedMoney = (amount: number, currency: CurrencyResponse, locale: string): string => {
  if (amount === 0) {
    return `+${formatMoney(0, currency, locale)}`;
  }

  const sign = amount > 0 ? '+' : '-';
  return `${sign}${formatMoney(Math.abs(amount), currency, locale)}`;
};

export const NetPositionCard = ({
  data,
  isLoading,
  isError,
  onRetry,
  currency,
  locale,
  lastUpdated,
}: NetPositionCardProps) => {
  const { t } = useTranslation();

  const computeSegmentWidths = () => {
    if (!data) {
      return { liquid: 0, protected: 0, debt: 0 };
    }
    const liquidAbs = Math.abs(data.liquidBalance);
    const protectedAbs = Math.abs(data.protectedBalance);
    const debtAbs = Math.abs(data.debtBalance);
    const total = liquidAbs + protectedAbs + debtAbs;
    if (total === 0) {
      return { liquid: 0, protected: 0, debt: 0 };
    }
    return {
      liquid: (liquidAbs / total) * 100,
      protected: (protectedAbs / total) * 100,
      debt: (debtAbs / total) * 100,
    };
  };

  const segmentWidths = computeSegmentWidths();

  let testId = 'net-position-active';
  if (isError) {
    testId = 'net-position-error';
  } else if (isLoading) {
    testId = 'net-position-loading';
  } else if (data?.accountCount === 0) {
    testId = 'net-position-empty';
  }

  return (
    <Paper className={styles.wireframeCard} withBorder data-testid={testId}>
      <Text component="h2">{t('dashboard.netPosition.title')}</Text>

      {isError && (
        <Stack gap="xs" align="flex-start">
          <Text className={styles.meta}>{t('dashboard.netPosition.error')}</Text>
          <Button variant="subtle" size="xs" onClick={onRetry}>
            {t('dashboard.netPosition.retry')}
          </Button>
        </Stack>
      )}

      {!isError && isLoading && (
        <Stack gap="sm">
          <div className={styles.netGrid}>
            <div>
              <Skeleton height={46} width="60%" />
              <Skeleton height={18} width="40%" mt="sm" />
            </div>
            <div>
              <Skeleton height={16} width={100} />
              <Skeleton height={16} width={80} mt="xs" />
            </div>
          </div>
          <Skeleton height={6} width="100%" radius="xl" mt="md" />
          <Skeleton height={16} width="70%" />
        </Stack>
      )}

      {!isError && !isLoading && data?.accountCount === 0 && (
        <Text className={styles.meta}>{t('dashboard.netPosition.empty')}</Text>
      )}

      {!isError && !isLoading && data && data.accountCount > 0 && (
        <>
          <div className={styles.netGrid}>
            <div>
              <Text className={styles.valueHero}>
                {formatMoney(data.totalNetPosition, currency, locale)}
              </Text>
              <Text className={styles.meta}>
                {t('dashboard.netPosition.changeThisPeriod', {
                  amount: formatSignedMoney(data.changeThisPeriod, currency, locale),
                })}
              </Text>
            </div>
            <div className={styles.netRight}>
              <div>{t('dashboard.netPosition.acrossAccounts', { count: data.accountCount })}</div>
              {lastUpdated && (
                <Text className={styles.meta} size="xs" c="dimmed">
                  {t('dashboard.netPosition.updatedAgo', {
                    time: formatRelativeTime(lastUpdated, locale),
                  })}
                </Text>
              )}
            </div>
          </div>
          <div className={styles.netDistribution}>
            <span
              className={`${styles.segment} ${styles.liquid}`}
              style={{ width: `${segmentWidths.liquid}%` }}
            />
            <span
              className={`${styles.segment} ${styles.protected}`}
              style={{ width: `${segmentWidths.protected}%` }}
            />
            <span
              className={`${styles.segment} ${styles.debt}`}
              style={{ width: `${segmentWidths.debt}%` }}
            />
          </div>
          <Text className={styles.meta}>
            {t('dashboard.netPosition.breakdownLiquid', {
              amount: formatMoney(data.liquidBalance, currency, locale),
            })}
            {' · '}
            {t('dashboard.netPosition.breakdownProtected', {
              amount: formatMoney(data.protectedBalance, currency, locale),
            })}
            {' · '}
            {t('dashboard.netPosition.breakdownDebt', {
              amount: formatMoney(data.debtBalance, currency, locale),
            })}
          </Text>
        </>
      )}
    </Paper>
  );
};
