import React from 'react';
import { Sparkline } from '@mantine/charts';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import type { AccountResponse } from '@/types/account';
import styles from './Accounts.module.css';

interface BudgetPerDay {
  date: string;
  balance: number;
}

interface AccountCardProps {
  account: AccountResponse;
  balanceHistory: BudgetPerDay[];
  monthlySpent: number;
  transactionCount: number;
  onEdit: (account: AccountResponse) => void;
  onDelete: (id: string) => void;
  onViewDetails: (account: AccountResponse) => void;
}

const ACCOUNT_TYPE_META: Record<string, { icon: string; label: string }> = {
  CreditCard: { icon: '\uD83D\uDCB3', label: 'Credit Card' },
  Checking: { icon: '\uD83C\uDFE6', label: 'Checking' },
  Savings: { icon: '\uD83D\uDCB0', label: 'Savings' },
  Wallet: { icon: '\uD83D\uDCB3', label: 'Debit Card' },
  Allowance: { icon: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67', label: 'Allowance' },
};

const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  CreditCard: '#00d4ff',
  Checking: '#00ffa3',
  Savings: '#ffa940',
  Wallet: '#ff6b9d',
  Allowance: '#b47aff',
};

export function AccountCard({
  account,
  balanceHistory,
  monthlySpent,
  transactionCount,
  onEdit,
  onDelete,
  onViewDetails,
}: AccountCardProps) {
  const currentBalance = account.balance / 100;
  const startBalance = balanceHistory.length > 0 ? balanceHistory[0].balance / 100 : currentBalance;
  const balanceChange = currentBalance - startBalance;
  const isPositive = balanceChange >= 0;
  const isNegativeBalance = currentBalance < 0;

  const accentColor = account.color || ACCOUNT_TYPE_COLORS[account.accountType] || '#00d4ff';
  const typeMeta = ACCOUNT_TYPE_META[account.accountType] || {
    icon: '\uD83D\uDCB3',
    label: account.accountType,
  };

  const formatCurrency = (value: number) => {
    const abs = Math.abs(value);
    return abs.toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  const getBalanceColor = () => {
    if (isNegativeBalance) {
      return 'var(--accent-danger)';
    }
    if (currentBalance < 50) {
      return 'var(--text-secondary)';
    }
    return 'var(--accent-success)';
  };

  const balanceChangeColor = balanceChange === 0 ? 'gray' : isPositive ? 'green' : 'red';

  const balanceChangeText =
    balanceChange === 0
      ? 'No change'
      : `${isPositive ? '\u2191' : '\u2193'} ${account.currency.symbol}${formatCurrency(Math.abs(balanceChange))} this month`;

  // Determine stats based on account type
  const isCreditCard = account.accountType === 'CreditCard';
  const hasSpendLimit = !!account.spendLimit;

  const stat1Label =
    isCreditCard && hasSpendLimit ? 'Credit Limit' : hasSpendLimit ? 'Spend Limit' : 'This Month';
  const stat1Value =
    isCreditCard && hasSpendLimit
      ? `${account.currency.symbol} ${formatCurrency(account.spendLimit! / 100)}`
      : hasSpendLimit
        ? `${account.currency.symbol} ${formatCurrency(account.spendLimit! / 100)}/mo`
        : monthlySpent !== 0
          ? `-${account.currency.symbol} ${formatCurrency(Math.abs(monthlySpent / 100))}`
          : `${account.currency.symbol} 0`;

  const stat2Label = isCreditCard && hasSpendLimit ? 'Available' : 'Transactions';
  const stat2Value =
    isCreditCard && hasSpendLimit
      ? `${account.currency.symbol} ${formatCurrency((account.spendLimit! - Math.abs(account.balance)) / 100)}`
      : String(transactionCount);

  return (
    <Paper
      className={styles.accountCard}
      style={{ '--card-accent-color': accentColor } as React.CSSProperties}
      radius="lg"
      withBorder
    >
      {/* Header */}
      <Group justify="space-between" align="flex-start" p="xl" pb="lg">
        <Box style={{ flex: 1 }}>
          <Group gap="sm" mb="xs">
            <Title order={3} size="h4" fw={700}>
              {account.name}
            </Title>
            <Badge variant="light" color="gray" size="sm" tt="uppercase">
              {typeMeta.icon} {typeMeta.label}
            </Badge>
          </Group>
        </Box>
        <Group gap="xs" className={styles.accountActions}>
          <ActionIcon variant="subtle" color="gray" title="Edit" onClick={() => onEdit(account)}>
            <span>\u2699\uFE0F</span>
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            title="Delete"
            onClick={() => onDelete(account.id)}
          >
            <span>\u22EF</span>
          </ActionIcon>
        </Group>
      </Group>

      {/* Balance */}
      <Box px="xl" pb="xl">
        <Text size="sm" c="dimmed" mb="xs">
          Current Balance
        </Text>
        <Text size="2xl" fw={700} ff="monospace" c={getBalanceColor()} mb="md">
          {isNegativeBalance ? '-' : ''}
          {account.currency.symbol} {formatCurrency(Math.abs(currentBalance))}
        </Text>
        <Badge variant="light" color={balanceChangeColor} size="lg" ff="monospace">
          {balanceChangeText}
        </Badge>
      </Box>

      {/* Sparkline Chart */}
      <Divider />
      <Box p="lg" px="xl">
        <Sparkline
          data={
            balanceHistory.length > 0
              ? balanceHistory.map((h) => h.balance / 100)
              : [currentBalance, currentBalance]
          }
          h={80}
          curveType="monotone"
          color={accentColor}
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </Box>

      {/* Stats */}
      <Divider />
      <SimpleGrid cols={2} spacing="lg" p="lg" px="xl">
        <Stack gap={4}>
          <Text size="xs" fw={600} c="dimmed">
            {stat1Label}
          </Text>
          <Text
            size="sm"
            fw={700}
            ff="monospace"
            c={
              !isCreditCard && !hasSpendLimit && monthlySpent !== 0
                ? 'var(--accent-danger)'
                : 'var(--text-secondary)'
            }
          >
            {stat1Value}
          </Text>
        </Stack>
        <Stack gap={4}>
          <Text size="xs" fw={600} c="dimmed">
            {stat2Label}
          </Text>
          <Text size="sm" fw={700} ff="monospace" c="var(--text-secondary)">
            {stat2Value}
          </Text>
        </Stack>
      </SimpleGrid>

      {/* Status */}
      <Divider />
      <Group gap="sm" px="xl" py="sm">
        <Box className={styles.statusIndicator} />
        <Text size="sm" c="dimmed">
          Active
        </Text>
      </Group>

      {/* Quick Actions */}
      <Divider />
      <Group grow gap="sm" p="lg" px="xl">
        <Button variant="default" size="xs" onClick={() => onViewDetails(account)}>
          \uD83D\uDCCA View Details
        </Button>
        <Button variant="default" size="xs" onClick={() => onViewDetails(account)}>
          {isCreditCard ? '\uD83D\uDCB3 Pay Bill' : '\uD83D\uDCB8 Transfer'}
        </Button>
      </Group>
    </Paper>
  );
}
