import React from 'react';
import { Group } from '@mantine/core';
import { CategoryResponse } from '@/types/category';

export function CategoryNameIcon({ category }: { category: CategoryResponse }) {
  return (
    <Group>
      {category.icon}
      {category.name}
    </Group>
  );
}
