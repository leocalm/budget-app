import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Group, Loader, Progress, Stack, Text, Tooltip } from '@mantine/core';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useInfiniteAccounts } from '@/hooks/useAccounts';
import { AccountResponse, AccountType } from '@/types/account';
import { formatCurrency } from '@/utils/currency';
import { AllowanceRangeBar } from './AllowanceRangeBar';
import { StandardRangeBar } from './StandardRangeBar';
import styles from './Accounts.module.css';

type AccountGroup = {
  key: string;
  labelKey: string;
  types: AccountType[];
};

const ACCOUNT_GROUPS: AccountGroup[] = [
  {
    key: 'liquid',
    labelKey: 'accounts.overview.groups.liquidSection',
    types: ['Checking', 'Wallet'],
  },
  { key: 'savings', labelKey: 'accounts.overview.groups.protectedSection', types: ['Savings'] },
  { key: 'debt', labelKey: 'accounts.overview.groups.debtSection', types: ['CreditCard'] },
];

function AllowanceAccountRow({ account }: { account: AccountResponse }) {
  const { t } = useTranslation();
  const projected =
    account.nextTransferAmount != null ? account.balance + account.nextTransferAmount : null;

  return (
    <Box className={styles.accountRow}>
      <Group justify="space-between" mb={12}>
        <Text fw={700} size="lg">
          {account.name}
        </Text>
        <Text fw={700} size="lg">
          {formatCurrency(account.balance, account.currency)}
        </Text>
      </Group>

      <AllowanceRangeBar account={account} />

      <Stack gap={6} mt={16}>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {t('accounts.overview.allowanceCard.netChangeThisPeriod')}
          </Text>
          <Text fw={600} size="sm">
            {formatCurrency(account.balanceChangeThisPeriod, account.currency)}
          </Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {t('accounts.overview.allowanceCard.nextTransfer')}
          </Text>
          <Text fw={600} size="sm">
            {account.nextTransferAmount != null
              ? formatCurrency(account.nextTransferAmount, account.currency)
              : t('accounts.overview.allowanceCard.notSet')}
          </Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {t('accounts.overview.allowanceCard.balanceAfterNextTransfer')}
          </Text>
          <Text fw={600} size="sm">
            {projected != null
              ? formatCurrency(projected, account.currency)
              : t('accounts.overview.allowanceCard.notSet')}
          </Text>
        </Group>
      </Stack>
    </Box>
  );
}

function AllowanceGroupSection({ accounts }: { accounts: AccountResponse[] }) {
  const { t } = useTranslation();
  const allowanceAccounts = accounts.filter((a) => a.accountType === 'Allowance');

  if (allowanceAccounts.length === 0) {
    return null;
  }

  const primaryCurrency = allowanceAccounts[0]?.currency;
  const total = allowanceAccounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className={styles.groupSection}>
      <Group justify="space-between">
        <Text className={styles.groupLabel}>{t('accounts.overview.groups.allowance')}</Text>
        {primaryCurrency && (
          <Text className={styles.groupLabel}>{formatCurrency(total, primaryCurrency)}</Text>
        )}
      </Group>
      {allowanceAccounts.map((account) => (
        <AllowanceAccountRow key={account.id} account={account} />
      ))}
    </div>
  );
}

function StandardAccountRow({ account }: { account: AccountResponse }) {
  return (
    <Box className={styles.accountRow}>
      <Group justify="space-between" mb={12}>
        <Text fw={700} size="lg" c="var(--text-primary)">
          {account.name}
        </Text>
        <Text fw={700} size="lg" c="var(--text-primary)">
          {formatCurrency(account.balance, account.currency)}
        </Text>
      </Group>
      <StandardRangeBar account={account} />
    </Box>
  );
}

