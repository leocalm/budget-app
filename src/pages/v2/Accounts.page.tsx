import { useMemo, useState } from 'react';
import { Button, Skeleton, Stack, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { AccountFormDrawer, AccountRow, AccountsNetPosition } from '@/components/v2/Accounts';
import classes from '@/components/v2/Accounts/Accounts.module.css';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useAccountsSummary, useArchiveAccount, useUnarchiveAccount } from '@/hooks/v2/useAccounts';
import { toast } from '@/lib/toast';

type AccountSummary = components['schemas']['AccountSummaryResponse'];
type AccountType = AccountSummary['type'];

const TYPE_ORDER: AccountType[] = ['Checking', 'Allowance', 'Wallet', 'Savings', 'CreditCard'];

const TYPE_LABELS: Record<AccountType, string> = {
  Checking: 'Checking',
  Allowance: 'Allowance',
  Wallet: 'Wallets',
  Savings: 'Savings',
  CreditCard: 'Credit Cards',
};

export function AccountsV2Page() {
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const { data: summaryData, isLoading, isError, refetch } = useAccountsSummary(selectedPeriodId);
  const archiveMutation = useArchiveAccount();
  const unarchiveMutation = useUnarchiveAccount();
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [editAccountId, setEditAccountId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const accounts = summaryData?.data ?? [];

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
      toast.success({ message: 'Account archived' });
    } catch {
      toast.error({ message: 'Failed to archive account' });
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      await unarchiveMutation.mutateAsync(id);
      toast.success({ message: 'Account unarchived' });
    } catch {
      toast.error({ message: 'Failed to unarchive account' });
    }
  };

  if (!selectedPeriodId) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <div>
          <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
            Accounts
          </Text>
          <Text c="dimmed" fz="sm">
            No budget period selected. Please select a period to view your accounts.
          </Text>
        </div>
      </Stack>
    );
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
            Retry
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
            Accounts
          </Text>
          <Text c="dimmed" fz="sm">
            Your financial accounts at a glance
          </Text>
        </div>
        <Button size="sm" onClick={handleCreate}>
          + Add Account
        </Button>
      </div>

      {/* Empty state */}
      {!hasAccounts && (
        <div className={classes.centeredState}>
          <Text fz={32}>⍑</Text>
          <Text fz={18} fw={700} ff="var(--mantine-font-family-headings)">
            No accounts yet
          </Text>
          <Text fz="sm" c="dimmed" ta="center">
            Add your first account to start tracking balances. You can add checking, savings, credit
            cards, wallets, or allowance accounts.
          </Text>
          <Button size="sm" onClick={handleCreate}>
            + Add Your First Account
          </Button>
        </div>
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
                {TYPE_LABELS[type]}
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
              {showArchived ? '▾' : '▸'} Archived accounts ({archivedAccounts.length})
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
