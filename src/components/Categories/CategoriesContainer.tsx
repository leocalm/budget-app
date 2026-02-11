import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Drawer,
  Modal,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { EmptyState } from '@/components/Utils';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useDeleteCategory, useInfiniteCategories } from '@/hooks/useCategories';
import { CategoryResponse, CategoryType } from '@/types/category';
import { PageHeader } from '../Transactions/PageHeader';
import { CategoryCard } from './CategoryCard';
import { CreateCategoryForm } from './CreateCategoryForm';
import { EditCategoryForm } from './EditCategoryForm';
import styles from './Categories.module.css';

type CategoryTypeFilter = 'all' | CategoryType;

export function CategoriesContainer() {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  // Get selected budget period from context
  const { selectedPeriodId } = useBudgetPeriodSelection();

  const {
    data: paginatedCategories,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCategories(selectedPeriodId);
  const [typeFilter, setTypeFilter] = useState<CategoryTypeFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
  const deleteMutation = useDeleteCategory(selectedPeriodId);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  const categories = useMemo(
    () => paginatedCategories?.pages.flatMap((page) => page.categories) ?? [],
    [paginatedCategories]
  );

  const filteredCategories = useMemo(() => {
    if (!categories) {
      return [];
    }
    if (typeFilter === 'all') {
      return categories;
    }
    return categories.filter((c) => c.categoryType === typeFilter);
  }, [categories, typeFilter]);

  const onDeleteCategory = (id: string) => {
    deleteMutation.mutate(id);
  };

  const onEditCategory = (category: CategoryResponse) => {
    setSelectedCategory(category);
    openEdit();
  };

  const onEditClosed = () => {
    closeEdit();
    setSelectedCategory(null);
  };

  // Count categories by type
  const categoryCounts = useMemo(() => {
    if (!categories) {
      return { all: 0, Outgoing: 0, Incoming: 0, Transfer: 0 };
    }
    return {
      all: categories.length,
      Outgoing: categories.filter((c) => c.categoryType === 'Outgoing').length,
      Incoming: categories.filter((c) => c.categoryType === 'Incoming').length,
      Transfer: categories.filter((c) => c.categoryType === 'Transfer').length,
    };
  }, [categories]);

  return (
    <Box
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px',
      }}
    >
      <Stack gap="xl">
        {/* Header */}
        <PageHeader
          title="Categories"
          subtitle="Organize your transactions into meaningful groups."
          actions={
            <Button className={styles.addButton} size="md" onClick={openCreate}>
              <span style={{ fontSize: '16px', marginRight: '4px' }}>+</span>
              Add Category
            </Button>
          }
        />

        {/* Filter Tabs */}
        <Tabs
          value={typeFilter}
          onChange={(value) => setTypeFilter(value as CategoryTypeFilter)}
          classNames={{
            root: styles.filterTabs,
            tab: styles.filterTab,
          }}
        >
          <Tabs.List style={{ display: 'flex', gap: '8px' }}>
            <Tabs.Tab value="all">
              All <span className={styles.filterCount}>{categoryCounts.all}</span>
            </Tabs.Tab>
            <Tabs.Tab value="Outgoing">
              Spending <span className={styles.filterCount}>{categoryCounts.Outgoing}</span>
            </Tabs.Tab>
            <Tabs.Tab value="Incoming">
              Income <span className={styles.filterCount}>{categoryCounts.Incoming}</span>
            </Tabs.Tab>
            <Tabs.Tab value="Transfer">
              Transfer <span className={styles.filterCount}>{categoryCounts.Transfer}</span>
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <EmptyState
            icon="📁"
            title={t('states.empty.categories.title')}
            message={t('states.empty.categories.message')}
            primaryAction={{
              label: t('states.empty.categories.addButton', 'Add Category'),
              icon: <span>+</span>,
              onClick: openCreate,
            }}
          />
        ) : (
          <>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="lg">
              {filteredCategories.map((category) => {
                // Calculate trend from differenceVsAveragePercentage
                const trendPercentage = Math.abs(category.differenceVsAveragePercentage);
                const trend =
                  trendPercentage > 0
                    ? {
                        direction:
                          category.differenceVsAveragePercentage > 0
                            ? ('up' as const)
                            : ('down' as const),
                        percentage: trendPercentage,
                      }
                    : undefined;

                return (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    monthlySpent={category.usedInPeriod}
                    transactionCount={category.transactionCount}
                    trend={trend}
                    onEdit={onEditCategory}
                    onDelete={onDeleteCategory}
                  />
                );
              })}
            </SimpleGrid>

            {(hasNextPage || isFetchingNextPage) && (
              <Box
                style={{
                  padding: '12px 16px 20px',
                  textAlign: 'center',
                }}
              >
                <Text size="sm" c="dimmed">
                  {isFetchingNextPage ? t('states.loading.default') : ''}
                </Text>
                <button
                  type="button"
                  onClick={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                      void fetchNextPage();
                    }
                  }}
                  style={{
                    marginTop: '8px',
                    padding: '8px 16px',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isFetchingNextPage ? 'not-allowed' : 'pointer',
                    opacity: isFetchingNextPage ? 0.6 : 1,
                  }}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load More'}
                </button>
              </Box>
            )}
          </>
        )}

        {isMobile ? (
          <>
            <Drawer
              opened={createOpened}
              onClose={closeCreate}
              title="Create Category"
              position="bottom"
            >
              <CreateCategoryForm
                onCategoryCreated={closeCreate}
                selectedPeriodId={selectedPeriodId}
              />
            </Drawer>
            <Drawer
              opened={editOpened}
              onClose={onEditClosed}
              title="Edit Category"
              position="bottom"
            >
              {selectedCategory && (
                <EditCategoryForm
                  category={selectedCategory}
                  onUpdated={onEditClosed}
                  selectedPeriodId={selectedPeriodId}
                />
              )}
            </Drawer>
          </>
        ) : (
          <>
            <Modal opened={createOpened} onClose={closeCreate} title="Create Category" centered>
              <CreateCategoryForm
                onCategoryCreated={closeCreate}
                selectedPeriodId={selectedPeriodId}
              />
            </Modal>
            <Modal opened={editOpened} onClose={onEditClosed} title="Edit Category" centered>
              {selectedCategory && (
                <EditCategoryForm
                  category={selectedCategory}
                  onUpdated={onEditClosed}
                  selectedPeriodId={selectedPeriodId}
                />
              )}
            </Modal>
          </>
        )}
      </Stack>
    </Box>
  );
}
