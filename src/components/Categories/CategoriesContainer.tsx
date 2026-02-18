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
import { CardSkeleton, StateRenderer } from '@/components/Utils';
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
  const showFilters = false;

  // Get selected budget period from context
  const { selectedPeriodId } = useBudgetPeriodSelection();

  const {
    data: paginatedCategories,
    isLoading,
    isError,
    refetch,
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
          title={t('categories.header.title')}
          subtitle={t('categories.header.subtitle')}
          actions={
            <Button className={styles.addButton} size="md" onClick={openCreate}>
              <span style={{ fontSize: '16px', marginRight: '4px' }}>+</span>
              {t('categories.actions.addCategory')}
            </Button>
          }
        />

        {/* Filter Tabs */}
        {showFilters && (
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
                {t('categories.tabs.all')}{' '}
                <span className={styles.filterCount}>{categoryCounts.all}</span>
              </Tabs.Tab>
              <Tabs.Tab value="Outgoing">
                {t('categories.tabs.outgoing')}{' '}
                <span className={styles.filterCount}>{categoryCounts.Outgoing}</span>
              </Tabs.Tab>
              <Tabs.Tab value="Incoming">
                {t('categories.tabs.incoming')}{' '}
                <span className={styles.filterCount}>{categoryCounts.Incoming}</span>
              </Tabs.Tab>
              <Tabs.Tab value="Transfer">
                {t('categories.tabs.transfer')}{' '}
                <span className={styles.filterCount}>{categoryCounts.Transfer}</span>
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        )}

        {/* Categories Grid */}
        <StateRenderer
          variant="page"
          isLocked={selectedPeriodId === null}
          lockMessage={t('states.locked.message.periodRequired')}
          lockAction={{ label: t('states.locked.configure'), to: '/periods' }}
          hasError={isError}
          errorMessage={t('states.error.loadFailed.message')}
          onRetry={() => {
            void refetch();
          }}
          isLoading={isLoading}
          loadingSkeleton={
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="lg" w="100%">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
                <CardSkeleton key={item} />
              ))}
            </SimpleGrid>
          }
          isEmpty={filteredCategories.length === 0}
          emptyItemsLabel={t('states.contract.items.categories')}
          emptyMessage={t('states.empty.categories.message')}
          emptyAction={{
            label: t('categories.empty.addButton'),
            onClick: openCreate,
          }}
        >
          <>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="lg">
              {filteredCategories.map((category) => {
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
                    padding: '10px 24px',
                    background: 'var(--accent-primary)',
                    color: 'var(--mono-black)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    cursor: isFetchingNextPage ? 'not-allowed' : 'pointer',
                    opacity: isFetchingNextPage ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? t('states.loading.default') : t('common.loadMore')}
                </button>
              </Box>
            )}
          </>
        </StateRenderer>

        {isMobile ? (
          <>
            <Drawer
              opened={createOpened}
              onClose={closeCreate}
              title={t('categories.modal.createTitle')}
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
              title={t('categories.modal.editTitle')}
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
            <Modal
              opened={createOpened}
              onClose={closeCreate}
              title={t('categories.modal.createTitle')}
              centered
            >
              <CreateCategoryForm
                onCategoryCreated={closeCreate}
                selectedPeriodId={selectedPeriodId}
              />
            </Modal>
            <Modal
              opened={editOpened}
              onClose={onEditClosed}
              title={t('categories.modal.editTitle')}
              centered
            >
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