function AccountGroupSection({
  group,
  accounts,
}: {
  group: AccountGroup;
  accounts: AccountResponse[];
}) {
  const { t } = useTranslation();
  const groupAccounts = accounts.filter((a) => group.types.includes(a.accountType));

  if (groupAccounts.length === 0) {
    return null;
  }

  const primaryCurrency = groupAccounts[0]?.currency;
  const total = groupAccounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className={styles.groupSection}>
      <Group justify="space-between">
        <Text className={styles.groupLabel}>{t(group.labelKey)}</Text>
        {primaryCurrency && (
          <Text className={styles.groupLabel}>{formatCurrency(total, primaryCurrency)}</Text>
        )}
      </Group>
      {groupAccounts.map((account) => (
        <StandardAccountRow key={account.id} account={account} />
      ))}
    </div>
  );
}

export function AccountsOverview() {
  const { t } = useTranslation();
  const { selectedPeriodId } = useBudgetPeriodSelection();

  const {
    data: paginatedAccounts,
    isLoading,
    isError,
    refetch,
  } = useInfiniteAccounts(selectedPeriodId);

  const accounts = useMemo(
    () => paginatedAccounts?.pages.flatMap((page) => page.accounts) ?? [],
    [paginatedAccounts]
  );

  const netPosition = useMemo(() => accounts.reduce((sum, a) => sum + a.balance, 0), [accounts]);
  const primaryCurrency = accounts[0]?.currency;

  const liquidTotal = useMemo(
    () =>
      accounts
        .filter((a) => (['Checking', 'Wallet'] as AccountType[]).includes(a.accountType))
        .reduce((sum, a) => sum + a.balance, 0),
    [accounts]
  );
  const savingsTotal = useMemo(
    () =>
      accounts.filter((a) => a.accountType === 'Savings').reduce((sum, a) => sum + a.balance, 0),
    [accounts]
  );
  const debtTotal = useMemo(
    () =>
      accounts.filter((a) => a.accountType === 'CreditCard').reduce((sum, a) => sum + a.balance, 0),
    [accounts]
  );
  const progressMax = liquidTotal + savingsTotal;
  const progressValue = progressMax > 0 ? Math.max(0, (netPosition / progressMax) * 100) : 0;

  if (isLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    );
  }

  if (isError) {
    return (
      <Alert color="red" onClose={() => void refetch()}>
        {t('common.error')}
      </Alert>
    );
  }

  return (
    <Stack gap="xl">
      {/* Net Position */}
      <Box className={styles.netPositionBlock}>
        <Group gap={8} mb={4}>
          <Text className={styles.netPositionLabel}>{t('accounts.overview.netPosition')}</Text>
          <Tooltip label={t('accounts.overview.netPositionTooltip')}>
            <Text size="xs" c="dimmed" style={{ cursor: 'help' }}>
              ⓘ
            </Text>
          </Tooltip>
        </Group>
        <Text className={styles.netPositionValue}>
          {primaryCurrency ? formatCurrency(netPosition, primaryCurrency) : '—'}
        </Text>
        {progressMax > 0 && (
          <>
            <Progress value={progressValue} size="sm" radius="xl" mt={12} mb={8} />
            <Group gap="lg">
              {liquidTotal > 0 && primaryCurrency && (
                <Text size="xs" c="dimmed">
                  {t('accounts.overview.groups.liquid')}{' '}
                  {formatCurrency(liquidTotal, primaryCurrency)}
                </Text>
              )}
              {savingsTotal > 0 && primaryCurrency && (
                <Text size="xs" c="dimmed">
                  {t('accounts.overview.groups.savings')}{' '}
                  {formatCurrency(savingsTotal, primaryCurrency)}
                </Text>
              )}
              {debtTotal !== 0 && primaryCurrency && (
                <Text size="xs" c="dimmed">
                  {t('accounts.overview.groups.debt')} {formatCurrency(debtTotal, primaryCurrency)}
                </Text>
              )}
            </Group>
          </>
        )}
      </Box>

      {/* Account Groups: Liquid → Allowance → Protected → Debt */}
      <Stack gap="xl">
        <AccountGroupSection group={ACCOUNT_GROUPS[0]} accounts={accounts} />
        <AllowanceGroupSection accounts={accounts} />
        <AccountGroupSection group={ACCOUNT_GROUPS[1]} accounts={accounts} />
        <AccountGroupSection group={ACCOUNT_GROUPS[2]} accounts={accounts} />
      </Stack>
    </Stack>
  );
}
