import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Collapse, Divider, Paper, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useDeleteAccount, useInfiniteAccounts } from '@/hooks/useAccounts';
import { PageHeader } from '../Transactions/PageHeader';
import { AccountsSummary } from './AccountsSummary';
import { AccountsTableView } from './AccountsTableView';
import { CreateAccountForm } from './CreateAccountForm';
import styles from './Accounts.module.css';

export function AccountsContainer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const {
    data: paginatedAccounts,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteAccounts(selectedPeriodId);
  const deleteMutation = useDeleteAccount();
  const [createOpened, { toggle: toggleCreate, close: closeCreate }] = useDisclosure(false);

  const accounts = useMemo(
    () => paginatedAccounts?.pages.flatMap((page) => page.accounts) ?? [],
    [paginatedAccounts]
  );

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

  const accountCount = accounts?.length ?? 0;

  return (
    <Box
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px',
      }}
    >
      <Stack gap="xl">
        {/* Header */}
        <PageHeader
          title={t('accounts.header.title')}
          subtitle={t('accounts.header.subtitle')}
          actions={
            <Button
              onClick={toggleCreate}
              variant={createOpened ? 'light' : 'filled'}
              color={createOpened ? 'gray' : undefined}
              className={createOpened ? undefined : styles.addButton}
              size="md"
            >
              <span style={{ fontSize: '16px', marginRight: '4px' }}>
                {createOpened ? '' + '' : '+'}
              </span>
              {createOpened ? t('accounts.header.cancel') : t('accounts.header.addAccount')}
            </Button>
          }
        />

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
                  {t('accounts.createSection.title')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('accounts.createSection.description')}
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
          isLocked={selectedPeriodId === null}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => {
            void refetch();
          }}
          onDelete={(id) => deleteMutation.mutate(id)}
          onAccountUpdated={() => {}}
          onViewDetails={(account) => navigate(`/accounts/${account.id}`)}
          hasMore={Boolean(hasNextPage)}
          isLoadingMore={isFetchingNextPage}
          onLoadMore={() => {
            if (hasNextPage && !isFetchingNextPage) {
              void fetchNextPage();
            }
          }}
        />
      </Stack>
    </Box>
  );
}
