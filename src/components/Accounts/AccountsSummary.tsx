import React from 'react';
import { useTranslation } from 'react-i18next';
import { Paper, SimpleGrid, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import styles from './Accounts.module.css';

interface AccountsSummaryProps {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  accountCount: number;
}

export function AccountsSummary({
  totalAssets,
  totalLiabilities,
  netWorth,
  accountCount,
}: AccountsSummaryProps) {
  const { t } = useTranslation();

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb="xl">
      <Paper withBorder p="xl" radius="lg">
        <Text size="xs" fw={600} tt="uppercase" lts="0.05em" c="dimmed" mb="md">
          {t('accounts.summary.netWorth')}
        </Text>
        <Text size="2xl" fw={700} ff="monospace" mb="xs" className={styles.summaryValueGradient}>
          <CurrencyValue cents={netWorth} />
        </Text>
        <Text size="sm" c="dimmed">
          {t('accounts.summary.accountCount', { count: accountCount })}
        </Text>
      </Paper>
      <Paper withBorder p="xl" radius="lg">
        <Text size="xs" fw={600} tt="uppercase" lts="0.05em" c="dimmed" mb="md">
          {t('accounts.summary.assets')}
        </Text>
        <Text size="2xl" fw={700} ff="monospace" mb="xs" c="var(--mantine-color-green-6)">
          <CurrencyValue cents={totalAssets} />
        </Text>
        <Text size="sm" c="dimmed">
          {t('accounts.summary.cashSavings')}
        </Text>
      </Paper>
      <Paper withBorder p="xl" radius="lg">
        <Text size="xs" fw={600} tt="uppercase" lts="0.05em" c="dimmed" mb="md">
          {t('accounts.summary.liabilities')}
        </Text>
        <Text size="2xl" fw={700} ff="monospace" mb="xs" c="var(--mantine-color-red-6)">
          <CurrencyValue cents={totalLiabilities} />
        </Text>
        <Text size="sm" c="dimmed">
          {t('accounts.summary.creditCardsDebt')}
        </Text>
      </Paper>
    </SimpleGrid>
  );
}
