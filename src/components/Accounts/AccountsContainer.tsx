import React, { useMemo } from 'react';
import { IconPlus, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Button, Collapse, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAccounts, useDeleteAccount } from '@/hooks/useAccounts';
import { AccountsSummary } from './AccountsSummary';
import { AccountsTableView, AccountStats } from './AccountsTableView';
import { CreateAccountForm } from './CreateAccountForm';
import styles from './Accounts.module.css';

export function AccountsContainer() {
  const navigate = useNavigate();
  const { data: accounts, isLoading } = useAccounts();
  const deleteMutation = useDeleteAccount();
  const [createOpened, { toggle: toggleCreate, close: closeCreate }] = useDisclosure(false);

  // Calculate Summary Stats
  const summary = useMemo(() => {
    if (!accounts) {
      return { totalAssets: 0, totalLiabilities: 0, netWorth: 0 };
    }

    return accounts.reduce(
      (acc, account) => {
        const balance = account.balance;
        if (balance >= 0) {
          acc.totalAssets += balance;
        } else {
          acc.totalLiabilities += balance;
        }
        acc.netWorth += balance;
        return acc;
      },
      { totalAssets: 0, totalLiabilities: 0, netWorth: 0 }
    );
  }, [accounts]);

  // Mock Stats for individual cards (since we don't have the history endpoint connected yet)
  const accountStats = useMemo(() => {
    if (!accounts) {
      return {};
    }
    const stats: Record<string, AccountStats> = {};

    accounts.forEach((acc) => {
      stats[acc.id] = {
        balanceHistory: [
          { date: '2024-01-01', balance: acc.balance * 0.9 },
          { date: '2024-01-05', balance: acc.balance * 0.92 },
          { date: '2024-01-10', balance: acc.balance * 0.94 },
          { date: '2024-01-15', balance: acc.balance * 0.95 },
          { date: '2024-01-20', balance: acc.balance * 0.97 },
          { date: '2024-01-25', balance: acc.balance * 0.99 },
          { date: '2024-01-30', balance: acc.balance },
        ],
        monthlySpent: 0,
        transactionCount: 0,
      };
    });
    return stats;
  }, [accounts]);

  const accountCount = accounts?.length ?? 0;

  return (
    <Stack gap="xl">
      {/* Header */}
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2} fw={700} mb="xs">
            Accounts
          </Title>
          <Text size="sm" c="dimmed">
            Manage your banks, wallets, and credit cards.
          </Text>
        </div>
        <Button
          onClick={toggleCreate}
          variant={createOpened ? 'light' : 'filled'}
          color={createOpened ? 'gray' : undefined}
          leftSection={createOpened ? <IconX size={18} /> : <IconPlus size={18} />}
          className={createOpened ? undefined : styles.addButton}
        >
          {createOpened ? 'Cancel' : 'Add Account'}
        </Button>
      </Group>

      {/* Create Account Form (collapsible) */}
      <Collapse in={createOpened}>
        <Paper
          withBorder
          p="xl"
          radius="md"
          mb="xl"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <Stack gap="md">
            <div>
              <Text fw={700} size="lg">
                New Account Details
              </Text>
              <Text size="xs" c="dimmed">
                Fill in the information below to add a new account to your budget.
              </Text>
            </div>
            <Divider variant="dashed" />
            <CreateAccountForm onAccountCreated={closeCreate} />
          </Stack>
        </Paper>
      </Collapse>

      {/* Summary Cards */}
      <AccountsSummary
        totalAssets={summary.totalAssets}
        totalLiabilities={summary.totalLiabilities}
        netWorth={summary.netWorth}
        accountCount={accountCount}
      />

      {/* Accounts Grid */}
      <AccountsTableView
        accounts={accounts}
        isLoading={isLoading}
        onDelete={(id) => deleteMutation.mutate(id)}
        onAccountUpdated={() => {}}
        accountStats={accountStats}
        onViewDetails={(account) => navigate(`/accounts/${account.id}`)}
      />
    </Stack>
  );
}
