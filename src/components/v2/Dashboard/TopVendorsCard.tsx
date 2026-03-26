import { Button, Skeleton, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import classes from './TopVendorsCard.module.css';

interface TopVendorItem {
  vendorId: string;
  vendorName: string;
  totalSpent: number;
  transactionCount: number;
}

interface TopVendorsCardProps {
  periodId: string;
}

/**
 * Hook placeholder — will be replaced with useDashboardTopVendors.
 */
function useTopVendorsData(_periodId: string): {
  data: TopVendorItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  // TODO: Replace with real hook when GET /dashboard/top-vendors is implemented
  return { data: undefined, isLoading: true, isError: false, refetch: () => {} };
}

export function TopVendorsCard({ periodId }: TopVendorsCardProps) {
  const { data, isLoading, isError, refetch } = useTopVendorsData(periodId);

  if (isLoading) {
    return <TopVendorsCardSkeleton />;
  }

  if (isError) {
    return (
      <div className={classes.card}>
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            Top Vendors
          </Text>
          <Text fz="sm" c="dimmed">
            Something went wrong loading your top vendors.
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={classes.card}>
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            Top Vendors
          </Text>
          <Text fz="sm" c="dimmed">
            No vendor transactions this period.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.card} data-testid="top-vendors-card">
      <div className={classes.header}>
        <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
          Top Vendors
        </Text>
      </div>

      <div className={classes.vendorList}>
        {data.map((vendor) => (
          <div key={vendor.vendorId} className={classes.vendorRow}>
            <div className={classes.vendorLeft}>
              <Text fz="sm" fw={500} truncate>
                {vendor.vendorName}
              </Text>
              <Text fz="xs" c="dimmed">
                {vendor.transactionCount} txns
              </Text>
            </div>
            <div className={classes.vendorRight}>
              <Text fz="sm" fw={500} ff="var(--mantine-font-family-monospace)">
                <CurrencyValue cents={vendor.totalSpent} />
              </Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopVendorsCardSkeleton() {
  return (
    <div className={classes.card} data-testid="top-vendors-card-loading">
      <Skeleton width={80} height={12} mb="sm" />
      <Stack gap="xs">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={classes.vendorRow}>
            <div className={classes.vendorLeft}>
              <Skeleton width={100} height={14} />
              <Skeleton width={50} height={10} />
            </div>
            <Skeleton width={60} height={14} />
          </div>
        ))}
      </Stack>
    </div>
  );
}
