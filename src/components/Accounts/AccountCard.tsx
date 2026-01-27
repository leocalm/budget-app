import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkline } from '@mantine/charts';
import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Menu,
  Stack,
  Text,
  ThemeIcon,
  useMantineColorScheme,
} from '@mantine/core';
import type { AccountResponse } from '@/types/account';

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

export function AccountCard({
  account,
  balanceHistory,
  monthlySpent,
  transactionCount,
  onEdit,
  onDelete,
  onViewDetails,
}: AccountCardProps) {
  const { t } = useTranslation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  // Calculate stats
  const currentBalance = account.balance / 100;
  const startBalance = balanceHistory.length > 0 ? balanceHistory[0].balance / 100 : currentBalance;
  const balanceChange = currentBalance - startBalance;
  const isPositive = balanceChange >= 0;

  return (
    <Card
      padding="lg"
      radius="md"
      style={{
        backgroundColor: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-white)',
        border: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <ThemeIcon color={account.color} variant="light" size="lg" radius="md">
            <Text size="lg" fw={700}>
              {account.name.charAt(0)}
            </Text>
          </ThemeIcon>
          <div>
            <Text fw={600} size="sm" lh={1.2}>
              {account.name}
            </Text>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              {account.accountType}
            </Text>
          </div>
        </Group>

        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <span>⋮</span>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<span>👁️</span>} onClick={() => onViewDetails(account)}>
              {t('accounts.card.viewDetails')}
            </Menu.Item>
            <Menu.Item leftSection={<span>✏️</span>} onClick={() => onEdit(account)}>
              {t('accounts.card.editAccount')}
            </Menu.Item>
            <Menu.Item
              color="red"
              leftSection={<span>🗑️</span>}
              onClick={() => onDelete(account.id)}
            >
              {t('accounts.card.deleteAccount')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Stack gap="xs" mb="xl">
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">
          {t('accounts.card.currentBalance')}
        </Text>
        <Text size="2xl" fw={700} style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}>
          {account.currency.symbol}{' '}
          {currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
        <Group gap="xs">
          <Badge size="sm" variant="light" color={isPositive ? 'green' : 'red'}>
            {isPositive ? '+' : ''}
            {balanceChange.toLocaleString('en-US', {
              style: 'currency',
              currency: account.currency.currency,
            })}
          </Badge>
          <Text size="xs" c="dimmed">
            {t('accounts.card.thisPeriod')}
          </Text>
        </Group>
      </Stack>

      <div style={{ height: 60, marginBottom: 16 }}>
        <Sparkline
          data={balanceHistory.map((h) => h.balance / 100)}
          h={60}
          curveType="monotone"
          color={account.color}
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </div>

      <Group grow>
        <div>
          <Text size="xs" c="dimmed">
            {t('accounts.card.monthlySpent')}
          </Text>
          <Text size="sm" fw={600}>
            {account.currency.symbol} {(monthlySpent / 100).toLocaleString()}
          </Text>
        </div>
        <div>
          <Text size="xs" c="dimmed">
            {t('accounts.card.transactions')}
          </Text>
          <Text size="sm" fw={600}>
            {transactionCount}
          </Text>
        </div>
      </Group>
    </Card>
  );
}
