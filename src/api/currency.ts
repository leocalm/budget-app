import { CurrencyResponse } from '@/types/account';
import { apiGet } from './client';

export async function fetchCurrencies(): Promise<CurrencyResponse[]> {
  return apiGet<CurrencyResponse[]>('/api/currency/');
}
