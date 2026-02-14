import { useTranslation } from 'react-i18next';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { CurrencyResponse } from '@/types/account';
import { formatCurrencyValue } from '@/utils/currency';

interface CurrencyValueProps {
  /**
   * Optional override for currency. If not provided, uses the global display currency.
   */
  currency?: CurrencyResponse | undefined;
  /**
   * Amount in smallest currency unit (cents)
   */
  cents: number;
  /**
   * Show currency symbol (default: true)
   */
  showSymbol?: boolean;
  /**
   * Use compact formatting for large numbers (default: false)
   */
  compact?: boolean;
  /**
   * Custom locale override (uses i18next locale by default)
   */
  locale?: string;
  /**
   * Force using the global display currency even if a specific currency is provided.
   * Useful for single-currency view modes.
   */
  forceGlobal?: boolean;
}

export const CurrencyValue = ({
  currency: propCurrency,
  cents,
  showSymbol = true,
  compact = false,
  locale: customLocale,
  forceGlobal = true, // Defaulting to true as per "single currency" requirement
}: CurrencyValueProps) => {
  const { i18n } = useTranslation();
  const globalCurrency = useDisplayCurrency();

  // Decide which currency to use:
  // 1. If forceGlobal is true, always use globalCurrency
  // 2. Else if propCurrency is provided, use it
  // 3. Fallback to globalCurrency
  const currency = forceGlobal || !propCurrency ? globalCurrency : propCurrency;

  const locale = customLocale ?? i18n.language;
  const currencySymbol = currency?.symbol ?? '€';
  const decimalPlaces = currency?.decimalPlaces ?? 2;

  const formattedValue = formatCurrencyValue(cents, decimalPlaces, locale);

  if (compact && Math.abs(cents) >= 1000000) {
    const displayValue = cents / 10 ** decimalPlaces;
    const compactValue = new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(displayValue);
    return (
      <>
        {showSymbol && (
          <>
            {currencySymbol}
            &nbsp;
          </>
        )}
        {compactValue}
      </>
    );
  }

  return (
    <>
      {showSymbol && (
        <>
          {currencySymbol}
          &nbsp;
        </>
      )}
      {formattedValue}
    </>
  );
};
