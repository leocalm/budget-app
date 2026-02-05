import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CurrencyValue } from './CurrencyValue';

describe('CurrencyValue', () => {
  it('renders with symbol and formatted value', () => {
    const { container } = render(
      <CurrencyValue
        currency={{ id: 'usd', name: 'USD', symbol: '$', currency: 'USD', decimalPlaces: 2 }}
        cents={1234}
        locale="en"
      />
    );

    expect(container.textContent).toContain('$');
    expect(container.textContent).toContain('12.34');
  });

  it('renders compact value when enabled', () => {
    const { container } = render(
      <CurrencyValue
        currency={{ id: 'usd', name: 'USD', symbol: '$', currency: 'USD', decimalPlaces: 2 }}
        cents={120000000}
        locale="en"
        showSymbol={false}
        compact
      />
    );

    expect(container.textContent).toMatch(/1\.2/);
    expect(container.textContent).toContain('M');
  });

  it('falls back to euro symbol when currency is undefined', () => {
    const { container } = render(<CurrencyValue currency={undefined} cents={1000} locale="en" />);

    expect(container.textContent).toContain('€');
    expect(container.textContent).toContain('10.00');
  });
});
