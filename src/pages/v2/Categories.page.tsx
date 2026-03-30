import { useMemo, useState } from 'react';
import { Button, Skeleton, Stack, Text, TextInput, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { CategoryFormDrawer, CategoryRow } from '@/components/v2/Categories';
import classes from '@/components/v2/Categories/Categories.module.css';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import {
  useArchiveCategory,
  useCategoriesOverview,
  useDeleteCategory,
  useUnarchiveCategory,
} from '@/hooks/v2/useCategories';
import { toast } from '@/lib/toast';

type CategorySummary = components['schemas']['CategorySummaryItem'];

export function CategoriesV2Page() {
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const {
    data: overviewData,
    isLoading,
    isError,
    refetch,
  } = useCategoriesOverview(selectedPeriodId);
  const archiveMutation = useArchiveCategory();
  const unarchiveMutation = useUnarchiveCategory();
  const deleteMutation = useDeleteCategory();

  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [editCategory, setEditCategory] = useState<CategorySummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const categories = overviewData?.categories ?? [];
  const summary = overviewData?.summary;

  const { incomeCategories, expenseCategories, archivedCategories } = useMemo(() => {
    const income: CategorySummary[] = [];
    const expense: CategorySummary[] = [];
    const archived: CategorySummary[] = [];
    const query = searchQuery.toLowerCase();

    for (const cat of categories) {
      if (query && !cat.name.toLowerCase().includes(query)) {
        continue;
      }
      if (cat.status === 'inactive') {
        archived.push(cat);
      } else if (cat.type === 'income') {
        income.push(cat);
      } else {
        expense.push(cat);
      }
    }

    return { incomeCategories: income, expenseCategories: expense, archivedCategories: archived };
  }, [categories, searchQuery]);

  const handleCreate = () => {
    setEditCategory(null);
    openForm();
  };

  const handleEdit = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (cat) {
      setEditCategory(cat);
      openForm();
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveMutation.mutateAsync(id);
      toast.success({ message: 'Category archived' });
    } catch {
      toast.error({ message: 'Failed to archive category' });
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      await unarchiveMutation.mutateAsync(id);
      toast.success({ message: 'Category unarchived' });
    } catch {
      toast.error({ message: 'Failed to unarchive category' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success({ message: 'Category deleted' });
    } catch {
      toast.error({ message: 'Failed to delete category' });
    }
  };

  if (!selectedPeriodId) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
          Categories
        </Text>
        <Text c="dimmed" fz="sm">
          No budget period selected.
        </Text>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
          Categories
        </Text>
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            Categories
          </Text>
          <Text fz="sm" c="dimmed">
            Something went wrong loading your categories.
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
          <Skeleton width={160} height={28} />
          <Skeleton width={120} height={32} radius="md" />
        </div>
        <Skeleton height={60} radius="md" />
        <Skeleton height={36} radius="md" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} height={54} radius="lg" />
        ))}
      </Stack>
    );
  }

  const hasCategories = categories.length > 0;

  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      {/* Header */}
      <div className={classes.pageHeader}>
        <div>
          <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
            Categories
          </Text>
          <Text c="dimmed" fz="sm">
            Your budgeting structure
          </Text>
        </div>
        <Button size="sm" onClick={handleCreate}>
          + Add Category
        </Button>
      </div>

      {/* Empty state */}
      {!hasCategories && (
        <div className={classes.centeredState}>
          <Text fz={32}>📂</Text>
          <Text fz={18} fw={700} ff="var(--mantine-font-family-headings)">
            No categories yet
          </Text>
          <Text fz="sm" c="dimmed" ta="center">
            Create your first category to start categorizing transactions and define your budgeting
            structure.
          </Text>
          <Button size="sm" onClick={handleCreate}>
            + Add Your First Category
          </Button>
        </div>
      )}

      {hasCategories && (
        <>
          {/* Stats bar */}
          {summary && (
            <div className={classes.statsBar}>
              <div className={classes.statItem}>
                <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
                  Expense Budget
                </Text>
                <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
                  {summary.totalBudgeted != null ? (
                    <CurrencyValue cents={summary.totalBudgeted} />
                  ) : (
                    '—'
                  )}
                </Text>
              </div>
              <div className={classes.statItem}>
                <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
                  Income Target
                </Text>
                <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
                  {summary.totalBudgetedIncoming != null ? (
                    <CurrencyValue cents={summary.totalBudgetedIncoming} />
                  ) : (
                    '—'
                  )}
                </Text>
              </div>
              <div className={classes.statItem}>
                <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
                  Total Spent
                </Text>
                <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
                  <CurrencyValue cents={summary.totalSpent} />
                </Text>
              </div>
              <div className={classes.statItem}>
                <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
                  Categories
                </Text>
                <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
                  {incomeCategories.length + expenseCategories.length}
                </Text>
              </div>
              <div className={classes.statItem}>
                <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
                  Unbudgeted
                </Text>
                <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
                  {
                    categories.filter(
                      (c) => c.status === 'active' && (c.budgeted == null || c.budgeted === 0)
                    ).length
                  }
                </Text>
              </div>
            </div>
          )}

          {/* Search */}
          <TextInput
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />

          {/* Incoming */}
          {incomeCategories.length > 0 && (
            <Stack gap="sm">
              <div className={classes.groupHeader}>
                <Text
                  fz="xs"
                  fw={700}
                  tt="uppercase"
                  c="dimmed"
                  style={{ letterSpacing: '0.88px' }}
                >
                  Incoming
                </Text>
                <Text fz="sm" c="dimmed" ff="var(--mantine-font-family-monospace)">
                  <CurrencyValue cents={incomeCategories.reduce((sum, c) => sum + c.actual, 0)} />{' '}
                  this period
                </Text>
              </div>
              {incomeCategories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  onUnarchive={handleUnarchive}
                  onDelete={handleDelete}
                />
              ))}
            </Stack>
          )}

          {/* Outgoing */}
          {expenseCategories.length > 0 && (
            <Stack gap="sm">
              <div className={classes.groupHeader}>
                <Text
                  fz="xs"
                  fw={700}
                  tt="uppercase"
                  c="dimmed"
                  style={{ letterSpacing: '0.88px' }}
                >
                  Outgoing
                </Text>
                <Text fz="sm" c="dimmed" ff="var(--mantine-font-family-monospace)">
                  <CurrencyValue cents={expenseCategories.reduce((sum, c) => sum + c.actual, 0)} />{' '}
                  this period
                </Text>
              </div>
              {expenseCategories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  onUnarchive={handleUnarchive}
                  onDelete={handleDelete}
                />
              ))}
            </Stack>
          )}

          {/* Archived */}
          {archivedCategories.length > 0 && (
            <Stack gap="sm">
              <UnstyledButton onClick={() => setShowArchived((v) => !v)}>
                <Text fz="sm" fw={600} c="dimmed">
                  {showArchived ? '▾' : '▸'} Archived ({archivedCategories.length})
                </Text>
              </UnstyledButton>
              {showArchived &&
                archivedCategories.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                    onUnarchive={handleUnarchive}
                    onDelete={handleDelete}
                  />
                ))}
            </Stack>
          )}
        </>
      )}

      <CategoryFormDrawer
        key={editCategory?.id ?? 'create'}
        opened={formOpened}
        onClose={closeForm}
        editCategory={editCategory ? { ...editCategory, target: editCategory.budgeted } : null}
      />
    </Stack>
  );
}
