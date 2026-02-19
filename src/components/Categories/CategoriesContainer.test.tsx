import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { render, screen } from '@/test-utils';
import { CategoriesContainer } from './CategoriesContainer';

const useCategoriesDiagnosticMock = vi.hoisted(() => vi.fn());

vi.mock('@/context/BudgetContext', () => ({
  useBudgetPeriodSelection: () => ({
    selectedPeriodId: 'period-1',
    setSelectedPeriodId: vi.fn(),
  }),
}));

vi.mock('@/hooks/useCategories', () => ({
  useCategoriesDiagnostic: (...args: unknown[]) => useCategoriesDiagnosticMock(...args),
}));

vi.mock('@/hooks/useDisplayCurrency', () => ({
  useDisplayCurrency: () => ({ currency: 'EUR', decimalPlaces: 2 }),
}));

vi.mock('@/components/BudgetPeriodSelector', () => ({
  PeriodContextStrip: () => <div>PeriodContextStrip</div>,
}));

vi.mock('./CreateCategoryForm', () => ({
  CreateCategoryForm: ({ onCategoryCreated }: { onCategoryCreated?: () => void }) => (
    <button type="button" onClick={onCategoryCreated}>
      Create form
    </button>
  ),
}));

describe('CategoriesContainer diagnostics layout', () => {
  beforeEach(() => {
    useCategoriesDiagnosticMock.mockReset();

    useCategoriesDiagnosticMock.mockReturnValue({
      data: {
        periodSummary: {
          totalBudget: 100000,
          spentBudget: 25000,
          remainingBudget: 75000,
          daysInPeriod: 30,
          remainingDays: 20,
          daysPassedPercentage: 33,
        },
        budgetedRows: [],
        unbudgetedRows: [],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  const renderPage = () => {
    render(
      <MantineProvider>
        <CategoriesContainer />
      </MantineProvider>
    );
  };

  it('renders diagnostics sections and sorts unbudgeted rows by spend', () => {
    useCategoriesDiagnosticMock.mockReturnValue({
      data: {
        periodSummary: {
          totalBudget: 100000,
          spentBudget: 18000,
          remainingBudget: 82000,
          daysInPeriod: 30,
          remainingDays: 18,
          daysPassedPercentage: 40,
        },
        budgetedRows: [
          {
            id: 'category-food',
            name: 'Food',
            color: '#00d4ff',
            icon: '🍔',
            parentId: null,
            categoryType: 'Outgoing',
            budgetedValue: 12000,
            actualValue: 9000,
            varianceValue: -3000,
            progressBasisPoints: 7500,
            recentClosedPeriods: [
              { periodId: 'p1', isOutsideTolerance: false },
              { periodId: 'p2', isOutsideTolerance: true },
              { periodId: 'p3', isOutsideTolerance: false },
            ],
          },
          {
            id: 'category-utilities',
            name: 'Utilities',
            color: '#228be6',
            icon: '💡',
            parentId: null,
            categoryType: 'Outgoing',
            budgetedValue: 4000,
            actualValue: 2500,
            varianceValue: -1500,
            progressBasisPoints: 6250,
            recentClosedPeriods: [
              { periodId: 'p1', isOutsideTolerance: false },
              { periodId: 'p2', isOutsideTolerance: false },
            ],
          },
        ],
        unbudgetedRows: [
          {
            id: 'category-gifts',
            name: 'Gifts',
            color: '#ff8787',
            icon: '🎁',
            parentId: null,
            categoryType: 'Outgoing',
            actualValue: 6500,
            shareOfTotalBasisPoints: 7222,
          },
          {
            id: 'category-other',
            name: 'Other',
            color: '#94d82d',
            icon: '🧾',
            parentId: null,
            categoryType: 'Outgoing',
            actualValue: 2500,
            shareOfTotalBasisPoints: 2778,
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByText('PeriodContextStrip')).toBeInTheDocument();
    expect(screen.getByText('Budgeted categories')).toBeInTheDocument();
    expect(screen.getByText('Unbudgeted categories')).toBeInTheDocument();

    expect(screen.getByTestId('budgeted-row-category-food')).toBeInTheDocument();
    expect(screen.getByTestId('budgeted-row-category-utilities')).toBeInTheDocument();

    const unbudgetedRows = screen.getAllByTestId(/unbudgeted-row-/);
    expect(unbudgetedRows[0]).toHaveAttribute('data-testid', 'unbudgeted-row-category-gifts');
    expect(screen.getByText('72.2%')).toBeInTheDocument();
  });

  it('does not render edit action in budgeted rows', () => {
    useCategoriesDiagnosticMock.mockReturnValue({
      data: {
        periodSummary: {
          totalBudget: 100000,
          spentBudget: 18000,
          remainingBudget: 82000,
          daysInPeriod: 30,
          remainingDays: 18,
          daysPassedPercentage: 40,
        },
        budgetedRows: [
          {
            id: 'category-food',
            name: 'Food',
            color: '#00d4ff',
            icon: '🍔',
            parentId: null,
            categoryType: 'Outgoing',
            budgetedValue: 12000,
            actualValue: 9000,
            varianceValue: -3000,
            progressBasisPoints: 7500,
            recentClosedPeriods: [
              { periodId: 'p1', isOutsideTolerance: false },
              { periodId: 'p2', isOutsideTolerance: false },
              { periodId: 'p3', isOutsideTolerance: false },
            ],
          },
        ],
        unbudgetedRows: [],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  });
});
