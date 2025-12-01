import { Stack, Title } from '@mantine/core';
import { CategoriesTable } from './CategoriesTable';
import { CreateCategory } from './CreateCategory';

export function Categories() {
  return (
    <Stack>
      <Title>Categories</Title>
      {/* CreateCategory can call onRefresh after successful creation */}
      <CreateCategory />

      <CategoriesTable />
    </Stack>
  );
}
