import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { CategoryResponse, CategoryWithStats } from '@/types/category';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>{children}</MantineProvider>
    </QueryClientProvider>
  );
};

const renderWithProviders = (ui: React.ReactElement, options?: RenderOptions) => {
  return render(ui, { wrapper: createWrapper(), ...options });
};

/**
 * Creates a mock CategoryResponse with default values for new required fields.
 * Use this in tests and stories to avoid repeating isArchived and description.
 */
export function createMockCategory(overrides: Partial<CategoryResponse> = {}): CategoryResponse {
  return {
    id: 'test-category-id',
    name: 'Test Category',
    color: '#5E63E6',
    icon: '📁',
    parentId: null,
    categoryType: 'Outgoing',
    isArchived: false,
    description: null,
    ...overrides,
  };
}

/**
 * Creates a mock CategoryWithStats with default values.
 */
export function createMockCategoryWithStats(
  overrides: Partial<CategoryWithStats> = {}
): CategoryWithStats {
  return {
    ...createMockCategory(),
    usedInPeriod: 0,
    differenceVsAveragePercentage: 0,
    transactionCount: 0,
    ...overrides,
  };
}

export * from '@testing-library/react';
export { renderWithProviders as render, userEvent };
