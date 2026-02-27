import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Anchor, Breadcrumbs, Skeleton, Text, Title } from '@mantine/core';
import { AccountDetail, AccountResponse, AccountType } from '@/types/account';
import { formatCurrency } from '@/utils/currency';

interface Props {
  account: AccountResponse | undefined;
  detail: AccountDetail | undefined;
  isLoading: boolean;
}

function getAccountTypeLabel(accountType: AccountType, t: (key: string) => string): string {
  switch (accountType) {
    case 'Checking':
      return t('accounts.detail.typeLabels.liquid');
    case 'Savings':
      return t('accounts.detail.typeLabels.protected');
    case 'CreditCard':
      return t('accounts.detail.typeLabels.debt');
    case 'Wallet':
      return t('accounts.detail.typeLabels.liquid');
    case 'Allowance':
      return t('accounts.detail.typeLabels.liquid');
    default:
      return t('accounts.detail.typeLabels.default');
  }
}

export function AccountDetailHeader({ account, detail, isLoading }: Props) {
  const { t } = useTranslation();

  if (isLoading) {
    return <Skeleton height={60} mb="xl" />;
  }

  const sign = detail && detail.balanceChange >= 0 ? '+' : '';
  const periodLabel =
    detail && account
      ? `${sign}${formatCurrency(detail.balanceChange, account.currency)} · ${detail.periodStart} – ${detail.periodEnd}`
      : '';

  return (
    <div style={{ marginBottom: 40 }}>
      <Breadcrumbs mb="md">
        <Anchor component={Link} to="/accounts" size="sm">
          {t('accounts.header.title')}
        </Anchor>
        <Text size="sm">{account?.name ?? '—'}</Text>
      </Breadcrumbs>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <Title order={4}>{account?.name}</Title>
          <Text size="xs" tt="uppercase" c="dimmed">
            {account ? getAccountTypeLabel(account.accountType, t) : ''}
          </Text>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Title order={2}>
            {account ? formatCurrency(detail?.balance ?? 0, account.currency) : '—'}
          </Title>
          <Text size="sm" c="dimmed">
            {periodLabel}
          </Text>
        </div>
      </div>
    </div>
  );
}
