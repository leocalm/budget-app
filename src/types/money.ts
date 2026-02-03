import { CurrencyResponse } from './account';

/**
 * Money class for handling currency amounts with proper decimal place conversion.
 * Stores amounts in smallest currency unit (e.g., cents) and provides methods for display and formatting.
 */
export class Money {
  private readonly cents: number;
  private readonly currency: CurrencyResponse;

  /**
   * Creates a Money instance
   * @param cents - Amount in smallest currency unit (e.g., cents)
   * @param currency - Currency information including decimal places
   */
  constructor(cents: number, currency: CurrencyResponse) {
    this.cents = cents;
    this.currency = currency;
  }

  /**
   * Converts smallest currency unit to display value
   * @returns Display value (e.g., 1234 cents with 2 decimal places = 12.34)
   */
  toDisplay(): number {
    return this.cents / 10 ** this.currency.decimalPlaces;
  }

  /**
   * Returns the raw value in smallest currency unit
   * @returns Amount in cents
   */
  toCents(): number {
    return this.cents;
  }

  /**
   * Formats the amount as a localized currency string
   * @param locale - Locale for formatting (e.g., 'en-US', 'pt-BR')
   * @param options - Additional Intl.NumberFormat options
   * @returns Formatted currency string with symbol
   */
  format(
    locale: string = 'en-US',
    options?: Omit<Intl.NumberFormatOptions, 'style' | 'currency'>
  ): string {
    const displayValue = this.toDisplay();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency.currency,
      minimumFractionDigits: this.currency.decimalPlaces,
      maximumFractionDigits: this.currency.decimalPlaces,
      ...options,
    }).format(displayValue);
  }

  /**
   * Formats the amount without currency symbol
   * @param locale - Locale for formatting
   * @returns Formatted number string
   */
  formatValue(locale: string = 'en-US'): string {
    const displayValue = this.toDisplay();
    return displayValue.toLocaleString(locale, {
      minimumFractionDigits: this.currency.decimalPlaces,
      maximumFractionDigits: this.currency.decimalPlaces,
    });
  }

  /**
   * Creates a Money instance from a display value
   * @param displayValue - Value in display format (e.g., 12.34)
   * @param currency - Currency information
   * @returns Money instance
   */
  static fromDisplay(displayValue: number, currency: CurrencyResponse): Money {
    const cents = Math.round(displayValue * 10 ** currency.decimalPlaces);
    return new Money(cents, currency);
  }

  /**
   * Returns the currency information
   */
  getCurrency(): CurrencyResponse {
    return this.currency;
  }
}
