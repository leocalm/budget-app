import { Link } from 'react-router-dom';
import { Anchor, Button, Skeleton, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useTransactions } from '@/hooks/v2/useTransactions';
import classes from './RecentTransactionsCard.module.css';

interface RecentTransactionsCardProps {
  periodId: string;
}

export function RecentTransactionsCard({ periodId }: RecentTransactionsCardProps) {
  const { data, isLoading, isError, refetch } = useTransactions({
    periodId,
    limit: 7,
  });

  if (isLoading) {
    return <RecentTransactionsCardSkeleton />;
  }

  if (isError) {
    return (
      <div className={classes.card}>
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            Recent Transactions
          </Text>
          <Text fz="sm" c="dimmed">
            Something went wrong loading your transactions.
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const transactions = data?.data ?? [];

  if (transactions.length === 0) {
    return (
      <div className={classes.card}>
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            Recent Transactions
          </Text>
          <Text fz="sm" c="dimmed">
            No transactions this period yet.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.card} data-testid="recent-transactions-card">
      <div className={classes.header}>
        <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
          Recent Transactions
        </Text>
        <Text fz="xs" c="dimmed">
          This period
        </Text>
      </div>

      <div className={classes.txList}>
        {transactions.map((tx) => (
          <div key={tx.id} className={classes.txRow}>
            <div className={classes.txLeft}>
              <Text fz="sm" fw={500} truncate>
                {tx.vendor?.name ?? tx.description}
              </Text>
              <Text fz="xs" c="dimmed" truncate>
                {tx.category?.name}
                {tx.fromAccount?.name ? ` · ${tx.fromAccount.name}` : ''}
              </Text>
            </div>
            <div className={classes.txRight}>
              <Text fz="sm" fw={500} ff="var(--mantine-font-family-monospace)">
                {tx.transactionType === 'regular' ? '-' : ''}
                <CurrencyValue cents={tx.amount} />
              </Text>
              <Text fz="xs" c="dimmed">
                {formatTxDate(tx.date)}
              </Text>
            </div>
          </div>
        ))}
      </div>

      <div className={classes.viewAll}>
        <Anchor component={Link} to="/v2/transactions" fz="sm" c="var(--v2-primary)">
          View all transactions
        </Anchor>
      </div>
    </div>
  );
}

function formatTxDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function RecentTransactionsCardSkeleton() {
  return (
    <div className={classes.card} data-testid="recent-transactions-card-loading">
      <div className={classes.header}>
        <Skeleton width={140} height={12} />
        <Skeleton width={60} height={12} />
      </div>
      <Stack gap="sm">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={classes.txRow}>
            <div className={classes.txLeft}>
              <Skeleton width={120} height={14} />
              <Skeleton width={80} height={10} />
            </div>
            <div className={classes.txRight}>
              <Skeleton width={60} height={14} />
              <Skeleton width={40} height={10} />
            </div>
          </div>
        ))}
      </Stack>
    </div>
  );
}
