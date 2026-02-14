import React from 'react';
import { useTranslation } from 'react-i18next';
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
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import type { AccountResponse } from '@/types/account';
import { convertCentsToDisplay } from '@/utils/currency';
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
  onTransferOrPayBill?: (account: AccountResponse) => void;
}

const ACCOUNT_TYPE_ICONS: Record<string, string> = {
  CreditCard: '💳',
  Checking: '🏦',
  Savings: '💰',
  Wallet: '💳',
  Allowance: '👨‍👩‍👧',
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
  onTransferOrPayBill,
}: AccountCardProps) {
  const { t } = useTranslation();
  const globalCurrency = useDisplayCurrency();

  // Use global currency decimal places for internal calculations to consistent with display
  const decimalPlaces = globalCurrency.decimalPlaces;

  const currentBalance = convertCentsToDisplay(account.balance, decimalPlaces);
  const startBalance =
    balanceHistory.length > 0
      ? convertCentsToDisplay(balanceHistory[0].balance, decimalPlaces)
      : currentBalance;
  const balanceChange = currentBalance - startBalance;
  const isPositive = balanceChange >= 0;
  const isNegativeBalance = currentBalance < 0;

  const accentColor = account.color || ACCOUNT_TYPE_COLORS[account.accountType] || '#00d4ff';
  const typeIcon = ACCOUNT_TYPE_ICONS[account.accountType] || '💳';
  const typeLabel = t(`accounts.types.${account.accountType}`, {
    defaultValue: account.accountType,
  });

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

  // Need raw cents for CurrencyValue
  const balanceChangeCents = Math.abs(
    account.balance - (balanceHistory.length > 0 ? balanceHistory[0].balance : account.balance)
  );

  // Note: Embedding component in translated string is complex.
  // For now, we will reconstruct the "change" display cleanly.

  // Determine stats based on account type
  const isCreditCard = account.accountType === 'CreditCard';
  const hasSpendLimit = !!account.spendLimit;

  const creditLimitLabel = t('accounts.card.stats.creditLimit');
  const spendLimitLabel = t('accounts.card.stats.spendLimit');
  const thisMonthLabel = t('accounts.card.stats.thisMonth');
  const availableLabel = t('accounts.card.stats.available');
  const transactionsLabel = t('accounts.card.stats.transactions');

  const stat1Label =
    isCreditCard && hasSpendLimit
      ? creditLimitLabel
      : hasSpendLimit
        ? spendLimitLabel
        : thisMonthLabel;

  // Stat 1 Value
  let Stat1Component;
  if (isCreditCard && hasSpendLimit) {
    Stat1Component = <CurrencyValue cents={account.spendLimit!} />;
  } else if (hasSpendLimit) {
    Stat1Component = (
      <>
        <CurrencyValue cents={account.spendLimit!} />
        /mo
      </>
    );
  } else if (monthlySpent !== 0) {
    Stat1Component = (
      <>
        -<CurrencyValue cents={Math.abs(monthlySpent)} />
      </>
    );
  } else {
    Stat1Component = <CurrencyValue cents={0} />;
  }

  const stat2Label = isCreditCard && hasSpendLimit ? availableLabel : transactionsLabel;

  let Stat2Component;
  if (isCreditCard && hasSpendLimit) {
    Stat2Component = <CurrencyValue cents={account.spendLimit! - Math.abs(account.balance)} />;
  } else {
    Stat2Component = String(transactionCount);
  }

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
              {typeIcon} {typeLabel}
            </Badge>
          </Group>
        </Box>
        <Group gap="xs" className={styles.accountActions}>
          <ActionIcon
            variant="subtle"
            color="gray"
            title={t('accounts.card.actions.edit')}
            onClick={() => onEdit(account)}
          >
            <span>✏️</span>
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            title={t('accounts.card.actions.delete')}
            onClick={() => onDelete(account.id)}
          >
            <span>🗑️</span>
          </ActionIcon>
        </Group>
      </Group>

      {/* Balance */}
      <Box px="xl" pb="xl">
        <Text size="sm" c="dimmed" mb="xs">
          {t('accounts.card.currentBalance')}
        </Text>
        <Text size="2xl" fw={700} ff="monospace" c={getBalanceColor()} mb="md">
          <CurrencyValue cents={account.balance} />
        </Text>
        <Badge variant="light" color={balanceChangeColor} size="lg" ff="monospace">
          {isPositive ? '↑' : '↓'} <CurrencyValue cents={balanceChangeCents} />{' '}
          {t('accounts.card.change').replace('{{arrow}} {{amount}}', '').trim()}
        </Badge>
      </Box>

      {/* Sparkline Chart */}
      <Divider />
      <Box p="lg" px="xl">
        <Sparkline
          data={
            balanceHistory.length > 0
              ? balanceHistory.map((h) => convertCentsToDisplay(h.balance, decimalPlaces))
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
            {Stat1Component}
          </Text>
        </Stack>
        <Stack gap={4}>
          <Text size="xs" fw={600} c="dimmed">
            {stat2Label}
          </Text>
          <Text size="sm" fw={700} ff="monospace" c="var(--text-secondary)">
            {Stat2Component}
          </Text>
        </Stack>
      </SimpleGrid>

      {/* Status */}
      <Divider />
      <Group gap="sm" px="xl" py="sm">
        <Box className={styles.statusIndicator} />
        <Text size="sm" c="dimmed">
          {t('accounts.card.statusActive')}
        </Text>
      </Group>

      {/* Quick Actions */}
      <Divider />
      <Group grow gap="sm" p="lg" px="xl">
        <Button variant="default" size="xs" onClick={() => onViewDetails(account)}>
          <span style={{ marginRight: 4 }}>📊</span>
          {t('accounts.card.viewDetails')}
        </Button>
        {onTransferOrPayBill && (
          <Button variant="default" size="xs" onClick={() => onTransferOrPayBill(account)}>
            {isCreditCard
              ? `💳 ${t('accounts.card.payBill')}`
              : `💸 ${t('accounts.card.transfer')}`}
          </Button>
        )}
      </Group>
    </Paper>
  );
}
