import { useNavigate } from 'react-router-dom';
import { ActionIcon, Anchor, Badge, Button, Menu, Skeleton, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import {
  useAccountBalanceHistory,
  useAccountDetails,
  useArchiveAccount,
  useUnarchiveAccount,
} from '@/hooks/v2/useAccounts';
import { useV2Theme } from '@/theme/v2';
import type { AccountExt } from '../Dashboard/AccountCard.types';
import { formatDate } from '../Dashboard/AccountCardSections';
import { AccountSparkline } from '../Dashboard/AccountSparkline';
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
        <Anchor fz="sm" c="var(--v2-primary)" onClick={() => navigate('/v2/accounts')}>
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
        <Anchor fz="sm" c="var(--v2-primary)" onClick={() => navigate('/v2/accounts')}>
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
    await archiveMutation.mutateAsync(accountId);
  };

  const handleUnarchive = async () => {
    await unarchiveMutation.mutateAsync(accountId);
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

      {/* Hero: balance + sparkline */}
      <div className={classes.detailCard}>
        <div className={classes.detailHeroRow}>
          <div className={classes.detailHeroLeft}>
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
          <div className={classes.detailSparkline}>
            <AccountSparkline history={history ?? undefined} acctName={acct.name} />
          </div>
        </div>
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

      <AccountFormDrawer opened={drawerOpened} onClose={closeDrawer} editAccountId={accountId} />
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
  const formatted = nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const daysLabel =
    daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;

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

function AccountDetailSkeleton() {
  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      <Skeleton width={80} height={14} />
      <Skeleton width={200} height={28} />
      <div className={classes.detailCard}>
        <Stack gap="sm">
          <Skeleton width={180} height={36} />
          <Skeleton width={120} height={14} />
          <Skeleton height={56} radius="md" />
        </Stack>
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
