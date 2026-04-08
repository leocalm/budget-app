import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Skeleton, Stack, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { EmptyState } from '@/components/Utils/EmptyState/EmptyState';
import { AccountFormDrawer, AccountRow, AccountsNetPosition } from '@/components/v2/Accounts';
import classes from '@/components/v2/Accounts/Accounts.module.css';
import { NoPeriodState } from '@/components/v2/NoPeriodState';
import { PageHint } from '@/components/v2/PageHint';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import {
  useArchiveAccount,
  useInfiniteAccountsSummary,
  useUnarchiveAccount,
} from '@/hooks/v2/useAccounts';
import { useInfiniteScroll } from '@/hooks/v2/useInfiniteScroll';
import { toast } from '@/lib/toast';

type AccountSummary = components['schemas']['AccountSummaryResponse'];
type AccountType = AccountSummary['type'];

const TYPE_ORDER: AccountType[] = ['Checking', 'Allowance', 'Wallet', 'Savings', 'CreditCard'];

const TYPE_LABELS: Record<AccountType, string> = {
  Checking: 'accounts.types.checking',
  Allowance: 'accounts.types.allowance',
  Wallet: 'accounts.types.wallets',
  Savings: 'accounts.types.savings',
  CreditCard: 'accounts.types.creditCards',
};

