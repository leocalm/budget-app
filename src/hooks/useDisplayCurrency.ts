import { useMemo } from 'react';
import { CurrencyResponse } from '@/types/account';
import { useCurrencies } from './useCurrencies';
import { useSettings } from './useSettings';

const DEFAULT_CURRENCY: CurrencyResponse = {
  id: 'default',
  name: 'Euro',
  symbol: '€',
  currency: 'EUR',
  decimalPlaces: 2,
};

export const useDisplayCurrency = (): CurrencyResponse => {
  const { data: settings } = useSettings();
  const { data: currencies } = useCurrencies();

  return useMemo(() => {
    if (!settings?.defaultCurrencyId || !currencies) {
      return DEFAULT_CURRENCY;
    }

    const selectedCurrency = currencies.find((c) => c.id === settings.defaultCurrencyId);
    return selectedCurrency || DEFAULT_CURRENCY;
  }, [settings?.defaultCurrencyId, currencies]);
};
