import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Skeleton, Stack, Text, TextInput, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { EmptyState } from '@/components/Utils/EmptyState/EmptyState';
import { NoPeriodState } from '@/components/v2/NoPeriodState';
import { PageHint } from '@/components/v2/PageHint';
import { MergeVendorModal, VendorFormDrawer, VendorRow } from '@/components/v2/Vendors';
import classes from '@/components/v2/Vendors/Vendors.module.css';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useInfiniteScroll } from '@/hooks/v2/useInfiniteScroll';
import {
  useArchiveVendor,
  useDeleteVendor,
  useInfiniteVendors,
  useUnarchiveVendor,
  useVendorStats,
} from '@/hooks/v2/useVendors';
import { toast } from '@/lib/toast';

type VendorSummary = components['schemas']['VendorSummaryResponse'];

export function VendorsV2Page() {
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
  } = useInfiniteVendors(selectedPeriodId);
  const { data: stats } = useVendorStats(selectedPeriodId);
  const archiveMutation = useArchiveVendor();
  const unarchiveMutation = useUnarchiveVendor();
  const deleteMutation = useDeleteVendor();

  const loadMoreRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
  });

  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [mergeOpened, { open: openMerge, close: closeMerge }] = useDisclosure(false);
  const [editVendor, setEditVendor] = useState<VendorSummary | null>(null);
  const [mergeSourceId, setMergeSourceId] = useState('');
  const [mergeSourceName, setMergeSourceName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const vendors = infiniteData?.pages.flatMap((p) => p.data ?? []) ?? [];

  const { activeVendors, archivedVendors } = useMemo(() => {
    const active: VendorSummary[] = [];
    const archived: VendorSummary[] = [];
    const query = searchQuery.toLowerCase();

    for (const v of vendors) {
      if (query && !v.name.toLowerCase().includes(query)) {
        continue;
      }
      if (v.status === 'inactive') {
        archived.push(v);
      } else {
        active.push(v);
      }
    }

    // Sort active by totalSpend descending
    active.sort((a, b) => b.totalSpend - a.totalSpend);

    return { activeVendors: active, archivedVendors: archived };
  }, [vendors, searchQuery]);

  const handleCreate = () => {
    setEditVendor(null);
    openForm();
  };

  const handleEdit = (id: string) => {
    const v = vendors.find((x) => x.id === id);
    if (v) {
      setEditVendor(v);
      openForm();
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveMutation.mutateAsync(id);
      toast.success({ message: t('vendors.archived') });
    } catch {
      toast.error({ message: t('vendors.archiveFailed') });
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      await unarchiveMutation.mutateAsync(id);
      toast.success({ message: t('vendors.unarchived') });
    } catch {
      toast.error({ message: t('vendors.unarchiveFailed') });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success({ message: t('vendors.deleted') });
    } catch {
      toast.error({ message: t('vendors.deleteFailedShort') });
    }
  };

  const handleMerge = (id: string) => {
    const v = vendors.find((x) => x.id === id);
    if (v) {
      setMergeSourceId(v.id);
      setMergeSourceName(v.name);
      openMerge();
    }
  };

  if (!selectedPeriodId) {
    return <NoPeriodState pageTitle={t('vendors.title')} />;
  }

  if (isError) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <div className={classes.pageHeader}>
          <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
            {t('vendors.title')}
          </Text>
        </div>
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            {t('vendors.title')}
          </Text>
          <Text fz="sm" c="dimmed">
            {t('vendors.loadError')}
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
            <Skeleton width={120} height={28} />
            <Skeleton width={200} height={16} mt={4} />
          </div>
          <Skeleton width={120} height={32} radius="md" />
        </div>
        <Skeleton height={60} radius="md" />
        <Skeleton height={36} radius="md" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={classes.skeletonRow}>
            <Skeleton width={32} height={32} circle />
            <div style={{ flex: 1 }}>
              <Skeleton width={140} height={16} mb={4} />
              <Skeleton width={80} height={12} />
            </div>
            <Skeleton width={70} height={18} />
          </div>
        ))}
      </Stack>
    );
  }

  const hasVendors = vendors.length > 0;

  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      {/* Header */}
      <div className={classes.pageHeader}>
        <div>
          <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
            {t('vendors.title')}
          </Text>
          <Text c="dimmed" fz="sm">
            {t('vendors.subtitle')}
          </Text>
        </div>
        <Button data-testid="vendors-add-button" size="sm" onClick={handleCreate}>
          {t('vendors.addVendor')}
        </Button>
      </div>

      {/* Page hint */}
      <PageHint hintId="vendors" message={t('hints.vendors')} />

      {/* Empty state */}
      {!hasVendors && (
        <EmptyState
          icon="🏪"
          title={t('vendors.emptyTitle')}
          message={t('vendors.emptyDescription')}
          primaryAction={{ label: t('vendors.addFirstVendor'), onClick: handleCreate }}
          tips={[
            t('vendors.emptyTips.organize'),
            t('vendors.emptyTips.merge'),
            t('vendors.emptyTips.archive'),
          ]}
          onboardingSteps={[
            {
              title: t('vendors.emptySteps.create.title'),
              description: t('vendors.emptySteps.create.description'),
            },
            {
              title: t('vendors.emptySteps.link.title'),
              description: t('vendors.emptySteps.link.description'),
            },
            {
              title: t('vendors.emptySteps.track.title'),
              description: t('vendors.emptySteps.track.description'),
            },
          ]}
          data-testid="vendors-empty-state"
        />
      )}

      {hasVendors && (
        <>
          {/* Stats bar */}
          {stats && (
            <div className={classes.statsBar}>
              <div className={classes.statItem}>
                <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
                  {t('vendors.active')}
                </Text>
                <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
                  {stats.totalVendors}
                </Text>
              </div>
              <div className={classes.statItem}>
                <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
                  {t('vendors.totalSpent')}
                </Text>
                <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
                  <CurrencyValue cents={stats.totalSpendThisPeriod} />
                </Text>
              </div>
              <div className={classes.statItem}>
                <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
                  {t('vendors.avgPerVendor')}
                </Text>
                <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
                  <CurrencyValue cents={stats.avgSpendPerVendor} />
                </Text>
              </div>
            </div>
          )}

          {/* Search */}
          <TextInput
            placeholder={t('vendors.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />

          {/* Vendor list */}
          {activeVendors.map((vendor) => (
            <VendorRow
              key={vendor.id}
              vendor={vendor}
              onEdit={handleEdit}
              onArchive={handleArchive}
              onUnarchive={handleUnarchive}
              onDelete={handleDelete}
              onMerge={handleMerge}
            />
          ))}

          {activeVendors.length === 0 && searchQuery && (
            <Text fz="sm" c="dimmed" ta="center" py="xl">
              {t('vendors.noMatch', { query: searchQuery })}
            </Text>
          )}

          {/* Archived */}
          {archivedVendors.length > 0 && (
            <Stack gap="sm">
              <UnstyledButton onClick={() => setShowArchived((v) => !v)}>
                <Text fz="sm" fw={600} c="dimmed">
                  {showArchived ? '▾' : '▸'}{' '}
                  {t('vendors.archivedVendors', { count: archivedVendors.length })}
                </Text>
              </UnstyledButton>
              {showArchived &&
                archivedVendors.map((vendor) => (
                  <VendorRow
                    key={vendor.id}
                    vendor={vendor}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                    onUnarchive={handleUnarchive}
                    onDelete={handleDelete}
                    onMerge={handleMerge}
                  />
                ))}
            </Stack>
          )}
        </>
      )}

      {isFetchingNextPage && (
        <Stack gap="xs">
          <Skeleton height={54} radius="lg" />
          <Skeleton height={54} radius="lg" />
        </Stack>
      )}
      {hasNextPage && !isFetchingNextPage && <div ref={loadMoreRef} style={{ height: 1 }} />}

      <VendorFormDrawer
        key={editVendor?.id ?? 'create'}
        opened={formOpened}
        onClose={closeForm}
        editVendor={editVendor}
      />
      <MergeVendorModal
        opened={mergeOpened}
        onClose={closeMerge}
        sourceVendorId={mergeSourceId}
        sourceVendorName={mergeSourceName}
      />
    </Stack>
  );
}