export function AccountsV2Page() {
  const { t } = useTranslation('v2');
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const {
    data: infiniteData,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteAccountsSummary(selectedPeriodId);
  const archiveMutation = useArchiveAccount();
  const unarchiveMutation = useUnarchiveAccount();
  const loadMoreRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
  });
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [editAccountId, setEditAccountId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const accounts = infiniteData?.pages.flatMap((p) => p.data ?? []) ?? [];

  const { grouped, archivedAccounts, groupTotals } = useMemo(() => {
    const active: AccountSummary[] = [];
    const archived: AccountSummary[] = [];

    for (const acct of accounts) {
      if (acct.status === 'inactive') {
        archived.push(acct);
      } else {
        active.push(acct);
      }
    }

    const byType: Partial<Record<AccountType, AccountSummary[]>> = {};
    const totals: Partial<Record<AccountType, number>> = {};

    for (const acct of active) {
      if (!byType[acct.type]) {
        byType[acct.type] = [];
        totals[acct.type] = 0;
      }
      byType[acct.type]!.push(acct);
      totals[acct.type] = (totals[acct.type] ?? 0) + acct.currentBalance;
    }

    return { grouped: byType, archivedAccounts: archived, groupTotals: totals };
  }, [accounts]);

  const handleEdit = (id: string) => {
    setEditAccountId(id);
    openDrawer();
  };

  const handleCreate = () => {
    setEditAccountId(null);
    openDrawer();
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveMutation.mutateAsync(id);
      toast.success({ message: t('accounts.archived') });
    } catch {
      toast.error({ message: t('accounts.archiveFailed') });
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      await unarchiveMutation.mutateAsync(id);
      toast.success({ message: t('accounts.unarchived') });
    } catch {
      toast.error({ message: t('accounts.unarchiveFailed') });
    }
  };

  if (!selectedPeriodId) {
    return <NoPeriodState pageTitle={t('accounts.title')} />;
  }

  if (isError) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <div className={classes.pageHeader}>
          <div>
            <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
              Accounts
            </Text>
          </div>
        </div>
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            Accounts
          </Text>
          <Text fz="sm" c="dimmed">
            Something went wrong loading your accounts.
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      </Stack>
    );
  }

  if (isLoading) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <div className={classes.pageHeader}>
          <div>
            <Skeleton width={160} height={28} />
            <Skeleton width={220} height={16} mt={4} />
          </div>
          <Skeleton width={120} height={32} radius="md" />
        </div>
        <Skeleton height={120} radius="lg" />
        {[1, 2, 3].map((i) => (
          <Stack key={i} gap="sm">
            <Skeleton width={80} height={12} />
            <div className={classes.skeletonRow}>
              <Skeleton width={10} height={10} radius="xl" />
              <Skeleton width={160} height={16} />
              <div style={{ flex: 1 }} />
              <Skeleton width={100} height={36} radius="md" />
              <Skeleton width={80} height={20} />
            </div>
          </Stack>
        ))}
      </Stack>
    );
  }

  const hasAccounts = accounts.length > 0;
  const hasActiveAccounts = Object.keys(grouped).length > 0;

  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      {/* Header */}
      <div className={classes.pageHeader}>
        <div>
          <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
            {t('accounts.title')}
          </Text>
          <Text c="dimmed" fz="sm">
            {t('accounts.subtitle')}
          </Text>
        </div>
        <Button data-testid="accounts-add-button" size="sm" onClick={handleCreate}>
          {t('accounts.addAccount')}
        </Button>
      </div>

      {/* Page hint */}
      <PageHint hintId="accounts" message={t('hints.accounts')} />

      {/* Empty state */}
      {!hasAccounts && (
        <EmptyState
          icon="🏦"
          title={t('accounts.emptyTitle')}
          message={t('accounts.emptyDescription')}
          primaryAction={{ label: t('accounts.addFirstAccount'), onClick: handleCreate }}
          tips={[
            t('accounts.emptyTips.types'),
            t('accounts.emptyTips.balance'),
            t('accounts.emptyTips.archive'),
          ]}
          onboardingSteps={[
            {
              title: t('accounts.emptySteps.create.title'),
              description: t('accounts.emptySteps.create.description'),
            },
            {
              title: t('accounts.emptySteps.balance.title'),
              description: t('accounts.emptySteps.balance.description'),
            },
            {
              title: t('accounts.emptySteps.use.title'),
              description: t('accounts.emptySteps.use.description'),
            },
          ]}
          data-testid="accounts-empty-state"
        />
      )}

      {/* Net Position */}
      {hasActiveAccounts && <AccountsNetPosition periodId={selectedPeriodId} />}

      {/* Grouped accounts */}
      {TYPE_ORDER.map((type) => {
        const group = grouped[type];
        if (!group || group.length === 0) {
          return null;
        }

        return (
          <Stack key={type} gap="sm">
            <div className={classes.typeGroupHeader}>
              <Text fz="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.88px' }}>
                {t(TYPE_LABELS[type])}
              </Text>
              <Text fz="sm" c="dimmed" ff="var(--mantine-font-family-monospace)">
                <CurrencyLabel cents={groupTotals[type] ?? 0} isDebt={type === 'CreditCard'} />
              </Text>
            </div>
            {group.map((acct) => (
              <AccountRow
                key={acct.id}
                account={acct}
                periodId={selectedPeriodId}
                onEdit={handleEdit}
                onArchive={handleArchive}
                onUnarchive={handleUnarchive}
              />
            ))}
          </Stack>
        );
      })}

      {/* Archived */}
      {archivedAccounts.length > 0 && (
        <Stack gap="sm">
          <UnstyledButton
            className={classes.archivedToggle}
            onClick={() => setShowArchived((v) => !v)}
          >
            <Text fz="sm" fw={600} c="dimmed">
              {showArchived ? '▾' : '▸'}{' '}
              {t('accounts.archivedAccounts', { count: archivedAccounts.length })}
            </Text>
          </UnstyledButton>
          {showArchived &&
            archivedAccounts.map((acct) => (
              <AccountRow
                key={acct.id}
                account={acct}
                periodId={selectedPeriodId}
                onEdit={handleEdit}
                onArchive={handleArchive}
                onUnarchive={handleUnarchive}
              />
            ))}
        </Stack>
      )}

      {isFetchingNextPage && (
        <Stack gap="xs">
          <Skeleton height={54} radius="lg" />
          <Skeleton height={54} radius="lg" />
        </Stack>
      )}
      {hasNextPage && !isFetchingNextPage && <div ref={loadMoreRef} style={{ height: 1 }} />}

      <AccountFormDrawer
        key={editAccountId ?? 'create'}
        opened={drawerOpened}
        onClose={closeDrawer}
        editAccountId={editAccountId}
      />
    </Stack>
  );
}

function CurrencyLabel({ cents, isDebt }: { cents: number; isDebt?: boolean }) {
  return (
    <>
      {isDebt && cents > 0 ? '-' : ''}
      <CurrencyValue cents={Math.abs(cents)} />
    </>
  );
}
