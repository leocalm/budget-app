import { Button, Skeleton, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useAccountBalanceHistory, useAccountDetails } from '@/hooks/v2/useAccounts';
import { useV2Theme } from '@/theme/v2';
import type { AccountExt } from './AccountCard.types';
import {
  AccountCardHeaderRow,
  CardHeader,
  getChangePrefix,
  HeroSubtitle,
} from './AccountCardHeader';
import { AllowanceSection, CreditCardSection, StandardSection } from './AccountCardSections';
import { AccountSparkline } from './AccountSparkline';
import { getAccountTypeColor } from './accountTypeColors';
import classes from './AccountCard.module.css';

interface AccountCardProps {
  accountId: string;
  periodId: string;
}

export function AccountCard({ accountId, periodId }: AccountCardProps) {
  const { data, isLoading, isError, refetch } = useAccountDetails(accountId, periodId);
  const { data: history } = useAccountBalanceHistory(accountId, periodId);
  const { accents } = useV2Theme();

  if (isLoading) {
    return <AccountCardSkeleton />;
  }

  if (isError) {
    return (
      <div className={classes.card} data-testid={`account-card-${accountId}-error`}>
        <div className={classes.centeredState}>
          <Text fz="sm" fw={600}>
            Account
          </Text>
          <Text fz="sm" c="dimmed">
            Something went wrong loading this account.
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const acct = data as AccountExt;
  const typeColor = getAccountTypeColor(acct.type, accents);

  if (acct.status === 'inactive') {
    return (
      <div className={classes.cardArchived} data-testid={`account-card-${accountId}`}>
        <div className={classes.centeredState}>
          <CardHeader name={acct.name} type={acct.type} typeColor={typeColor} />
          <Text fz="sm" c="dimmed">
            This account has been archived.
          </Text>
        </div>
      </div>
    );
  }

  if (acct.numberOfTransactions === 0 && acct.currentBalance === 0) {
    return (
      <div className={classes.card} data-testid={`account-card-${accountId}`}>
        <div className={classes.centeredState}>
          <CardHeader name={acct.name} type={acct.type} typeColor={typeColor} />
          <Text fz={32} fw={700} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={0} />
          </Text>
          <Text fz="sm" c="dimmed">
            No transactions yet this period.
          </Text>
        </div>
      </div>
    );
  }

  const changePrefix = getChangePrefix(acct.netChangeThisPeriod);

  return (
    <div className={classes.card} data-testid={`account-card-${accountId}`}>
      <AccountCardHeaderRow name={acct.name} type={acct.type} typeColor={typeColor} />

      <div className={classes.heroRow}>
        <div className={classes.heroLeft}>
          <Text fz={32} fw={700} lh={1.1} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={acct.currentBalance} />
          </Text>
          <HeroSubtitle acct={acct} changePrefix={changePrefix} />
        </div>
        <div className={classes.sparklineWrapper}>
          <AccountSparkline history={history ?? undefined} acctName={acct.name} />
        </div>
      </div>

      {acct.type === 'CreditCard' && <CreditCardSection acct={acct} typeColor={typeColor} />}
      {acct.type === 'Allowance' && <AllowanceSection acct={acct} />}
      {(acct.type === 'Checking' || acct.type === 'Savings' || acct.type === 'Wallet') && (
        <StandardSection acct={acct} />
      )}
    </div>
  );
}

function AccountCardSkeleton() {
  return (
    <div className={classes.card} data-testid="account-card-loading">
      <div className={classes.header}>
        <Skeleton width={120} height={16} />
        <Skeleton width={70} height={22} radius="md" />
      </div>
      <Stack gap="md">
        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <Skeleton width={154} height={36} mb={8} />
            <Skeleton width={120} height={14} />
          </div>
          <Skeleton height={56} radius="md" style={{ flex: 1 }} />
        </div>
        <div className={classes.statsGrid}>
          <div className={classes.statBox}>
            <Skeleton width={50} height={10} mb={4} />
            <Skeleton width={100} height={18} />
          </div>
          <div className={classes.statBox}>
            <Skeleton width={60} height={10} mb={4} />
            <Skeleton width={80} height={18} />
          </div>
        </div>
      </Stack>
    </div>
  );
}
