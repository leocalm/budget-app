import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
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
}

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
}: NetPositionCardProps) => {
  const { t } = useTranslation();

  return (
    <Paper
      className={styles.netPositionCard}
      shadow="md"
      radius="lg"
      p="xl"
      withBorder
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-medium)',
      }}
    >
      <Text fw={600} size="lg" mb="md">
        {t('dashboard.netPosition.title')}
      </Text>

      {isError && (
        <Group justify="space-between" align="center" wrap="wrap" data-testid="net-position-error">
          <Text size="sm" c="dimmed">
            {t('dashboard.netPosition.error')}
          </Text>
          <Button variant="default" size="xs" onClick={onRetry}>
            {t('dashboard.netPosition.retry')}
          </Button>
        </Group>
      )}

      {!isError && isLoading && (
        <Stack gap="sm" data-testid="net-position-loading">
          <Skeleton height={38} width="45%" />
          <Skeleton height={18} width="35%" />
          <Group gap="xl" mt="xs">
            <Skeleton height={16} width={140} />
            <Skeleton height={16} width={160} />
            <Skeleton height={16} width={150} />
          </Group>
        </Stack>
      )}

      {!isError && !isLoading && data?.accountCount === 0 && (
        <Text size="sm" c="dimmed" data-testid="net-position-empty">
          {t('dashboard.netPosition.empty')}
        </Text>
      )}

      {!isError && !isLoading && data && data.accountCount > 0 && (
        <Stack gap="sm" data-testid="net-position-active">
          <Text fw={700} size="2rem" ff="monospace">
            {formatMoney(data.totalNetPosition, currency, locale)}
          </Text>
          <Text size="sm" c="dimmed">
            {t('dashboard.netPosition.changeThisPeriod', {
              amount: formatSignedMoney(data.changeThisPeriod, currency, locale),
            })}
          </Text>
          <Group gap="xl" mt="xs" wrap="wrap" className={styles.netPositionBreakdown}>
            <Text size="sm" c="dimmed">
              {t('dashboard.netPosition.breakdownLiquid', {
                amount: formatMoney(data.liquidBalance, currency, locale),
              })}
            </Text>
            <Text size="sm" c="dimmed">
              {t('dashboard.netPosition.breakdownProtected', {
                amount: formatMoney(data.protectedBalance, currency, locale),
              })}
            </Text>
            <Text size="sm" c="dimmed">
              {t('dashboard.netPosition.breakdownDebt', {
                amount: formatMoney(data.debtBalance, currency, locale),
              })}
            </Text>
          </Group>
        </Stack>
      )}
    </Paper>
  );
};
