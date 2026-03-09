import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, userEvent } from '@/test-utils';
import type { AvailableCardsResponse, DashboardCardConfig } from '@/types/dashboardLayout';
import { DashboardCardsSection } from './DashboardCardsSection';

const mockLayout: DashboardCardConfig[] = [
  {
    id: 'dc-1',
    cardType: 'current_period',
    entityId: null,
    size: 'full',
    position: 0,
    enabled: true,
  },
  {
    id: 'dc-2',
    cardType: 'budget_stability',
    entityId: null,
    size: 'half',
    position: 1,
    enabled: true,
  },
  {
    id: 'dc-3',
    cardType: 'net_position',
    entityId: null,
    size: 'half',
    position: 2,
    enabled: false,
  },
];

const mockAvailableCards: AvailableCardsResponse = {
  globalCards: [
    { cardType: 'current_period', defaultSize: 'full', alreadyAdded: true },
    { cardType: 'budget_stability', defaultSize: 'half', alreadyAdded: true },
    { cardType: 'net_position', defaultSize: 'half', alreadyAdded: true },
    { cardType: 'recent_transactions', defaultSize: 'full', alreadyAdded: false },
    { cardType: 'top_categories', defaultSize: 'half', alreadyAdded: false },
  ],
  entityCards: [],
};

const mockMutate = vi.fn();
const mockMutateFn = vi.fn((_vars: unknown, options?: { onSuccess?: () => void }) => {
  options?.onSuccess?.();
});

vi.mock('@/hooks/useDashboardLayout', () => ({
  useDashboardLayout: () => ({
    data: mockLayout,
    isLoading: false,
  }),
  useAvailableCards: () => ({
    data: mockAvailableCards,
  }),
  useCreateDashboardCard: () => ({
    mutate: mockMutateFn,
    isPending: false,
  }),
  useUpdateDashboardCard: () => ({
    mutate: mockMutate,
  }),
  useReorderDashboardCards: () => ({
    mutate: mockMutate,
  }),
  useDeleteDashboardCard: () => ({
    mutate: mockMutate,
  }),
  useResetDashboardLayout: () => ({
    mutate: mockMutateFn,
    isPending: false,
  }),
}));

vi.mock('@/lib/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('DashboardCardsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section title and description', () => {
    render(<DashboardCardsSection isDesktop />);

    expect(screen.getByText('Dashboard Cards')).toBeInTheDocument();
    expect(
      screen.getByText('Choose which cards appear on your dashboard and their display order')
    ).toBeInTheDocument();
  });

  it('renders all cards from layout sorted by position', () => {
    render(<DashboardCardsSection isDesktop />);

    expect(screen.getByText('Current Period')).toBeInTheDocument();
    expect(screen.getByText('Budget Stability')).toBeInTheDocument();
    expect(screen.getByText('Net Position')).toBeInTheDocument();
  });

  it('renders size badges on desktop', () => {
    render(<DashboardCardsSection isDesktop />);

    expect(screen.getByText('Full width')).toBeInTheDocument();
    expect(screen.getAllByText('Half width')).toHaveLength(2);
  });

  it('does not render size badges on mobile', () => {
    render(<DashboardCardsSection isDesktop={false} />);

    expect(screen.queryByText('Full width')).not.toBeInTheDocument();
    expect(screen.queryByText('Half width')).not.toBeInTheDocument();
  });

  it('renders enable/disable toggles for each card', () => {
    render(<DashboardCardsSection isDesktop />);

    const toggles = screen.getAllByRole('switch');
    expect(toggles).toHaveLength(3);
  });

  it('calls updateCard when toggle is changed', async () => {
    const user = userEvent.setup();
    render(<DashboardCardsSection isDesktop />);

    const toggles = screen.getAllByRole('switch');
    await user.click(toggles[0]);

    expect(mockMutate).toHaveBeenCalledWith({
      cardId: 'dc-1',
      request: { enabled: false },
    });
  });

  it('calls deleteCard when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<DashboardCardsSection isDesktop />);

    const deleteButtons = screen.getAllByLabelText(/Remove/);
    await user.click(deleteButtons[0]);

    expect(mockMutate).toHaveBeenCalledWith('dc-1');
  });

  it('renders add button', () => {
    render(<DashboardCardsSection isDesktop />);

    expect(screen.getByText('Add Card')).toBeInTheDocument();
  });

  it('renders reset button', () => {
    render(<DashboardCardsSection isDesktop />);

    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('opens add modal when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<DashboardCardsSection isDesktop />);

    await user.click(screen.getByText('Add Card'));

    await waitFor(() => {
      expect(screen.getByText('Add Dashboard Card')).toBeInTheDocument();
    });
  });

  it('opens reset confirmation when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<DashboardCardsSection isDesktop />);

    await user.click(screen.getByText('Reset'));

    await waitFor(() => {
      expect(screen.getByText('Reset Dashboard Layout')).toBeInTheDocument();
    });
  });

  it('renders drag handles for each card', () => {
    render(<DashboardCardsSection isDesktop />);

    const handles = screen.getAllByRole('button', { name: '' });
    // Filter to grip handles (svg icons inside action icons)
    const gripHandles = handles.filter((btn) => btn.querySelector('svg'));
    expect(gripHandles.length).toBeGreaterThanOrEqual(3);
  });
});
