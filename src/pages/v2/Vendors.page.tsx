import { useMemo, useState } from 'react';
import { Alert, Button, Skeleton, Stack, Text, TextInput, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { MergeVendorModal, VendorFormDrawer, VendorRow } from '@/components/v2/Vendors';
import classes from '@/components/v2/Vendors/Vendors.module.css';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import {
  useArchiveVendor,
  useDeleteVendor,
  useUnarchiveVendor,
  useVendors,
  useVendorStats,
} from '@/hooks/v2/useVendors';
import { toast } from '@/lib/toast';

type VendorSummary = components['schemas']['VendorSummaryResponse'];

export function VendorsV2Page() {
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const { data: vendorsData, isLoading, isError, refetch } = useVendors({ limit: 200 });
  const { data: stats } = useVendorStats(selectedPeriodId);
  const archiveMutation = useArchiveVendor();
  const unarchiveMutation = useUnarchiveVendor();
  const deleteMutation = useDeleteVendor();

  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [mergeOpened, { open: openMerge, close: closeMerge }] = useDisclosure(false);
  const [editVendor, setEditVendor] = useState<VendorSummary | null>(null);
  const [mergeSourceId, setMergeSourceId] = useState('');
  const [mergeSourceName, setMergeSourceName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const vendors = vendorsData?.data ?? [];

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
      toast.success({ message: 'Vendor archived' });
    } catch {
      toast.error({ message: 'Failed to archive vendor' });
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      await unarchiveMutation.mutateAsync(id);
      toast.success({ message: 'Vendor unarchived' });
    } catch {
      toast.error({ message: 'Failed to unarchive vendor' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success({ message: 'Vendor deleted' });
    } catch {
      toast.error({ message: 'Cannot delete — archive or merge instead' });
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

  if (isError) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <div className={classes.pageHeader}>
          <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
            Vendors
          </Text>
        </div>
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            Vendors
          </Text>
          <Text fz="sm" c="dimmed">
            Something went wrong loading your vendors.
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
            Vendors
          </Text>
          <Text c="dimmed" fz="sm">
            Where your money goes
          </Text>
        </div>
        <Button size="sm" onClick={handleCreate}>
          + Add Vendor
        </Button>
      </div>

      {/* Empty state */}
      {!hasVendors && (
        <div className={classes.centeredState}>
          <Text fz={32}>🏪</Text>
          <Text fz={18} fw={700} ff="var(--mantine-font-family-headings)">
            No vendors yet
          </Text>
          <Text fz="sm" c="dimmed" ta="center">
            Vendors help you track where your money goes. Add your first vendor to start
            categorizing spending.
          </Text>
          <Button size="sm" onClick={handleCreate}>
            + Add Your First Vendor
          </Button>
        </div>
      )}

      {hasVendors && (
        <>
          {/* Stats bar */}
          {stats && (
            <div className={classes.statsBar}>
              <div className={classes.statItem}>
                <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
                  Active
                </Text>
                <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
                  {stats.totalVendors}
                </Text>
              </div>
              <div className={classes.statItem}>
                <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
                  Total Spent
                </Text>
                <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
                  <CurrencyValue cents={stats.totalSpendThisPeriod} />
                </Text>
              </div>
              <div className={classes.statItem}>
                <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
                  Avg / Vendor
                </Text>
                <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
                  <CurrencyValue cents={stats.avgSpendPerVendor} />
                </Text>
              </div>
            </div>
          )}

          {/* Search */}
          <TextInput
            placeholder="Search vendors..."
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
              No vendors match &ldquo;{searchQuery}&rdquo;
            </Text>
          )}

          {/* Archived */}
          {archivedVendors.length > 0 && (
            <Stack gap="sm">
              <UnstyledButton onClick={() => setShowArchived((v) => !v)}>
                <Text fz="sm" fw={600} c="dimmed">
                  {showArchived ? '▾' : '▸'} Archived vendors ({archivedVendors.length})
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

      {vendorsData?.hasMore && (
        <Alert variant="light" color="yellow" mt="xs">
          Showing {vendors.length} of {vendorsData.totalCount} vendors. Some vendors are not
          displayed.
        </Alert>
      )}

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
