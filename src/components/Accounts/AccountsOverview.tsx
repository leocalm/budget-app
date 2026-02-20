import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Badge, Box, Group, Loader, Stack, Text, Tooltip } from '@mantine/core';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useInfiniteAccounts } from '@/hooks/useAccounts';
import { AccountResponse, AccountType, CurrencyResponse } from '@/types/account';
import { formatCurrency } from '@/utils/currency';
import styles from './Accounts.module.css';

type AccountGroup = {
  key: string;
  labelKey: string;
  types: AccountType[];
};

const ACCOUNT_GROUPS: AccountGroup[] = [
  {
    key: 'liquid',
    labelKey: 'accounts.overview.groups.liquid',
    types: ['Checking', 'Wallet', 'Allowance'],
  },
  { key: 'savings', labelKey: 'accounts.overview.groups.savings', types: ['Savings'] },
  { key: 'debt', labelKey: 'accounts.overview.groups.debt', types: ['CreditCard'] },
];

function PeriodChange({ amount, currency }: { amount: number; currency: CurrencyResponse }) {
  const { t } = useTranslation();
  if (amount === 0) {
    return null;
  }
  const arrow = amount > 0 ? '↑' : '↓';
  const abs = Math.abs(amount);
  return (
    <Text size="xs" c={amount > 0 ? 'teal' : 'red'}>
      {t('accounts.overview.periodChange', {
        arrow,
        amount: formatCurrency(abs, currency),
      })}
    </Text>
  );
}

function AllowanceAccountRow({ account }: { account: AccountResponse }) {
  const { t } = useTranslation();
  const projected =
    account.nextTransferAmount != null ? account.balance + account.nextTransferAmount : null;

  return (
    <Box className={styles.accountRow}>
      <Group justify="space-between" mb={8}>
        <Group gap={8}>
          <span>{account.icon}</span>
          <Text fw={600}>{account.name}</Text>
          <Badge variant="light" size="xs" color="orange">
            {t('accounts.types.Allowance')}
          </Badge>
        </Group>
        <Text fw={700}>{formatCurrency(account.balance, account.currency)}</Text>
      </Group>

      <div className={styles.allowanceGrid}>
        <div className={styles.allowanceCell}>
          <Text size="xs" c="dimmed" mb={2}>
            {t('accounts.overview.allowanceCard.thisPeriod')}
          </Text>
          <Text fw={600} size="sm">
            {formatCurrency(account.balanceChangeThisPeriod, account.currency)}
          </Text>
        </div>
        <div className={styles.allowanceCell}>
          <Text size="xs" c="dimmed" mb={2}>
            {t('accounts.overview.allowanceCard.nextTransfer')}
          </Text>
          <Text fw={600} size="sm">
            {account.nextTransferAmount != null
              ? formatCurrency(account.nextTransferAmount, account.currency)
              : t('accounts.overview.allowanceCard.notSet')}
          </Text>
        </div>
        <div className={styles.allowanceCell}>
          <Text size="xs" c="dimmed" mb={2}>
            {t('accounts.overview.allowanceCard.projectedAfterTransfer')}
          </Text>
          <Text fw={600} size="sm">
            {projected != null
              ? formatCurrency(projected, account.currency)
              : t('accounts.overview.allowanceCard.notSet')}
          </Text>
        </div>
      </div>
    </Box>
  );
}

function StandardAccountRow({ account }: { account: AccountResponse }) {
  return (
    <Box className={styles.accountRow}>
      <Group justify="space-between">
        <Group gap={8}>
          <span>{account.icon}</span>
          <div>
            <Text fw={600}>{account.name}</Text>
            <PeriodChange amount={account.balanceChangeThisPeriod} currency={account.currency} />
          </div>
        </Group>
        <Text fw={700}>{formatCurrency(account.balance, account.currency)}</Text>
      </Group>
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

  return (
    <div className={styles.groupSection}>
      <Text className={styles.groupLabel}>{t(group.labelKey)}</Text>
      {groupAccounts.map((account) =>
        account.accountType === 'Allowance' ? (
          <AllowanceAccountRow key={account.id} account={account} />
        ) : (
          <StandardAccountRow key={account.id} account={account} />
        )
      )}
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
          <Text size="sm" c="dimmed">
            {t('accounts.overview.netPosition')}
          </Text>
          <Tooltip label={t('accounts.overview.netPositionTooltip')}>
            <Text size="xs" c="dimmed" style={{ cursor: 'help' }}>
              ⓘ
            </Text>
          </Tooltip>
        </Group>
        <Text className={styles.netPositionValue}>
          {primaryCurrency ? formatCurrency(netPosition, primaryCurrency) : '—'}
        </Text>
      </Box>

      {/* Account Groups */}
      <Stack gap="xl">
        {ACCOUNT_GROUPS.map((group) => (
          <AccountGroupSection key={group.key} group={group} accounts={accounts} />
        ))}
      </Stack>
    </Stack>
  );
}
