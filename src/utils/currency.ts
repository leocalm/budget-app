import { CurrencyResponse } from '@/types/account';

/**
 * Converts amount in smallest currency unit (cents) to display value
 * @param cents - Amount in smallest unit
 * @param decimalPlaces - Number of decimal places for the currency (default: 2)
 * @returns Display value (e.g., 1234 cents with 2 decimal places = 12.34)
 */
export function convertCentsToDisplay(cents: number, decimalPlaces: number = 2): number {
  return cents / 10 ** decimalPlaces;
}

/**
 * Converts display value to smallest currency unit (cents)
 * @param displayValue - Value in display format
 * @param decimalPlaces - Number of decimal places for the currency (default: 2)
 * @returns Amount in smallest currency unit
 */
export function convertDisplayToCents(displayValue: number, decimalPlaces: number = 2): number {
  return Math.round(displayValue * 10 ** decimalPlaces);
}

/**
 * Formats amount in cents as localized currency string with symbol
 * @param cents - Amount in smallest currency unit
 * @param currency - Currency information including symbol and decimal places
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted currency string (e.g., "$12.34")
 */
export function formatCurrency(
  cents: number,
  currency: CurrencyResponse,
  locale: string = 'en-US'
): string {
  const displayValue = convertCentsToDisplay(cents, currency.decimalPlaces);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.currency,
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  }).format(displayValue);
}

/**
 * Formats amount in cents as a number string with proper decimal places
 * @param cents - Amount in smallest currency unit
 * @param decimalPlaces - Number of decimal places (default: 2)
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted number string (e.g., "12.34")
 */
export function formatCurrencyValue(
  cents: number,
  decimalPlaces: number = 2,
  locale: string = 'en-US'
): string {
  const displayValue = convertCentsToDisplay(cents, decimalPlaces);
  return displayValue.toLocaleString(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
}

/**
 * Formats amount in cents with currency symbol (simple format)
 * @param cents - Amount in smallest currency unit
 * @param symbol - Currency symbol (e.g., "$", "€")
 * @param decimalPlaces - Number of decimal places (default: 2)
 * @param locale - Locale for number formatting (default: 'en-US')
 * @returns Formatted string with symbol (e.g., "$ 12.34")
 */
export function formatCurrencyWithSymbol(
  cents: number,
  symbol: string,
  decimalPlaces: number = 2,
  locale: string = 'en-US'
): string {
  const value = formatCurrencyValue(cents, decimalPlaces, locale);
  return `${symbol} ${value}`;
}
