import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { CategoriesContainer } from './CategoriesContainer';

const useCategoriesMock = vi.hoisted(() => vi.fn());
const useInfiniteCategoriesMock = vi.hoisted(() => vi.fn());
const useDeleteCategoryMock = vi.hoisted(() => vi.fn());

vi.mock('@/context/BudgetContext', () => ({
  useBudgetPeriodSelection: () => ({
    selectedPeriodId: 'period-1',
    setSelectedPeriodId: vi.fn(),
  }),
}));

vi.mock('@/hooks/useCategories', () => ({
  useCategories: (...args: unknown[]) => useCategoriesMock(...args),
  useInfiniteCategories: (...args: unknown[]) => useInfiniteCategoriesMock(...args),
  useDeleteCategory: () => useDeleteCategoryMock(),
}));

vi.mock('./CreateCategoryForm', () => ({
  CreateCategoryForm: ({ onCategoryCreated }: { onCategoryCreated?: () => void }) => (
    <button type="button" onClick={onCategoryCreated}>
      Create form
    </button>
  ),
}));

vi.mock('./EditCategoryForm', () => ({
  EditCategoryForm: ({ onUpdated }: { onUpdated?: () => void }) => (
    <button type="button" onClick={onUpdated}>
      Edit form
    </button>
  ),
}));

vi.mock('../Transactions/PageHeader', () => ({
  PageHeader: ({
    title,
    subtitle,
    actions,
  }: {
    title: string;
    subtitle: string;
    actions?: ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {actions}
    </div>
  ),
}));

describe('CategoriesContainer', () => {
  beforeEach(() => {
    useCategoriesMock.mockReset();
    useInfiniteCategoriesMock.mockReset();
    useDeleteCategoryMock.mockReset();
    useDeleteCategoryMock.mockReturnValue({ mutate: vi.fn() });
    useInfiniteCategoriesMock.mockReturnValue({
      data: { pages: [] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
  });

  const renderPage = () => {
    render(
      <MantineProvider>
        <CategoriesContainer />
      </MantineProvider>
    );
  };

  it('opens create category modal when Add Category is clicked', async () => {
    const user = userEvent.setup();

    useInfiniteCategoriesMock.mockReturnValue({
      data: {
        pages: [
          {
            categories: [
              {
                id: 'category-1',
                name: 'Food',
                color: '#00d4ff',
                icon: '🍔',
                parentId: null,
                categoryType: 'Outgoing',
                usedInPeriod: 0,
                differenceVsAveragePercentage: 0,
                transactionCount: 0,
              },
            ],
            nextCursor: null,
          },
        ],
      },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    renderPage();

    await user.click(screen.getByRole('button', { name: /\+?Add Category/ }));

    expect(await screen.findByRole('button', { name: 'Create form' })).toBeInTheDocument();
  });

  it('opens edit category modal when edit button is clicked', async () => {
    const user = userEvent.setup();

    useInfiniteCategoriesMock.mockReturnValue({
      data: {
        pages: [
          {
            categories: [
              {
                id: 'category-1',
                name: 'Food',
                color: '#00d4ff',
                icon: '🍔',
                parentId: null,
                categoryType: 'Outgoing',
                usedInPeriod: 0,
                differenceVsAveragePercentage: 0,
                transactionCount: 0,
              },
            ],
            nextCursor: null,
          },
        ],
      },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    renderPage();

    await user.click(screen.getByTitle('Edit'));

    expect(await screen.findByRole('button', { name: 'Edit form' })).toBeInTheDocument();
  });
});
