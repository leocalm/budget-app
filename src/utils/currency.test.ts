import { describe, expect, it } from 'vitest';
import { CurrencyResponse } from '@/types/account';
import {
  convertCentsToDisplay,
  convertDisplayToCents,
  formatCurrency,
  formatCurrencyValue,
  formatCurrencyWithSymbol,
} from './currency';

const EUR: CurrencyResponse = {
  id: '1',
  name: 'Euro',
  symbol: '€',
  currency: 'EUR',
  decimalPlaces: 2,
};

const JPY: CurrencyResponse = {
  id: '2',
  name: 'Japanese Yen',
  symbol: '¥',
  currency: 'JPY',
  decimalPlaces: 0,
};

const BHD: CurrencyResponse = {
  id: '3',
  name: 'Bahraini Dinar',
  symbol: 'BD',
  currency: 'BHD',
  decimalPlaces: 3,
};

describe('currency utilities', () => {
  describe('convertCentsToDisplay', () => {
    it('should convert cents to display value with default 2 decimal places', () => {
      expect(convertCentsToDisplay(1234)).toBe(12.34);
      expect(convertCentsToDisplay(100)).toBe(1);
      expect(convertCentsToDisplay(0)).toBe(0);
    });

    it('should convert with custom decimal places', () => {
      expect(convertCentsToDisplay(1234, 0)).toBe(1234);
      expect(convertCentsToDisplay(1234, 3)).toBe(1.234);
      expect(convertCentsToDisplay(1234, 4)).toBe(0.1234);
    });

    it('should handle negative values', () => {
      expect(convertCentsToDisplay(-1234)).toBe(-12.34);
      expect(convertCentsToDisplay(-1234, 0)).toBe(-1234);
    });

    it('should handle large amounts', () => {
      expect(convertCentsToDisplay(1000000)).toBe(10000);
      expect(convertCentsToDisplay(999999999)).toBe(9999999.99);
    });
  });

  describe('convertDisplayToCents', () => {
    it('should convert display value to cents with default 2 decimal places', () => {
      expect(convertDisplayToCents(12.34)).toBe(1234);
      expect(convertDisplayToCents(1)).toBe(100);
      expect(convertDisplayToCents(0)).toBe(0);
    });

    it('should convert with custom decimal places', () => {
      expect(convertDisplayToCents(1234, 0)).toBe(1234);
      expect(convertDisplayToCents(1.234, 3)).toBe(1234);
      expect(convertDisplayToCents(0.1234, 4)).toBe(1234);
    });

    it('should round properly', () => {
      expect(convertDisplayToCents(12.345)).toBe(1235);
      expect(convertDisplayToCents(12.344)).toBe(1234);
      expect(convertDisplayToCents(12.346)).toBe(1235);
    });

    it('should handle negative values', () => {
      expect(convertDisplayToCents(-12.34)).toBe(-1234);
      expect(convertDisplayToCents(-1234, 0)).toBe(-1234);
    });

    it('should handle floating point precision issues', () => {
      expect(convertDisplayToCents(0.1 + 0.2)).toBe(30);
    });
  });

  describe('formatCurrency', () => {
    it('should format EUR with symbol and decimal places', () => {
      const result = formatCurrency(1234, EUR, 'en-US');
      expect(result).toBe('€12.34');
    });

    it('should format JPY without decimal places', () => {
      const result = formatCurrency(1234, JPY, 'en-US');
      expect(result).toBe('¥1,234');
    });

    it('should format BHD with 3 decimal places', () => {
      const result = formatCurrency(1234, BHD, 'en-US');
      expect(result).toMatch(/1[.,]234/);
    });

    it('should format with different locales', () => {
      const resultUS = formatCurrency(1234, EUR, 'en-US');
      expect(resultUS).toContain('12.34');

      const resultBR = formatCurrency(1234, EUR, 'pt-BR');
      expect(resultBR).toContain('12,34');
    });

    it('should format negative amounts', () => {
      const result = formatCurrency(-1234, EUR, 'en-US');
      expect(result).toMatch(/-.*12[.,]34/);
    });

    it('should format large amounts with thousands separator', () => {
      const result = formatCurrency(1234567, EUR, 'en-US');
      expect(result).toBe('€12,345.67');
    });

    it('should default to en-US locale when not specified', () => {
      const result = formatCurrency(1234, EUR);
      expect(result).toBe('€12.34');
    });
  });

  describe('formatCurrencyValue', () => {
    it('should format value without currency symbol', () => {
      expect(formatCurrencyValue(1234)).toBe('12.34');
      expect(formatCurrencyValue(1234, 2, 'en-US')).toBe('12.34');
    });

    it('should format with different decimal places', () => {
      expect(formatCurrencyValue(1234, 0)).toBe('1,234');
      expect(formatCurrencyValue(1234, 3)).toBe('1.234');
    });

    it('should format with different locales', () => {
      expect(formatCurrencyValue(1234, 2, 'en-US')).toBe('12.34');
      expect(formatCurrencyValue(1234, 2, 'pt-BR')).toBe('12,34');
      expect(formatCurrencyValue(1234, 2, 'de-DE')).toBe('12,34');
    });

    it('should handle negative values', () => {
      expect(formatCurrencyValue(-1234)).toBe('-12.34');
    });

    it('should handle zero', () => {
      expect(formatCurrencyValue(0)).toBe('0.00');
    });

    it('should add thousands separator for large amounts', () => {
      expect(formatCurrencyValue(1234567, 2, 'en-US')).toBe('12,345.67');
    });
  });

  describe('formatCurrencyWithSymbol', () => {
    it('should format with symbol and value', () => {
      expect(formatCurrencyWithSymbol(1234, '€')).toBe('€ 12.34');
      expect(formatCurrencyWithSymbol(1234, '$')).toBe('$ 12.34');
    });

    it('should format with different decimal places', () => {
      expect(formatCurrencyWithSymbol(1234, '¥', 0)).toBe('¥ 1,234');
      expect(formatCurrencyWithSymbol(1234, 'BD', 3)).toBe('BD 1.234');
    });

    it('should format with different locales', () => {
      expect(formatCurrencyWithSymbol(1234, '€', 2, 'en-US')).toBe('€ 12.34');
      expect(formatCurrencyWithSymbol(1234, '€', 2, 'pt-BR')).toBe('€ 12,34');
    });

    it('should handle negative values', () => {
      expect(formatCurrencyWithSymbol(-1234, '€')).toBe('€ -12.34');
    });

    it('should handle zero', () => {
      expect(formatCurrencyWithSymbol(0, '$')).toBe('$ 0.00');
    });
  });

  describe('round-trip conversions', () => {
    it('should maintain value through display->cents->display conversion', () => {
      const original = 12.34;
      const cents = convertDisplayToCents(original);
      const result = convertCentsToDisplay(cents);
      expect(result).toBe(original);
    });

    it('should maintain value for different decimal places', () => {
      const testCases = [
        { value: 1234, decimals: 0 },
        { value: 12.34, decimals: 2 },
        { value: 1.234, decimals: 3 },
      ];

      testCases.forEach(({ value, decimals }) => {
        const cents = convertDisplayToCents(value, decimals);
        const result = convertCentsToDisplay(cents, decimals);
        expect(result).toBeCloseTo(value, decimals);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle very small amounts', () => {
      expect(convertCentsToDisplay(1)).toBe(0.01);
      expect(convertDisplayToCents(0.01)).toBe(1);
    });

    it('should handle very large amounts', () => {
      expect(convertCentsToDisplay(Number.MAX_SAFE_INTEGER, 2)).toBeGreaterThan(0);
    });

    it('should handle fractional cents with rounding', () => {
      expect(convertDisplayToCents(12.345)).toBe(1235);
      expect(convertDisplayToCents(12.344)).toBe(1234);
    });
  });
});
