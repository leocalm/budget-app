import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart } from '@mantine/charts';
import { ActionIcon, Anchor, Badge, Button, Menu, Skeleton, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import {
  useAccountBalanceHistory,
  useAccountDetails,
  useArchiveAccount,
  useUnarchiveAccount,
} from '@/hooks/v2/useAccounts';
import { toast } from '@/lib/toast';
import { useV2Theme } from '@/theme/v2';
import type { AccountExt } from '../Dashboard/AccountCard.types';
import { formatDate } from '../Dashboard/AccountCardSections';
import { getAccountTypeColor, getAccountTypeLabel } from '../Dashboard/accountTypeColors';
import { AccountFormDrawer } from './AccountFormDrawer';
import classes from './Accounts.module.css';

interface AccountDetailProps {
  accountId: string;
  periodId: string;
}

export function AccountDetail({ accountId, periodId }: AccountDetailProps) {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useAccountDetails(accountId, periodId);
  const { data: history } = useAccountBalanceHistory(accountId, periodId);
  const { accents } = useV2Theme();
  const archiveMutation = useArchiveAccount();
  const unarchiveMutation = useUnarchiveAccount();
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  if (isLoading) {
    return <AccountDetailSkeleton />;
  }

  if (isError) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Anchor component={Link} to="/v2/accounts" fz="sm" c="var(--v2-primary)">
          ← Accounts
        </Anchor>
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
      </Stack>
    );
  }

  if (!data) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Anchor component={Link} to="/v2/accounts" fz="sm" c="var(--v2-primary)">
          ← Accounts
        </Anchor>
        <div className={classes.centeredState}>
          <Text fz="sm" c="dimmed">
            Account not found.
          </Text>
        </div>
      </Stack>
    );
  }

  const acct = data as AccountExt;
  const typeColor = getAccountTypeColor(acct.type, accents);
  const isArchived = acct.status === 'inactive';
  const changePrefix = acct.netChangeThisPeriod > 0 ? '+' : acct.netChangeThisPeriod < 0 ? '-' : '';

  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync(accountId);
      toast.success({ message: `${acct.name} archived` });
    } catch {
      toast.error({ message: 'Failed to archive account' });
    }
  };

  const handleUnarchive = async () => {
    try {
      await unarchiveMutation.mutateAsync(accountId);
      toast.success({ message: `${acct.name} unarchived` });
    } catch {
      toast.error({ message: 'Failed to unarchive account' });
    }
  };

  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      {/* Breadcrumb + actions */}
      <div className={classes.pageHeader}>
        <div>
          <Anchor fz="sm" c="var(--v2-primary)" onClick={() => navigate('/v2/accounts')}>
            ← Accounts
          </Anchor>
          <Text fz={24} fw={700} ff="var(--mantine-font-family-headings)" mt={4}>
            {acct.name}
          </Text>
          <Badge
            size="xs"
            variant="light"
            style={{ backgroundColor: `${typeColor}26`, color: typeColor }}
            mt={4}
          >
            {getAccountTypeLabel(acct.type)}
          </Badge>
        </div>

        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="lg">
              <Text fz="xl" lh={1}>
                ⋮
              </Text>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={openDrawer}>Edit</Menu.Item>
            {isArchived ? (
              <Menu.Item onClick={handleUnarchive}>Unarchive</Menu.Item>
            ) : (
              <Menu.Item color="red" onClick={handleArchive}>
                Archive
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </div>

      {/* Hero: balance */}
      <div className={classes.detailCard}>
        <Text fz={36} fw={700} lh={1} ff="var(--mantine-font-family-monospace)">
          <CurrencyValue cents={acct.currentBalance} />
        </Text>
        <Text fz="sm" c="dimmed" ff="var(--mantine-font-family-monospace)" mt={4}>
          <span>
            {changePrefix}
            <CurrencyValue cents={Math.abs(acct.netChangeThisPeriod)} />
          </span>{' '}
          this period
        </Text>
      </div>

      {/* Balance history chart — own card */}
      <div className={classes.detailCard}>
        <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="sm">
          Balance History
        </Text>
        <DetailSparkline history={history ?? undefined} acctName={acct.name} />
      </div>

      {/* Metrics grid */}
      <div className={classes.metricsGrid}>
        <div className={classes.metricBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            Inflows
          </Text>
          <Text fz="lg" fw={600} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={acct.inflow} />
          </Text>
        </div>
        <div className={classes.metricBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            Outflows
          </Text>
          <Text fz="lg" fw={600} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={acct.outflow} />
          </Text>
        </div>
        <div className={classes.metricBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            Transactions
          </Text>
          <Text fz="lg" fw={600} ff="var(--mantine-font-family-monospace)">
            {acct.numberOfTransactions}
          </Text>
        </div>
      </div>

      {/* Type-specific sections */}
      {acct.type === 'Checking' && <CheckingDetail acct={acct} />}
      {acct.type === 'Allowance' && <AllowanceDetail acct={acct} />}
      {acct.type === 'CreditCard' && <CreditCardDetail acct={acct} />}

      <AccountFormDrawer
        key={accountId}
        opened={drawerOpened}
        onClose={closeDrawer}
        editAccountId={accountId}
      />
    </Stack>
  );
}

function CheckingDetail({ acct }: { acct: AccountExt }) {
  return (
    <div className={classes.detailCard}>
      <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="sm">
        Checking Details
      </Text>
      <div className={classes.detailRows}>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            Avg Daily Balance
          </Text>
          <Text fz="sm" ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={acct.avgDailyBalance} />
          </Text>
        </div>
      </div>
    </div>
  );
}

function AllowanceDetail({ acct }: { acct: AccountExt }) {
  const available = Math.max(acct.currentBalance, 0);
  const balanceAfterTopUp = acct.balanceAfterNextTransfer ?? acct.currentBalance;

  return (
    <div className={classes.detailCard}>
      <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="sm">
        Allowance Details
      </Text>
      <div className={classes.detailRows}>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            Available
          </Text>
          <Text fz="sm" ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={available} />
          </Text>
        </div>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            Next top-up
          </Text>
          <Text fz="sm" ff="var(--mantine-font-family-monospace)">
            {acct.nextTransfer ? formatDate(acct.nextTransfer) : '—'}
          </Text>
        </div>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            After top-up
          </Text>
          <Text fz="sm" ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={balanceAfterTopUp} />
          </Text>
        </div>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            Spent this cycle
          </Text>
          <Text fz="sm" ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={acct.spentThisCycle} />
          </Text>
        </div>
        {acct.topUpAmount != null && acct.topUpAmount > 0 && (
          <div className={classes.detailRow}>
            <Text fz="sm" c="dimmed">
              Top-up amount
            </Text>
            <Text fz="sm" ff="var(--mantine-font-family-monospace)">
              <CurrencyValue cents={acct.topUpAmount} /> / {acct.topUpCycle ?? 'week'}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}

function CreditCardDetail({ acct }: { acct: AccountExt }) {
  return (
    <div className={classes.detailCard}>
      <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="sm">
        Credit Card Details
      </Text>
      {(acct.statementCloseDay != null || acct.paymentDueDay != null) && (
        <div className={classes.dateGrid} style={{ marginBottom: 'var(--mantine-spacing-sm)' }}>
          {acct.statementCloseDay != null && (
            <DateBox label="Statement closes" day={acct.statementCloseDay} />
          )}
          {acct.paymentDueDay != null && <DateBox label="Payment due" day={acct.paymentDueDay} />}
        </div>
      )}
      <div className={classes.detailRows}>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            Current balance
          </Text>
          <Text fz="sm" ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={acct.currentBalance} />
          </Text>
        </div>
        {acct.spendLimit != null && acct.spendLimit > 0 && (
          <div className={classes.detailRow}>
            <Text fz="sm" c="dimmed">
              Credit limit
            </Text>
            <Text fz="sm" ff="var(--mantine-font-family-monospace)">
              <CurrencyValue cents={acct.spendLimit} />
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}

function DateBox({ label, day }: { label: string; day: number }) {
  const { formatted, daysLabel } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const clamped = Math.min(day, lastDay);
    const thisMonth = new Date(year, month, clamped);
    const nextDate =
      thisMonth > now
        ? thisMonth
        : new Date(year, month + 1, Math.min(day, new Date(year, month + 2, 0).getDate()));
    const msUntil = nextDate.getTime() - new Date(year, now.getMonth(), now.getDate()).getTime();
    const daysUntil = Math.ceil(msUntil / (1000 * 60 * 60 * 24));
    return {
      formatted: nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      daysLabel: daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`,
    };
  }, [day]);

  return (
    <div className={classes.dateBox}>
      <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
        {label}
      </Text>
      <Text fz="sm" fw={600}>
        {formatted}
      </Text>
      <Text fz="xs" c="dimmed">
        {daysLabel}
      </Text>
    </div>
  );
}

type HistoryPoint = components['schemas']['AccountBalanceHistoryPoint'];

function DetailSparkline({ history, acctName }: { history?: HistoryPoint[]; acctName?: string }) {
  const { accents } = useV2Theme();

  if (!history || history.length < 2) {
    return (
      <Text fz="sm" c="dimmed" ta="center" py="xl">
        Not enough data to show a chart yet.
      </Text>
    );
  }

  const data = history.map((p) => ({ day: p.date, value: p.balance }));
  const label = acctName ? `Balance history for ${acctName}` : 'Balance history';

  return (
    <div data-testid="detail-sparkline" role="img" aria-label={label}>
      <AreaChart
        h={200}
        data={data}
        dataKey="day"
        series={[{ name: 'value', color: accents.tertiary }]}
        gridAxis="none"
        withXAxis={false}
        withYAxis={false}
        withDots={false}
        withTooltip={false}
        strokeWidth={1.5}
        fillOpacity={0.1}
        curveType="monotone"
      />
    </div>
  );
}

function AccountDetailSkeleton() {
  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      <Skeleton width={80} height={14} />
      <Skeleton width={200} height={28} />
      <div className={classes.detailCard}>
        <Skeleton width={180} height={36} mb={8} />
        <Skeleton width={120} height={14} />
      </div>
      <div className={classes.detailCard}>
        <Skeleton width={100} height={12} mb="sm" />
        <Skeleton height={200} radius="md" />
      </div>
      <div className={classes.metricsGrid}>
        <div className={classes.metricBox}>
          <Skeleton width={60} height={10} mb={4} />
          <Skeleton width={100} height={24} />
        </div>
        <div className={classes.metricBox}>
          <Skeleton width={60} height={10} mb={4} />
          <Skeleton width={100} height={24} />
        </div>
        <div className={classes.metricBox}>
          <Skeleton width={60} height={10} mb={4} />
          <Skeleton width={100} height={24} />
        </div>
      </div>
    </Stack>
  );
}
