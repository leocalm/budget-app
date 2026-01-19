import React, { useState } from 'react';
import { IconArrowDownLeft, IconArrowUpRight, IconPencil, IconTrash } from '@tabler/icons-react';
import {
  ActionIcon,
  Card,
  Drawer,
  Group,
  Modal,
  SimpleGrid,
  Tabs,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import type { CategoryResponse } from '@/types/category';
import { CategoryNameIcon } from './CategoryNameIcon';
import { EditCategoryForm } from './EditCategoryForm';

export function CategoriesTable() {
  const { data: categories, isLoading } = useCategories();
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const deleteMutation = useDeleteCategory();
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [selected, setSelected] = useState<CategoryResponse | null>(null);

  if (isLoading) {
    return <Text>Loading categories...</Text>;
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
          backgroundColor:
            colorScheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-white)',
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
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {categories
            ?.filter((c) => c.categoryType !== 'Transfer')
            .map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
        </SimpleGrid>
      </Tabs.Panel>

      <Tabs.Panel value="outgoing">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {outgoing.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </SimpleGrid>
      </Tabs.Panel>

      <Tabs.Panel value="incoming">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {incoming.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </SimpleGrid>
      </Tabs.Panel>

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
    </Tabs>
  );
}
