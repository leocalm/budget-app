import React from 'react';
import { Paper, SimpleGrid, Text } from '@mantine/core';
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
  const formatCurrency = (value: number) => {
    const abs = Math.abs(value / 100);
    const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2 });
    return value < 0 ? `-\u20AC ${formatted}` : `\u20AC ${formatted}`;
  };

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb="xl">
      <Paper withBorder p="xl" radius="lg">
        <Text size="xs" fw={600} tt="uppercase" lts="0.05em" c="dimmed" mb="md">
          Total Net Worth
        </Text>
        <Text size="2xl" fw={700} ff="monospace" mb="xs" className={styles.summaryValueGradient}>
          {formatCurrency(netWorth)}
        </Text>
        <Text size="sm" c="dimmed">
          Across {accountCount} account{accountCount !== 1 ? 's' : ''}
        </Text>
      </Paper>
      <Paper withBorder p="xl" radius="lg">
        <Text size="xs" fw={600} tt="uppercase" lts="0.05em" c="dimmed" mb="md">
          Total Assets
        </Text>
        <Text size="2xl" fw={700} ff="monospace" mb="xs" c="var(--accent-success)">
          {formatCurrency(totalAssets)}
        </Text>
        <Text size="sm" c="dimmed">
          Cash &amp; savings
        </Text>
      </Paper>
      <Paper withBorder p="xl" radius="lg">
        <Text size="xs" fw={600} tt="uppercase" lts="0.05em" c="dimmed" mb="md">
          Total Liabilities
        </Text>
        <Text size="2xl" fw={700} ff="monospace" mb="xs" c="var(--accent-danger)">
          {formatCurrency(totalLiabilities)}
        </Text>
        <Text size="sm" c="dimmed">
          Credit cards &amp; debt
        </Text>
      </Paper>
    </SimpleGrid>
  );
}
