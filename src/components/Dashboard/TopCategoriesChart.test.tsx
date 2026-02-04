import React from 'react';
import { render, screen } from '@testing-library/react';
import { SpentPerCategory } from '@/types/dashboard';
import { TopCategoriesChart } from './TopCategoriesChart';

describe('TopCategoriesChart', () => {
  it('renders category amounts converted from cents to display values', () => {
    const data: SpentPerCategory[] = [
      { categoryName: 'Food', budgetedValue: 0, amountSpent: 12345, percentageSpent: 0 },
      { categoryName: 'Transport', budgetedValue: 0, amountSpent: 6789, percentageSpent: 0 },
    ];

    render(<TopCategoriesChart data={data} />);

    // 12345 cents -> 123.45 display
    expect(screen.getByText(/€123\.45/)).toBeInTheDocument();
    // 6789 cents -> 67.89 display
    expect(screen.getByText(/€67\.89/)).toBeInTheDocument();
  });
});
