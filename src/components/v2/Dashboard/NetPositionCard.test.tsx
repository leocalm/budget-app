import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
// Import after vi.mock so we get the mocked versions
import { useAccountsSummary } from '@/hooks/v2/useAccounts';
import { useDashboardNetPosition, useDashboardNetPositionHistory } from '@/hooks/v2/useDashboard';
import { render } from '@/test-utils';
import { V2ThemeProvider } from '@/theme/v2';
import { NetPositionCard } from './NetPositionCard';

vi.mock('@/hooks/v2/useDashboard', () => ({
  useDashboardNetPosition: vi.fn(),
  useDashboardNetPositionHistory: vi.fn(),
}));

vi.mock('@/hooks/v2/useAccounts', () => ({
  useAccountsSummary: vi.fn(),
}));

vi.mock('@/hooks/useDisplayCurrency', () => ({
  useDisplayCurrency: () => ({
    id: 'eur-id',
    name: 'Euro',
    symbol: '€',
    currency: 'EUR',
    decimalPlaces: 2,
  }),
}));

const mockUseDashboardNetPosition = useDashboardNetPosition as ReturnType<typeof vi.fn>;
const mockUseDashboardNetPositionHistory = useDashboardNetPositionHistory as ReturnType<
  typeof vi.fn
>;
const mockUseAccountsSummary = useAccountsSummary as ReturnType<typeof vi.fn>;

function renderCard() {
  return render(
    <MemoryRouter>
      <V2ThemeProvider>
        <NetPositionCard periodId="period-1" />
      </V2ThemeProvider>
    </MemoryRouter>
  );
}

describe('NetPositionCard (v2)', () => {
  beforeEach(() => {
    mockUseDashboardNetPositionHistory.mockReturnValue({ data: undefined });
    mockUseAccountsSummary.mockReturnValue({ data: { data: [] }, isLoading: false });
  });

  it('renders loading skeleton when data is loading', () => {
    mockUseDashboardNetPosition.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    renderCard();

    expect(screen.getByTestId('net-position-card-loading')).toBeInTheDocument();
  });

  it('renders error state with retry button', () => {
    const refetch = vi.fn();
    mockUseDashboardNetPosition.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });

    renderCard();

    expect(
      screen.getByText('Something went wrong loading your position data.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('calls refetch when retry button is clicked', async () => {
    const refetch = vi.fn();
    mockUseDashboardNetPosition.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });

    renderCard();

    screen.getByRole('button', { name: 'Retry' }).click();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when numberOfAccounts is 0', () => {
    mockUseDashboardNetPosition.mockReturnValue({
      data: {
        total: 0,
        numberOfAccounts: 0,
        differenceThisPeriod: 0,
        liquidAmount: 0,
        protectedAmount: 0,
        debtAmount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderCard();

    expect(
      screen.getByText('No accounts configured yet. Add an account to see your net position.')
    ).toBeInTheDocument();
  });

  it('renders hero amount and account count on success', () => {
    mockUseDashboardNetPosition.mockReturnValue({
      data: {
        total: 500000,
        numberOfAccounts: 3,
        differenceThisPeriod: 10000,
        liquidAmount: 300000,
        protectedAmount: 200000,
        debtAmount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderCard();

    expect(screen.getByTestId('net-position-card')).toBeInTheDocument();
    expect(screen.getByText('3 accounts')).toBeInTheDocument();
  });

  it('hides debt breakdown item when debtAmount is 0', () => {
    mockUseDashboardNetPosition.mockReturnValue({
      data: {
        total: 500000,
        numberOfAccounts: 2,
        differenceThisPeriod: 5000,
        liquidAmount: 300000,
        protectedAmount: 200000,
        debtAmount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderCard();

    expect(screen.queryByText('Debt')).not.toBeInTheDocument();
    // "Liquid" and "Protected" appear in both the breakdown bar and the breakdown grid
    expect(screen.getAllByText('Liquid').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Protected').length).toBeGreaterThan(0);
  });

  it('shows "+" prefix for positive differenceThisPeriod', () => {
    mockUseDashboardNetPosition.mockReturnValue({
      data: {
        total: 1000000,
        numberOfAccounts: 2,
        differenceThisPeriod: 25000,
        liquidAmount: 600000,
        protectedAmount: 400000,
        debtAmount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderCard();

    // The change row renders the prefix as a plain text node followed by CurrencyValue
    const changeRow = screen.getByText('this period', { exact: false }).closest('p, span, [class]');
    expect(changeRow?.textContent).toMatch(/\+/);
  });

  it('renders account list with name, type, and balance', () => {
    mockUseDashboardNetPosition.mockReturnValue({
      data: {
        total: 500000,
        numberOfAccounts: 2,
        differenceThisPeriod: 0,
        liquidAmount: 300000,
        protectedAmount: 200000,
        debtAmount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseAccountsSummary.mockReturnValue({
      data: {
        data: [
          {
            id: 'acc-1',
            name: 'Main Checking',
            color: '#4dabf7',
            type: 'Checking',
            status: 'active',
            currentBalance: 300000,
          },
          {
            id: 'acc-2',
            name: 'Visa',
            color: '#f06595',
            type: 'CreditCard',
            status: 'active',
            currentBalance: 200000,
          },
        ],
      },
      isLoading: false,
    });

    renderCard();

    expect(screen.getByText('Main Checking')).toBeInTheDocument();
    expect(screen.getByText('Checking')).toBeInTheDocument();
    expect(screen.getByText('Visa')).toBeInTheDocument();
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
  });

  it('renders account skeleton rows while accounts are loading', () => {
    mockUseDashboardNetPosition.mockReturnValue({
      data: {
        total: 500000,
        numberOfAccounts: 2,
        differenceThisPeriod: 0,
        liquidAmount: 300000,
        protectedAmount: 200000,
        debtAmount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseAccountsSummary.mockReturnValue({ data: undefined, isLoading: true });

    renderCard();

    // Card itself should be present, but no account names
    expect(screen.getByTestId('net-position-card')).toBeInTheDocument();
    expect(screen.queryByText('Main Checking')).not.toBeInTheDocument();
  });

  it('shows "-" prefix for negative differenceThisPeriod', () => {
    mockUseDashboardNetPosition.mockReturnValue({
      data: {
        total: 800000,
        numberOfAccounts: 2,
        differenceThisPeriod: -15000,
        liquidAmount: 500000,
        protectedAmount: 300000,
        debtAmount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderCard();

    const changeRow = screen.getByText('this period', { exact: false }).closest('p, span, [class]');
    expect(changeRow?.textContent).toMatch(/-/);
  });
});
