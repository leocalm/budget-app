import React from 'react';
import { IconTrash } from '@tabler/icons-react';
import { ActionIcon, Alert, Loader, Table } from '@mantine/core';
import { CategoryNameIcon } from '@/components/Categories/CategoryNameIcon';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';

export const CategoriesTable = () => {
  // 1. Fetch data
  const { data: categories, isLoading, isError } = useCategories();

  // 2. Get delete mutation
  const deleteMutation = useDeleteCategory();

  if (isLoading) {
    return <Loader />;
  }
  if (isError) {
    return <Alert color="red">Error loading categories</Alert>;
  }

  const rows = categories?.map((category) => (
    <Table.Tr key={category.id}>
      <Table.Td>
        <CategoryNameIcon category={category} />
      </Table.Td>
      <Table.Td>{category.category_type}</Table.Td>
      <Table.Td>
        <ActionIcon color="red" onClick={() => deleteMutation.mutate(category.id)}>
          <IconTrash size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};
