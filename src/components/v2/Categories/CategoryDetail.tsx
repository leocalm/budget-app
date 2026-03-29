import { Link, useNavigate } from 'react-router-dom';
import { AreaChart } from '@mantine/charts';
import { ActionIcon, Anchor, Button, Menu, Progress, Skeleton, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import {
  useArchiveCategory,
  useCategoryDetail,
  useDeleteCategory,
  useUnarchiveCategory,
} from '@/hooks/v2/useCategories';
import { toast } from '@/lib/toast';
import { useV2Theme } from '@/theme/v2';
import { CategoryFormDrawer } from './CategoryFormDrawer';
import classes from './Categories.module.css';

interface CategoryDetailProps {
  categoryId: string;
  periodId: string;
}

export function CategoryDetail({ categoryId, periodId }: CategoryDetailProps) {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useCategoryDetail(categoryId, periodId);
  const { accents } = useV2Theme();
  const archiveMutation = useArchiveCategory();
  const unarchiveMutation = useUnarchiveCategory();
  const deleteMutation = useDeleteCategory();
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  if (isLoading) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Skeleton width={80} height={14} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Skeleton width={32} height={32} radius="md" />
          <Skeleton width={200} height={28} />
        </div>
        <div className={classes.metricsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={classes.metricBox}>
              <Skeleton width={50} height={10} mb={4} />
              <Skeleton width={80} height={24} />
            </div>
          ))}
        </div>
        <div className={classes.detailCard}>
          <Skeleton width={200} height={12} mb="sm" />
          <Skeleton height={200} radius="md" />
        </div>
      </Stack>
    );
  }

  if (isError || !data) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Anchor component={Link} to="/v2/categories" fz="sm" c="var(--v2-primary)">
          ← Categories
        </Anchor>
        <div className={classes.centeredState}>
          <Text fz="sm" c="dimmed">
            {isError ? 'Something went wrong loading this category.' : 'Category not found.'}
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

  const cat = data;
  const hasBudget = cat.budgeted != null && cat.budgeted > 0;
  const spentPct = hasBudget
    ? Math.min(Math.round((cat.periodSpend / cat.budgeted!) * 100), 100)
    : 0;

  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync(categoryId);
      toast.success({ message: `${cat.name} archived` });
    } catch {
      toast.error({ message: 'Failed to archive category' });
    }
  };

  const handleUnarchive = async () => {
    try {
      await unarchiveMutation.mutateAsync(categoryId);
      toast.success({ message: `${cat.name} unarchived` });
    } catch {
      toast.error({ message: 'Failed to unarchive category' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(categoryId);
      toast.success({ message: 'Category deleted' });
      navigate('/v2/categories');
    } catch {
      toast.error({ message: 'Failed to delete category' });
    }
  };

  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      {/* Header */}
      <div className={classes.detailHeader}>
        <div>
          <Anchor component={Link} to="/v2/categories" fz="sm" c="var(--v2-primary)">
            ← Categories
          </Anchor>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <div className={classes.iconBadge} style={{ backgroundColor: `${cat.color}26` }}>
              {cat.icon}
            </div>
            <div>
              <Text fz={24} fw={700} ff="var(--mantine-font-family-headings)">
                {cat.name}
              </Text>
              {cat.description && (
                <Text fz="sm" c="dimmed">
                  {cat.description}
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
              aria-label={`Actions for ${cat.name}`}
            >
              <Text fz="xl" lh={1}>
                ⋮
              </Text>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={openEdit}>Edit</Menu.Item>
            {cat.status === 'inactive' ? (
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

      {/* Budget progress */}
      {hasBudget && (
        <div className={classes.detailCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text fz="sm" c="dimmed">
              <CurrencyValue cents={cat.periodSpend} /> of <CurrencyValue cents={cat.budgeted!} />
            </Text>
            <Text fz="sm" c="dimmed">
              {spentPct}%
            </Text>
          </div>
          <Progress value={spentPct} size={8} radius="xl" color={cat.color} />
        </div>
      )}

      {/* Metrics */}
      <div className={classes.metricsGrid}>
        <div className={classes.metricBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            Spent
          </Text>
          <Text fz="lg" fw={600} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={cat.periodSpend} />
          </Text>
        </div>
        <div className={classes.metricBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            Budget
          </Text>
          <Text fz="lg" fw={600} ff="var(--mantine-font-family-monospace)">
            {hasBudget ? <CurrencyValue cents={cat.budgeted!} /> : '—'}
          </Text>
        </div>
        <div className={classes.metricBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            Transactions
          </Text>
          <Text fz="lg" fw={600} ff="var(--mantine-font-family-monospace)">
            {cat.transactionCount}
          </Text>
        </div>
        {hasBudget && (
          <div className={classes.metricBox}>
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
              Remaining
            </Text>
            <Text fz="lg" fw={600} ff="var(--mantine-font-family-monospace)">
              <CurrencyValue cents={Math.max(cat.budgeted! - cat.periodSpend, 0)} />
            </Text>
          </div>
        )}
      </div>

      {/* Spending trend chart */}
      {cat.trend.length >= 2 && (
        <div
          className={classes.detailCard}
          role="img"
          aria-label={`Spending trend for ${cat.name}`}
        >
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="sm">
            Spending Trend — Last {cat.trend.length} Periods
          </Text>
          <AreaChart
            h={200}
            data={cat.trend.map((t) => ({ period: t.periodName, value: t.totalSpend }))}
            dataKey="period"
            series={[{ name: 'value', color: cat.color || accents.primary }]}
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

      {/* Recent transactions */}
      {cat.recentTransactions.length > 0 && (
        <div className={classes.detailCard}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="sm">
            Recent Transactions
          </Text>
          {cat.recentTransactions.map((txn) => (
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
                  {txn.vendorName && ` · ${txn.vendorName}`}
                </Text>
              </div>
              <Text fz="sm" fw={600} ff="var(--mantine-font-family-monospace)">
                <CurrencyValue cents={txn.amount} />
              </Text>
            </div>
          ))}
        </div>
      )}

      <CategoryFormDrawer
        key={categoryId}
        opened={editOpened}
        onClose={closeEdit}
        editCategory={cat}
      />
    </Stack>
  );
}
