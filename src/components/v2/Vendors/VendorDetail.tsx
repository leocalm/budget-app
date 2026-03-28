import { Link, useNavigate } from 'react-router-dom';
import { AreaChart } from '@mantine/charts';
import { ActionIcon, Anchor, Badge, Button, Menu, Skeleton, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import {
  useArchiveVendor,
  useDeleteVendor,
  useUnarchiveVendor,
  useVendorDetail,
} from '@/hooks/v2/useVendors';
import { toast } from '@/lib/toast';
import { useV2Theme } from '@/theme/v2';
import { MergeVendorModal } from './MergeVendorModal';
import { VendorFormDrawer } from './VendorFormDrawer';
import classes from './Vendors.module.css';

type VendorDetailData = components['schemas']['VendorDetailResponse'];

interface VendorDetailProps {
  vendorId: string;
  periodId: string;
}

export function VendorDetail({ vendorId, periodId }: VendorDetailProps) {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useVendorDetail(vendorId, periodId);
  const { accents } = useV2Theme();
  const archiveMutation = useArchiveVendor();
  const unarchiveMutation = useUnarchiveVendor();
  const deleteMutation = useDeleteVendor();
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [mergeOpened, { open: openMerge, close: closeMerge }] = useDisclosure(false);

  if (isLoading) {
    return <VendorDetailSkeleton />;
  }

  if (isError || !data) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Anchor component={Link} to="/v2/vendors" fz="sm" c="var(--v2-primary)">
          ← Vendors
        </Anchor>
        <div className={classes.centeredState}>
          <Text fz="sm" c="dimmed">
            {isError ? 'Something went wrong loading this vendor.' : 'Vendor not found.'}
          </Text>
          {isError && (
            <Button size="xs" variant="light" onClick={() => refetch()}>
              Retry
            </Button>
          )}
        </div>
      </Stack>
    );
  }

  const vendor = data as VendorDetailData;
  const isArchived = vendor.status === 'inactive';
  const initial = vendor.name.charAt(0).toUpperCase();

  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync(vendorId);
      toast.success({ message: `${vendor.name} archived` });
    } catch {
      toast.error({ message: 'Failed to archive vendor' });
    }
  };

  const handleUnarchive = async () => {
    try {
      await unarchiveMutation.mutateAsync(vendorId);
      toast.success({ message: `${vendor.name} unarchived` });
    } catch {
      toast.error({ message: 'Failed to unarchive vendor' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(vendorId);
      toast.success({ message: 'Vendor deleted' });
      navigate('/v2/vendors');
    } catch {
      toast.error({ message: 'Cannot delete vendor — archive or merge instead' });
    }
  };

  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      {/* Breadcrumb + actions */}
      <div className={classes.detailHeader}>
        <div>
          <Anchor component={Link} to="/v2/vendors" fz="sm" c="var(--v2-primary)">
            ← Vendors
          </Anchor>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <div className={classes.initialBadge}>
              <Text fz="sm" fw={700} c="dimmed">
                {initial}
              </Text>
            </div>
            <div>
              <Text fz={24} fw={700} ff="var(--mantine-font-family-headings)">
                {vendor.name}
              </Text>
              {vendor.description && (
                <Text fz="sm" c="dimmed">
                  {vendor.description}
                </Text>
              )}
            </div>
          </div>
        </div>

        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              aria-label={`Actions for ${vendor.name}`}
            >
              <Text fz="xl" lh={1}>
                ⋮
              </Text>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={openEdit}>Edit</Menu.Item>
            <Menu.Item onClick={openMerge}>Merge</Menu.Item>
            {isArchived ? (
              <Menu.Item onClick={handleUnarchive}>Unarchive</Menu.Item>
            ) : (
              <Menu.Item onClick={handleArchive}>Archive</Menu.Item>
            )}
            <Menu.Item color="red" onClick={handleDelete}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>

      {/* Metrics */}
      <div className={classes.metricsGrid}>
        <div className={classes.metricBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            Spent
          </Text>
          <Text fz="lg" fw={600} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={vendor.periodSpend} />
          </Text>
        </div>
        <div className={classes.metricBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            Transactions
          </Text>
          <Text fz="lg" fw={600} ff="var(--mantine-font-family-monospace)">
            {vendor.transactionCount}
          </Text>
        </div>
        <div className={classes.metricBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            Avg / Txn
          </Text>
          <Text fz="lg" fw={600} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={vendor.averageTransactionAmount} />
          </Text>
        </div>
      </div>

      {/* Spending trend chart */}
      {vendor.trend.length >= 2 && (
        <div className={classes.detailCard}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="sm">
            Spending at this vendor — Last {vendor.trend.length} Periods
          </Text>
          <AreaChart
            h={200}
            data={vendor.trend.map((t) => ({
              period: t.periodName,
              value: t.totalSpend,
            }))}
            dataKey="period"
            series={[{ name: 'value', color: accents.primary }]}
            gridAxis="none"
            withXAxis
            withYAxis={false}
            withDots={false}
            withTooltip={false}
            strokeWidth={1.5}
            fillOpacity={0.1}
            curveType="monotone"
          />
        </div>
      )}

      {/* Top categories */}
      {vendor.topCategories.length > 0 && (
        <div className={classes.detailCard}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="sm">
            Top Categories at This Vendor
          </Text>
          <div className={classes.categoryPills}>
            {vendor.topCategories.map((cat) => (
              <Badge key={cat.categoryId} size="md" variant="light" color="var(--v2-primary)">
                {cat.categoryName} · <CurrencyValue cents={cat.totalSpend} />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      {vendor.recentTransactions.length > 0 && (
        <div className={classes.detailCard}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="sm">
            Recent Transactions — {vendor.recentTransactions.length} shown
          </Text>
          {vendor.recentTransactions.map((txn) => (
            <div key={txn.id} className={classes.transactionRow}>
              <div>
                <Text fz="sm" fw={500}>
                  {txn.description}
                </Text>
                <Text fz="xs" c="dimmed">
                  {new Date(`${txn.date}T00:00:00`).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </div>
              <Text fz="sm" fw={600} ff="var(--mantine-font-family-monospace)">
                <CurrencyValue cents={txn.amount} />
              </Text>
            </div>
          ))}
        </div>
      )}

      <VendorFormDrawer opened={editOpened} onClose={closeEdit} editVendor={vendor} />
      <MergeVendorModal
        opened={mergeOpened}
        onClose={closeMerge}
        sourceVendorId={vendorId}
        sourceVendorName={vendor.name}
      />
    </Stack>
  );
}

function VendorDetailSkeleton() {
  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      <Skeleton width={80} height={14} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Skeleton width={32} height={32} circle />
        <Skeleton width={200} height={28} />
      </div>
      <div className={classes.metricsGrid}>
        <div className={classes.metricBox}>
          <Skeleton width={50} height={10} mb={4} />
          <Skeleton width={80} height={24} />
        </div>
        <div className={classes.metricBox}>
          <Skeleton width={50} height={10} mb={4} />
          <Skeleton width={80} height={24} />
        </div>
        <div className={classes.metricBox}>
          <Skeleton width={50} height={10} mb={4} />
          <Skeleton width={80} height={24} />
        </div>
      </div>
      <div className={classes.detailCard}>
        <Skeleton width={200} height={12} mb="sm" />
        <Skeleton height={200} radius="md" />
      </div>
    </Stack>
  );
}
