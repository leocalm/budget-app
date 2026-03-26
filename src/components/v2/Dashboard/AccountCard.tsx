import { Badge, Button, Progress, Skeleton, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useAccountBalanceHistory, useAccountDetails } from '@/hooks/v2/useAccounts';
import { useV2Theme } from '@/theme/v2';
import { AccountSparkline } from './AccountSparkline';
import { getAccountTypeColor, getAccountTypeLabel } from './accountTypeColors';
import classes from './AccountCard.module.css';

/**
 * Temporary type extension for fields being added to the API.
 * Remove after regenerating v2.d.ts with the new backend fields.
 */
type AccountDetailsData = NonNullable<ReturnType<typeof useAccountDetails>['data']>;
type AccountExt = AccountDetailsData & {
  topUpAmount?: number | null;
  topUpCycle?: string | null;
  spentThisCycle?: number | null;
  avgDailyBalance?: number | null;
  spendLimit?: number | null;
  statementCloseDay?: number | null;
  paymentDueDay?: number | null;
};

interface AccountCardProps {
  accountId: string;
  periodId: string;
}

export function AccountCard({ accountId, periodId }: AccountCardProps) {
  const { data, isLoading, isError, refetch } = useAccountDetails(accountId, periodId);
  const { data: history } = useAccountBalanceHistory(accountId, periodId);
  const { colorTheme } = useV2Theme();

  if (isLoading) {
    return <AccountCardSkeleton />;
  }

  if (isError) {
    return (
      <div className={classes.card}>
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
  const typeColor = getAccountTypeColor(acct.type, colorTheme);

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

  const changePrefix = acct.netChangeThisPeriod > 0 ? '+' : acct.netChangeThisPeriod < 0 ? '-' : '';

  return (
    <div className={classes.card} data-testid={`account-card-${accountId}`}>
      <div className={classes.header}>
        <Text fz="sm" fw={600}>
          {acct.name}
        </Text>
        <Badge size="xs" variant="light" style={{ color: typeColor }}>
          {getAccountTypeLabel(acct.type)}
        </Badge>
      </div>

      <div className={classes.heroRow}>
        <div className={classes.heroLeft}>
          <Text fz={32} fw={700} lh={1.1} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={acct.currentBalance} />
          </Text>
          <HeroSubtitle acct={acct} changePrefix={changePrefix} />
        </div>
        <div className={classes.sparklineWrapper}>
          <AccountSparkline history={history ?? undefined} />
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

function CardHeader({ name, type, typeColor }: { name: string; type: string; typeColor: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Text fz="sm" fw={600}>
        {name}
      </Text>
      <Badge size="xs" variant="light" style={{ color: typeColor }}>
        {getAccountTypeLabel(type as AccountExt['type'])}
      </Badge>
    </div>
  );
}

function HeroSubtitle({ acct, changePrefix }: { acct: AccountExt; changePrefix: string }) {
  if (acct.type === 'CreditCard') {
    return (
      <Text fz="sm" c="dimmed" ff="var(--mantine-font-family-monospace)" mt={4}>
        current balance
      </Text>
    );
  }
  if (acct.type === 'Allowance' && acct.topUpAmount) {
    return (
      <Text fz="sm" c="dimmed" ff="var(--mantine-font-family-monospace)" mt={4}>
        <CurrencyValue cents={acct.topUpAmount} /> / {acct.topUpCycle ?? 'week'}
      </Text>
    );
  }
  return (
    <Text fz="sm" c="dimmed" ff="var(--mantine-font-family-monospace)" mt={4}>
      <span>
        {changePrefix}
        <CurrencyValue cents={Math.abs(acct.netChangeThisPeriod)} />
      </span>{' '}
      this period
    </Text>
  );
}

function StandardSection({ acct }: { acct: AccountExt }) {
  const boxes: { label: string; value: React.ReactNode }[] = [];
  if (acct.type === 'Checking') {
    boxes.push({ label: 'Transactions', value: acct.numberOfTransactions });
    boxes.push({
      label: 'Avg Daily Balance',
      value: <CurrencyValue cents={acct.avgDailyBalance ?? 0} />,
    });
  } else if (acct.type === 'Savings') {
    boxes.push({ label: 'Inflows', value: <CurrencyValue cents={acct.inflow} /> });
    boxes.push({ label: 'Outflows', value: <CurrencyValue cents={acct.outflow} /> });
  } else {
    boxes.push({ label: 'Transactions', value: acct.numberOfTransactions });
    boxes.push({
      label: 'Period Change',
      value: <CurrencyValue cents={acct.netChangeThisPeriod} />,
    });
  }
  return (
    <div className={classes.statsGrid}>
      {boxes.map((b) => (
        <div key={b.label} className={classes.statBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            {b.label}
          </Text>
          <Text fz="md" fw={500} ff="var(--mantine-font-family-monospace)">
            {b.value}
          </Text>
        </div>
      ))}
    </div>
  );
}

function AllowanceSection({ acct }: { acct: AccountExt }) {
  const available = Math.max(acct.currentBalance, 0);
  const balanceAfterTopUp = acct.balanceAfterNextTransfer ?? acct.currentBalance;
  const spentCycle = acct.spentThisCycle ?? 0;
  const isOverspent = acct.currentBalance < 0;
  const rows = [
    { label: 'Available to spend', value: <CurrencyValue cents={available} /> },
    { label: 'Next top-up', value: acct.nextTransfer ? formatDate(acct.nextTransfer) : '—' },
    { label: 'Balance after top-up', value: <CurrencyValue cents={balanceAfterTopUp} /> },
    {
      label: isOverspent ? 'Overspent' : 'Spent this cycle',
      value: <CurrencyValue cents={isOverspent ? Math.abs(acct.currentBalance) : spentCycle} />,
    },
  ];
  return (
    <div className={classes.detailRows}>
      {rows.map((r) => (
        <div key={r.label} className={classes.detailRow}>
          <Text fz="xs" c="dimmed">
            {r.label}
          </Text>
          <Text fz="sm" ff="var(--mantine-font-family-monospace)">
            {r.value}
          </Text>
        </div>
      ))}
    </div>
  );
}

function CreditCardSection({ acct, typeColor }: { acct: AccountExt; typeColor: string }) {
  const limit = acct.spendLimit ?? 0;
  const hasLimit = limit > 0;
  const available = hasLimit ? limit - acct.currentBalance : 0;
  const usedPct = hasLimit ? Math.min(Math.round((acct.currentBalance / limit) * 100), 100) : 0;

  return (
    <>
      {hasLimit && (
        <div className={classes.limitSection}>
          <div className={classes.limitRow}>
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
              <CurrencyValue cents={available} /> available
            </Text>
            <Text fz="xs" c="dimmed" ff="var(--mantine-font-family-monospace)">
              <CurrencyValue cents={limit} /> limit
            </Text>
          </div>
          <Progress
            value={usedPct}
            size={8}
            radius="xl"
            color={typeColor}
            aria-label={`Credit used: ${usedPct}%`}
          />
        </div>
      )}
      {(acct.statementCloseDay || acct.paymentDueDay) && (
        <div className={classes.dateGrid}>
          {acct.statementCloseDay && (
            <DateBox label="Statement closes" day={acct.statementCloseDay} />
          )}
          {acct.paymentDueDay && <DateBox label="Payment due" day={acct.paymentDueDay} />}
        </div>
      )}
      <div className={classes.statsGrid}>
        <div className={classes.statBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            Next Payment
          </Text>
          <Text fz="md" fw={500} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={acct.currentBalance} />
          </Text>
        </div>
        <div className={classes.statBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            Transactions
          </Text>
          <Text fz="md" fw={500} ff="var(--mantine-font-family-monospace)">
            {acct.numberOfTransactions}
          </Text>
        </div>
      </div>
    </>
  );
}

function DateBox({ label, day }: { label: string; day: number }) {
  const now = new Date();
  const nextDate = getNextDateForDay(day, now);
  const daysUntil = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return (
    <div className={classes.dateBox}>
      <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
        {label}
      </Text>
      <Text fz="sm" fw={600}>
        {nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </Text>
      <Text fz="xs" c="dimmed">
        In {daysUntil} days
      </Text>
    </div>
  );
}

function getNextDateForDay(day: number, from: Date): Date {
  const thisMonth = new Date(from.getFullYear(), from.getMonth(), day);
  if (thisMonth > from) {
    return thisMonth;
  }
  return new Date(from.getFullYear(), from.getMonth() + 1, day);
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return daysUntil > 0 ? `${formatted} (in ${daysUntil} days)` : formatted;
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
