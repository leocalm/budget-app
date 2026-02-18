import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@/test-utils';
import { CurrencyResponse } from '@/types/account';
import { NetPositionCard } from './NetPositionCard';

const EUR_CURRENCY: CurrencyResponse = {
  id: 'eur',
  name: 'Euro',
  symbol: 'EUR',
  currency: 'EUR',
  decimalPlaces: 2,
};

describe('NetPositionCard', () => {
  it('renders loading state', () => {
    render(
      <NetPositionCard
        isLoading
        isError={false}
        onRetry={() => {}}
        currency={EUR_CURRENCY}
        locale="en-US"
      />
    );

    expect(screen.getByTestId('net-position-loading')).toBeInTheDocument();
  });

  it('renders error state with retry action', () => {
    const onRetry = vi.fn();

    render(
      <NetPositionCard
        isLoading={false}
        isError
        onRetry={onRetry}
        currency={EUR_CURRENCY}
        locale="en-US"
      />
    );

    expect(screen.getByTestId('net-position-error')).toBeInTheDocument();
    const retryButton = screen.getByRole('button', { name: 'Retry' });
    retryButton.click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when there are no accounts', () => {
    render(
      <NetPositionCard
        data={{
          totalNetPosition: 0,
          changeThisPeriod: 0,
          liquidBalance: 0,
          protectedBalance: 0,
          debtBalance: 0,
          accountCount: 0,
        }}
        isLoading={false}
        isError={false}
        onRetry={() => {}}
        currency={EUR_CURRENCY}
        locale="en-US"
      />
    );

    expect(screen.getByTestId('net-position-empty')).toBeInTheDocument();
  });

  it('renders active state with signed period change and breakdown', () => {
    render(
      <NetPositionCard
        data={{
          totalNetPosition: 3032000,
          changeThisPeriod: 32000,
          liquidBalance: 1280000,
          protectedBalance: 1520000,
          debtBalance: -300000,
          accountCount: 4,
        }}
        isLoading={false}
        isError={false}
        onRetry={() => {}}
        currency={EUR_CURRENCY}
        locale="en-US"
      />
    );

    expect(screen.getByTestId('net-position-active')).toBeInTheDocument();
    expect(screen.getByText(/\+€320\.00 this period/)).toBeInTheDocument();
    expect(screen.getByText(/Liquid €12,800\.00/)).toBeInTheDocument();
    expect(screen.getByText(/Protected €15,200\.00/)).toBeInTheDocument();
    expect(screen.getByText(/Debt -€3,000\.00/)).toBeInTheDocument();
  });
});
