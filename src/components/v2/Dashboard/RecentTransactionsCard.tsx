import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Anchor, Button, Skeleton, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useTransactions } from '@/hooks/v2/useTransactions';
import classes from './RecentTransactionsCard.module.css';

interface RecentTransactionsCardProps {
  periodId: string;
}

export function RecentTransactionsCard({ periodId }: RecentTransactionsCardProps) {
  const { t } = useTranslation('v2');
  const { data, isLoading, isError, refetch } = useTransactions({
    periodId,
    limit: 7,
  });

  if (isLoading) {
    return <RecentTransactionsCardSkeleton />;
  }

  if (isError) {
    return (
      <div className={classes.card} data-testid="recent-transactions-card-error">
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            {t('dashboard.recentTransactions.title')}
          </Text>
          <Text fz="sm" c="dimmed">
            {t('dashboard.recentTransactions.error')}
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  const transactions = data?.data ?? [];

  if (transactions.length === 0) {
    return (
      <div className={classes.card} data-testid="recent-transactions-card-empty">
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            {t('dashboard.recentTransactions.title')}
          </Text>
          <Text fz="sm" c="dimmed">
            {t('dashboard.recentTransactions.empty')}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.card} data-testid="recent-transactions-card">
      <div className={classes.header}>
        <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
          {t('dashboard.recentTransactions.title')}
        </Text>
        <Text fz="xs" c="dimmed">
          {t('dashboard.recentTransactions.thisPeriod')}
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
                {tx.category.type === 'expense' ? '-' : tx.category.type === 'income' ? '+' : ''}
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
        <Anchor component={Link} to="/transactions" fz="sm" c="var(--v2-primary)">
          {t('dashboard.recentTransactions.viewAll')}
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
