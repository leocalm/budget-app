import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Button,
  CloseButton,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { EmptyState } from '@/components/Utils/EmptyState/EmptyState';
import { NoPeriodState } from '@/components/v2/NoPeriodState';
import { PageHint } from '@/components/v2/PageHint';
import { QuickAdd, TransactionFormDrawer, TransactionRow } from '@/components/v2/Transactions';
import classes from '@/components/v2/Transactions/Transactions.module.css';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useAccountsOptions } from '@/hooks/v2/useAccounts';
import { useCategoriesOptions } from '@/hooks/v2/useCategories';
import { useInfiniteScroll } from '@/hooks/v2/useInfiniteScroll';
import { useDeleteTransaction, useInfiniteTransactions } from '@/hooks/v2/useTransactions';
import { useVendorsOptions } from '@/hooks/v2/useVendors';
import { toast } from '@/lib/toast';

type TransactionResponse = components['schemas']['TransactionResponse'];
type Direction = 'income' | 'expense' | 'transfer';

interface DateGroup {
  date: string;
  label: string;
  transactions: TransactionResponse[];
  total: number;
}

export function TransactionsV2Page() {
  const { t } = useTranslation('v2');
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const deleteMutation = useDeleteTransaction();
  const { data: categoryOptions } = useCategoriesOptions();
  const { data: accountOptions } = useAccountsOptions();
  const { data: vendorOptions } = useVendorsOptions();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
  const [direction, setDirection] = useState<Direction | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [editTxn, setEditTxn] = useState<TransactionResponse | null>(null);

  const filters = useMemo(
    () => ({
      periodId: selectedPeriodId ?? '',
      direction: direction ?? undefined,
      categoryId: categoryId ?? undefined,
      accountId: accountId ?? undefined,
      vendorId: vendorId ?? undefined,
      search: debouncedSearch || undefined,
    }),
    [selectedPeriodId, direction, categoryId, accountId, vendorId, debouncedSearch]
  );

  const {
    data: infiniteData,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTransactions(filters);

  const loadMoreRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
  });

  // Flatten pages + group by date
  const apiTotalCount = infiniteData?.pages[0]?.totalCount ?? 0;

  const { dateGroups, totalInflows, totalOutflows } = useMemo(() => {
    const allTxns = infiniteData?.pages.flatMap((p) => p.data ?? []) ?? [];
    let inflows = 0;
    let outflows = 0;

    const groupMap = new Map<string, TransactionResponse[]>();
    for (const txn of allTxns) {
      const key = txn.date;
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(txn);

      // Skip transfers — they don't affect inflow/outflow totals
      if (txn.transactionType === 'transfer') {
        continue;
      }
      if (txn.category.type === 'income') {
        inflows += txn.amount;
      } else if (txn.category.type === 'expense') {
        outflows += txn.amount;
      }
    }

    const groups: DateGroup[] = Array.from(groupMap.entries()).map(([dateStr, txns]) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const label = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const total = txns.reduce((sum, t) => {
        if (t.transactionType === 'transfer') {
          return sum;
        }
        if (t.category.type === 'income') {
          return sum + t.amount;
        }
        if (t.category.type === 'expense') {
          return sum - t.amount;
        }
        return sum;
      }, 0);

      return { date: dateStr, label, transactions: txns, total };
    });

    groups.sort((a, b) => b.date.localeCompare(a.date));

    return {
      dateGroups: groups,
      totalInflows: inflows,
      totalOutflows: outflows,
    };
  }, [infiniteData]);

  const handleEdit = (txn: TransactionResponse) => {
    setEditTxn(txn);
    setDrawerOpened(true);
  };

  const handleCreate = () => {
    setEditTxn(null);
    setDrawerOpened(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success({ message: t('transactions.deleted') });
    } catch {
      toast.error({ message: t('transactions.deleteFailed') });
    }
  };

  const hasActiveFilters = direction || categoryId || accountId || vendorId;

  const catSelectData = (categoryOptions ?? []).map((c) => ({
    value: c.id,
    label: `${c.icon} ${c.name}`,
  }));
  const acctSelectData = (accountOptions ?? []).map((a) => ({ value: a.id, label: a.name }));
  const vendorSelectData = (vendorOptions ?? []).map((v) => ({ value: v.id, label: v.name }));

  if (!selectedPeriodId) {
    return <NoPeriodState pageTitle={t('transactions.title')} />;
  }

  if (isError) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
          {t('transactions.title')}
        </Text>
        <div className={classes.centeredState}>
          <Text fz="sm" c="dimmed">
            {t('transactions.loadError')}
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      </Stack>
    );
  }

  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      {/* Header */}
      <div className={classes.pageHeader}>
        <div>
          <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
            {t('transactions.title')}
          </Text>
          <Text c="dimmed" fz="sm">
            {t('transactions.subtitle', { count: apiTotalCount })}
          </Text>
        </div>
        <Button data-testid="transactions-add-button" size="sm" onClick={handleCreate}>
          {t('transactions.addTransaction')}
        </Button>
      </div>

      {/* Search + direction + filter dropdowns */}
      <div className={classes.filtersRow}>
        <div className={classes.searchInput}>
          <TextInput
            placeholder={t('transactions.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            size="sm"
          />
        </div>
        <div className={classes.directionFilters}>
          {(['all', 'income', 'expense', 'transfer'] as const).map((d) => (
            <UnstyledButton
              key={d}
              className={
                (d === 'all' && !direction) || d === direction
                  ? classes.directionButtonActive
                  : classes.directionButton
              }
              onClick={() => setDirection(d === 'all' ? null : d)}
            >
              <Text fz="xs" fw={500}>
                {d === 'all'
                  ? t('transactions.directionAll')
                  : d === 'income'
                    ? t('transactions.directionIn')
                    : d === 'expense'
                      ? t('transactions.directionOut')
                      : t('transactions.directionTransfer')}
              </Text>
            </UnstyledButton>
          ))}
        </div>
        <Select
          placeholder="Category"
          size="xs"
          data={catSelectData}
          value={categoryId}
          onChange={setCategoryId}
          searchable
          clearable
          style={{ width: 140 }}
        />
        <Select
          placeholder="Account"
          size="xs"
          data={acctSelectData}
          value={accountId}
          onChange={setAccountId}
          searchable
          clearable
          style={{ width: 140 }}
        />
        <Select
          placeholder="Vendor"
          size="xs"
          data={vendorSelectData}
          value={vendorId}
          onChange={setVendorId}
          searchable
          clearable
          style={{ width: 120 }}
        />
      </div>

      {/* Applied filter pills */}
      {hasActiveFilters && (
        <div className={classes.filterPills}>
          {direction && (
            <Badge
              size="sm"
              variant="light"
              rightSection={<CloseButton size="xs" onClick={() => setDirection(null)} />}
            >
              {direction}
            </Badge>
          )}
          {categoryId && (
            <Badge
              size="sm"
              variant="light"
              rightSection={<CloseButton size="xs" onClick={() => setCategoryId(null)} />}
            >
              {catSelectData.find((c) => c.value === categoryId)?.label ?? 'Category'}
            </Badge>
          )}
          {accountId && (
            <Badge
              size="sm"
              variant="light"
              rightSection={<CloseButton size="xs" onClick={() => setAccountId(null)} />}
            >
              {acctSelectData.find((a) => a.value === accountId)?.label ?? 'Account'}
            </Badge>
          )}
          {vendorId && (
            <Badge
              size="sm"
              variant="light"
              rightSection={<CloseButton size="xs" onClick={() => setVendorId(null)} />}
            >
              {vendorSelectData.find((v) => v.value === vendorId)?.label ?? 'Vendor'}
            </Badge>
          )}
        </div>
      )}

      {/* Stats */}
      <div className={classes.statsBar}>
        <div className={classes.statItem}>
          <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
            {t('transactions.inflows')}
          </Text>
          <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={totalInflows} />
          </Text>
        </div>
        <div className={classes.statItem}>
          <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
            {t('transactions.outflows')}
          </Text>
          <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={totalOutflows} />
          </Text>
        </div>
        <div className={classes.statItem}>
          <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
            {t('transactions.net')}
          </Text>
          <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
            {totalInflows - totalOutflows >= 0 ? '+' : ''}
            <CurrencyValue cents={totalInflows - totalOutflows} />
          </Text>
        </div>
        <div className={classes.statItem}>
          <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
            {t('transactions.transactionsCount')}
          </Text>
          <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
            {apiTotalCount}
          </Text>
        </div>
      </div>

      {/* Quick add */}
      <QuickAdd />

      {/* Loading state */}
      {isLoading && (
        <Stack gap="sm">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={54} radius="lg" />
          ))}
        </Stack>
      )}

      {/* Page hint */}
      <PageHint hintId="transactions" message={t('hints.transactions')} />

      {/* Empty state */}
      {!isLoading && dateGroups.length === 0 && (
        <EmptyState
          icon="📝"
          title={t('transactions.emptyTitle')}
          message={
            debouncedSearch || hasActiveFilters
              ? t('transactions.emptyFilterDescription')
              : t('transactions.emptyDescription')
          }
          primaryAction={
            !debouncedSearch && !hasActiveFilters
              ? { label: t('transactions.addFirstTransaction'), onClick: handleCreate }
              : undefined
          }
          tips={
            !debouncedSearch && !hasActiveFilters
              ? [
                  t('transactions.emptyTips.quickAdd'),
                  t('transactions.emptyTips.categorize'),
                  t('transactions.emptyTips.filters'),
                ]
              : undefined
          }
          onboardingSteps={
            !debouncedSearch && !hasActiveFilters
              ? [
                  {
                    title: t('transactions.emptySteps.add.title'),
                    description: t('transactions.emptySteps.add.description'),
                  },
                  {
                    title: t('transactions.emptySteps.categorize.title'),
                    description: t('transactions.emptySteps.categorize.description'),
                  },
                  {
                    title: t('transactions.emptySteps.review.title'),
                    description: t('transactions.emptySteps.review.description'),
                  },
                ]
              : undefined
          }
          data-testid="transactions-empty-state"
        />
      )}

      {/* Date-grouped transactions */}
      {dateGroups.map((group) => (
        <Stack key={group.date} gap="xs">
          <div className={classes.dateGroupHeader}>
            <Text fz="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.88px' }}>
              {group.label}
            </Text>
            <Text fz="xs" c="dimmed" ff="var(--mantine-font-family-monospace)">
              {t('transactions.dateGroupCount', { count: group.transactions.length })} ·{' '}
              {group.total >= 0 ? '+' : ''}
              <CurrencyValue cents={group.total} />
            </Text>
          </div>
          {group.transactions.map((txn) => (
            <TransactionRow
              key={txn.id}
              transaction={txn}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </Stack>
      ))}

      {/* Loading more */}
      {isFetchingNextPage && (
        <Stack gap="xs">
          <Skeleton height={54} radius="lg" />
          <Skeleton height={54} radius="lg" />
        </Stack>
      )}

      {/* Infinite scroll sentinel — placed after skeletons to avoid re-trigger */}
      {hasNextPage && !isFetchingNextPage && <div ref={loadMoreRef} style={{ height: 1 }} />}

      <TransactionFormDrawer
        key={editTxn?.id ?? 'create'}
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        editTransaction={editTxn}
      />
    </Stack>
  );
}
