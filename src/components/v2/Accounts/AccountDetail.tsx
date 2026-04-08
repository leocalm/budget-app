import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('v2');
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
        <Anchor component={Link} to="/accounts" fz="sm" c="var(--v2-primary)">
          {t('accounts.breadcrumb')}
        </Anchor>
        <div className={classes.centeredState}>
          <Text fz="sm" fw={600}>
            {t('accounts.title')}
          </Text>
          <Text fz="sm" c="dimmed">
            {t('accounts.loadError')}
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      </Stack>
    );
  }

  if (!data) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Anchor component={Link} to="/accounts" fz="sm" c="var(--v2-primary)">
          {t('accounts.breadcrumb')}
        </Anchor>
        <div className={classes.centeredState}>
          <Text fz="sm" c="dimmed">
            {t('accounts.notFound')}
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
      toast.success({ message: t('accounts.archivedNamed', { name: acct.name }) });
    } catch {
      toast.error({ message: t('accounts.archiveFailed') });
    }
  };

  const handleUnarchive = async () => {
    try {
      await unarchiveMutation.mutateAsync(accountId);
      toast.success({ message: t('accounts.unarchivedNamed', { name: acct.name }) });
    } catch {
      toast.error({ message: t('accounts.unarchiveFailed') });
    }
  };

  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      {/* Breadcrumb + actions */}
      <div className={classes.pageHeader}>
        <div>
          <Anchor fz="sm" c="var(--v2-primary)" onClick={() => navigate('/accounts')}>
            {t('accounts.breadcrumb')}
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
            <Menu.Item onClick={openDrawer}>{t('common.edit')}</Menu.Item>
            {isArchived ? (
              <Menu.Item onClick={handleUnarchive}>{t('common.unarchive')}</Menu.Item>
            ) : (
              <Menu.Item color="red" onClick={handleArchive}>
                {t('common.archive')}
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
          {t('common.thisPeriod')}
        </Text>
      </div>

      {/* Balance history chart — own card */}
      <div className={classes.detailCard}>
        <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="sm">
          {t('accounts.balanceHistory')}
        </Text>
        <DetailSparkline history={history ?? undefined} acctName={acct.name} />
      </div>

      {/* Metrics grid */}
      <div className={classes.metricsGrid}>
        <div className={classes.metricBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            {t('accounts.inflows')}
          </Text>
          <Text fz="lg" fw={600} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={acct.inflow} />
          </Text>
        </div>
        <div className={classes.metricBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            {t('accounts.outflows')}
          </Text>
          <Text fz="lg" fw={600} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={acct.outflow} />
          </Text>
        </div>
        <div className={classes.metricBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            {t('accounts.transactions')}
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
  const { t } = useTranslation('v2');
  return (
    <div className={classes.detailCard}>
      <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="sm">
        {t('accounts.checkingDetails')}
      </Text>
      <div className={classes.detailRows}>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            {t('accounts.avgDailyBalance')}
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
  const { t } = useTranslation('v2');
  const available = Math.max(acct.currentBalance, 0);
  const balanceAfterTopUp = acct.balanceAfterNextTransfer ?? acct.currentBalance;

  return (
    <div className={classes.detailCard}>
      <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="sm">
        {t('accounts.allowanceDetails')}
      </Text>
      <div className={classes.detailRows}>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            {t('accounts.availableLabel')}
          </Text>
          <Text fz="sm" ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={available} />
          </Text>
        </div>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            {t('accounts.nextTopUpLabel')}
          </Text>
          <Text fz="sm" ff="var(--mantine-font-family-monospace)">
            {acct.nextTransfer ? formatDate(acct.nextTransfer, t) : '—'}
          </Text>
        </div>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            {t('accounts.afterTopUpLabel')}
          </Text>
          <Text fz="sm" ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={balanceAfterTopUp} />
          </Text>
        </div>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            {t('accounts.spentThisCycle')}
          </Text>
          <Text fz="sm" ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={acct.spentThisCycle} />
          </Text>
        </div>
        {acct.topUpAmount != null && acct.topUpAmount > 0 && (
          <div className={classes.detailRow}>
            <Text fz="sm" c="dimmed">
              {t('accounts.topUpAmount')}
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
  const { t } = useTranslation('v2');
  return (
    <div className={classes.detailCard}>
      <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="sm">
        {t('accounts.creditCardDetails')}
      </Text>
      {(acct.statementCloseDay != null || acct.paymentDueDay != null) && (
        <div className={classes.dateGrid} style={{ marginBottom: 'var(--mantine-spacing-sm)' }}>
          {acct.statementCloseDay != null && (
            <DateBox label={t('accounts.statementCloses')} day={acct.statementCloseDay} />
          )}
          {acct.paymentDueDay != null && (
            <DateBox label={t('accounts.paymentDue')} day={acct.paymentDueDay} />
          )}
        </div>
      )}
      <div className={classes.detailRows}>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            {t('accounts.currentBalance')}
          </Text>
          <Text fz="sm" ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={acct.currentBalance} />
          </Text>
        </div>
        {acct.spendLimit != null && acct.spendLimit > 0 && (
          <div className={classes.detailRow}>
            <Text fz="sm" c="dimmed">
              {t('accounts.creditLimit')}
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
  const { t } = useTranslation('v2');
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
      daysLabel:
        daysUntil === 0
          ? t('common.today')
          : daysUntil === 1
            ? t('common.tomorrow')
            : t('common.inDays', { count: daysUntil }),
    };
  }, [day, t]);

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
  const { t } = useTranslation('v2');
  const { accents } = useV2Theme();

  if (!history || history.length < 2) {
    return (
      <Text fz="sm" c="dimmed" ta="center" py="xl">
        {t('accounts.notEnoughData')}
      </Text>
    );
  }

  const data = history.map((p) => ({ day: p.date, value: p.balance }));
  const label = acctName
    ? t('accounts.balanceHistoryFor', { name: acctName })
    : t('accounts.balanceHistoryLabel');

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
