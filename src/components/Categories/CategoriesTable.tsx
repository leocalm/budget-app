import React, { useEffect, useRef, useState } from 'react';
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconDots,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  ActionIcon,
  Box,
  Card,
  Drawer,
  Group,
  Menu,
  Modal,
  SimpleGrid,
  Tabs,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { ConfirmDialog } from '@/components/Overlays/ConfirmDialog';
import { EmptyState, LoadingState } from '@/components/Utils';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useDeleteCategory, useInfiniteCategories } from '@/hooks/useCategories';
import type { CategoryResponse } from '@/types/category';
import { CategoryNameIcon } from './CategoryNameIcon';
import { EditCategoryForm } from './EditCategoryForm';

interface CategoryCardProps {
  category: CategoryResponse;
  onEdit: (category: CategoryResponse) => void;
  onDelete: (id: string) => void;
}

function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const { t } = useTranslation();
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

        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="sm">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => onEdit(category)}>
              {t('common.edit', 'Edit')}
            </Menu.Item>
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={() => onDelete(category.id)}
            >
              {t('common.delete', 'Delete')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Card>
  );
}

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
  const deleteMutation = useDeleteCategory(selectedPeriodId);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [selected, setSelected] = useState<CategoryResponse | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryResponse | null>(null);
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

  const handleEdit = (category: CategoryResponse) => {
    setSelected(category);
    openEdit();
  };

  const handleDelete = (id: string) => {
    const cat = categories.find((c) => c.id === id) ?? null;
    setCategoryToDelete(cat);
  };

  const incoming = categories?.filter((c) => c.categoryType === 'Incoming') || [];
  const outgoing = categories?.filter((c) => c.categoryType === 'Outgoing') || [];

  return (
    <>
      <Tabs defaultValue="all" variant="pills" radius="xl">
        <Tabs.List mb="xl">
          <Tabs.Tab value="all">
            {t('categories.tabs.all')} ({categories?.length})
          </Tabs.Tab>
          <Tabs.Tab value="outgoing" color="red">
            {t('categories.tabs.outgoing')} ({outgoing.length})
          </Tabs.Tab>
          <Tabs.Tab value="incoming" color="green">
            {t('categories.tabs.incoming')} ({incoming.length})
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
                  <CategoryCard
                    key={c.id}
                    category={c}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
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
                <CategoryCard key={c.id} category={c} onEdit={handleEdit} onDelete={handleDelete} />
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
                <CategoryCard key={c.id} category={c} onEdit={handleEdit} onDelete={handleDelete} />
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
        <Drawer
          opened={editOpened}
          onClose={closeEdit}
          title={t('categories.editCategory')}
          position="bottom"
          closeOnClickOutside={false}
        >
          <div>
            {selected && (
              <EditCategoryForm
                category={selected}
                onUpdated={() => {
                  closeEdit();
                  setSelected(null);
                }}
                selectedPeriodId={selectedPeriodId}
              />
            )}
          </div>
        </Drawer>
      ) : (
        <Modal
          opened={editOpened}
          onClose={closeEdit}
          title={t('categories.editCategory')}
          centered
        >
          {selected && (
            <EditCategoryForm
              category={selected}
              onUpdated={() => {
                closeEdit();
                setSelected(null);
              }}
              selectedPeriodId={selectedPeriodId}
            />
          )}
        </Modal>
      )}

      <ConfirmDialog
        opened={categoryToDelete !== null}
        title={t('categories.confirm.delete.title')}
        impact={t('categories.confirm.delete.impact', { name: categoryToDelete?.name })}
        safeActionLabel={t('common.cancel')}
        actionLabel={t('common.delete')}
        actionColor="red"
        actionLoading={deleteMutation.isPending}
        onClose={() => setCategoryToDelete(null)}
        onAction={() => {
          if (categoryToDelete) {
            deleteMutation.mutate(categoryToDelete.id, {
              onSuccess: () => setCategoryToDelete(null),
            });
          }
        }}
      />
    </>
  );
}
