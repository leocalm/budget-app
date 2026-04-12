import { useMemo } from 'react';
import { CurrencyResponse } from '@/types/account';
import { useCurrencies } from './v2/useCurrencies';
import { useProfile } from './v2/useSettings';

const DEFAULT_CURRENCY: CurrencyResponse = {
  id: 'default',
  name: 'Euro',
  symbol: '€',
  currency: 'EUR',
  decimalPlaces: 2,
};

export const useDisplayCurrency = (): CurrencyResponse => {
  const { data: profile } = useProfile();
  const { data: currencies } = useCurrencies();

  const currencyCode = profile?.currency;

  return useMemo(() => {
    if (!currencyCode || !currencies) {
      return DEFAULT_CURRENCY;
    }

    const selectedCurrency = currencies.find((c) => c.code === currencyCode);
    if (!selectedCurrency) {
      return DEFAULT_CURRENCY;
    }

    return {
      id: selectedCurrency.id,
      name: selectedCurrency.name,
      symbol: selectedCurrency.symbol,
      currency: selectedCurrency.code,
      decimalPlaces: selectedCurrency.decimalPlaces,
    };
  }, [currencyCode, currencies]);
};
