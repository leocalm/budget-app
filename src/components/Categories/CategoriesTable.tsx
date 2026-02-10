import React, { useEffect, useRef, useState } from 'react';
import { IconArrowDownLeft, IconArrowUpRight, IconPencil, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  ActionIcon,
  Box,
  Card,
  Drawer,
  Group,
  Modal,
  SimpleGrid,
  Tabs,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { EmptyState, LoadingState } from '@/components/Utils';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useDeleteCategory, useInfiniteCategories } from '@/hooks/useCategories';
import type { CategoryResponse } from '@/types/category';
import { CategoryNameIcon } from './CategoryNameIcon';
import { EditCategoryForm } from './EditCategoryForm';

export function CategoriesTable() {
  const { t } = useTranslation();
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const {
    data: paginatedCategories,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCategories(selectedPeriodId);
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const deleteMutation = useDeleteCategory();
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [selected, setSelected] = useState<CategoryResponse | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const categories = React.useMemo(
    () => paginatedCategories?.pages.flatMap((page) => page.categories) ?? [],
    [paginatedCategories]
  );

  // Intersection Observer for scroll-triggered load more
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    const node = sentinelRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage();
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <LoadingState variant="spinner" text={t('states.loading.default')} />;
  }

  if (!categories || categories.length === 0) {
    return (
      <EmptyState
        icon="📁"
        title={t('states.empty.categories.title')}
        message={t('states.empty.categories.message')}
      />
    );
  }

  const CategoryCard = ({ category }: { category: CategoryResponse }) => {
    const isOutgoing = category.categoryType === 'Outgoing';
    const accentColor = isOutgoing ? 'red' : 'green';

    return (
      <Card
        withBorder
        padding="sm"
        radius="md"
        style={{
          borderLeft: `4px solid var(--mantine-color-${accentColor}-6)`,
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm">
            <CategoryNameIcon category={category} />
            <div>
              <Group gap={4}>
                {isOutgoing ? (
                  <IconArrowUpRight size={12} color="var(--mantine-color-red-6)" />
                ) : (
                  <IconArrowDownLeft size={12} color="var(--mantine-color-green-6)" />
                )}
                <Text size="xs" c="dimmed" tt="capitalize">
                  {category.categoryType}
                </Text>
              </Group>
            </div>
          </Group>

          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => {
                setSelected(category);
                openEdit();
              }}
              size="sm"
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => deleteMutation.mutate(category.id)}
              size="sm"
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Card>
    );
  };

  const incoming = categories?.filter((c) => c.categoryType === 'Incoming') || [];
  const outgoing = categories?.filter((c) => c.categoryType === 'Outgoing') || [];

  return (
    <>
      <Tabs defaultValue="all" variant="pills" radius="xl">
        <Tabs.List mb="xl">
          <Tabs.Tab value="all">All ({categories?.length})</Tabs.Tab>
          <Tabs.Tab value="outgoing" color="red">
            Spending ({outgoing.length})
          </Tabs.Tab>
          <Tabs.Tab value="incoming" color="green">
            Income ({incoming.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="all">
          {(() => {
            const visible = categories?.filter((c) => c.categoryType !== 'Transfer') || [];
            if (visible.length === 0) {
              return (
                <EmptyState
                  icon="📁"
                  title={t('states.empty.categories.title')}
                  message={t('states.empty.categories.message')}
                />
              );
            }
            return (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {visible.map((c) => (
                  <CategoryCard key={c.id} category={c} />
                ))}
              </SimpleGrid>
            );
          })()}
        </Tabs.Panel>

        <Tabs.Panel value="outgoing">
          {outgoing.length === 0 ? (
            <EmptyState
              icon="📁"
              title={t('states.empty.categories.spendingTitle', t('states.empty.categories.title'))}
              message={t(
                'states.empty.categories.spendingMessage',
                t('states.empty.categories.message')
              )}
            />
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {outgoing.map((c) => (
                <CategoryCard key={c.id} category={c} />
              ))}
            </SimpleGrid>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="incoming">
          {incoming.length === 0 ? (
            <EmptyState
              icon="📁"
              title={t('states.empty.categories.incomeTitle', t('states.empty.categories.title'))}
              message={t(
                'states.empty.categories.incomeMessage',
                t('states.empty.categories.message')
              )}
            />
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {incoming.map((c) => (
                <CategoryCard key={c.id} category={c} />
              ))}
            </SimpleGrid>
          )}
        </Tabs.Panel>
      </Tabs>

      {(hasNextPage || isFetchingNextPage) && (
        <Box
          ref={sentinelRef}
          style={{
            padding: '12px 16px 20px',
            textAlign: 'center',
          }}
        >
          <Text size="sm" c="dimmed">
            {isFetchingNextPage ? t('states.loading.default') : ''}
          </Text>
        </Box>
      )}

      {isMobile ? (
        <Drawer opened={editOpened} onClose={closeEdit} title="Edit Category" position="bottom">
          <div>
            {selected && (
              <EditCategoryForm
                category={selected}
                onUpdated={() => {
                  closeEdit();
                  setSelected(null);
                }}
              />
            )}
          </div>
        </Drawer>
      ) : (
        <Modal opened={editOpened} onClose={closeEdit} title="Edit Category" centered>
          {selected && (
            <EditCategoryForm
              category={selected}
              onUpdated={() => {
                closeEdit();
                setSelected(null);
              }}
            />
          )}
        </Modal>
      )}
    </>
  );
}
