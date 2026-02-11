import { CurrencyResponse } from '@/types/account';
import { apiGet } from './client';

const KNOWN_CURRENCY_CODES = ['EUR', 'USD', 'GBP', 'JPY'] as const;

export type CurrencyCode = (typeof KNOWN_CURRENCY_CODES)[number];

export async function fetchCurrencyByCode(code: string): Promise<CurrencyResponse> {
  return apiGet<CurrencyResponse>(`/api/currency/${code}`);
}

export async function fetchCurrencies(): Promise<CurrencyResponse[]> {
  const results: CurrencyResponse[] = [];
  for (const code of KNOWN_CURRENCY_CODES) {
    try {
      const currency = await fetchCurrencyByCode(code);
      results.push(currency);
    } catch {
      // Ignore missing currencies
    }
  }
  return results;
}
