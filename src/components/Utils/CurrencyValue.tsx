import { useTranslation } from 'react-i18next';
import { CurrencyResponse } from '@/types/account';
import { formatCurrencyValue } from '@/utils/currency';

interface CurrencyValueProps {
  currency: CurrencyResponse | undefined;
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
}

export const CurrencyValue = ({
  currency,
  cents,
  showSymbol = true,
  compact = false,
  locale: customLocale,
}: CurrencyValueProps) => {
  const { i18n } = useTranslation();
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
