import { describe, expect, it } from 'vitest';
import { CurrencyResponse } from './account';
import { Money } from './money';

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

describe('Money', () => {
  describe('constructor and basic getters', () => {
    it('should create a Money instance with cents and currency', () => {
      const money = new Money(1234, EUR);
      expect(money.toCents()).toBe(1234);
      expect(money.getCurrency()).toEqual(EUR);
    });

    it('should handle zero cents', () => {
      const money = new Money(0, EUR);
      expect(money.toCents()).toBe(0);
      expect(money.toDisplay()).toBe(0);
    });

    it('should handle negative cents', () => {
      const money = new Money(-1234, EUR);
      expect(money.toCents()).toBe(-1234);
      expect(money.toDisplay()).toBe(-12.34);
    });
  });

  describe('toDisplay', () => {
    it('should convert cents to display value for 2 decimal places (EUR)', () => {
      const money = new Money(1234, EUR);
      expect(money.toDisplay()).toBe(12.34);
    });

    it('should convert cents to display value for 0 decimal places (JPY)', () => {
      const money = new Money(1234, JPY);
      expect(money.toDisplay()).toBe(1234);
    });

    it('should convert cents to display value for 3 decimal places (BHD)', () => {
      const money = new Money(1234, BHD);
      expect(money.toDisplay()).toBe(1.234);
    });

    it('should handle large amounts', () => {
      const money = new Money(1000000, EUR);
      expect(money.toDisplay()).toBe(10000);
    });
  });

  describe('fromDisplay', () => {
    it('should create Money from display value for 2 decimal places', () => {
      const money = Money.fromDisplay(12.34, EUR);
      expect(money.toCents()).toBe(1234);
      expect(money.toDisplay()).toBe(12.34);
    });

    it('should create Money from display value for 0 decimal places', () => {
      const money = Money.fromDisplay(1234, JPY);
      expect(money.toCents()).toBe(1234);
      expect(money.toDisplay()).toBe(1234);
    });

    it('should create Money from display value for 3 decimal places', () => {
      const money = Money.fromDisplay(1.234, BHD);
      expect(money.toCents()).toBe(1234);
      expect(money.toDisplay()).toBe(1.234);
    });

    it('should round properly when converting from display', () => {
      const money = Money.fromDisplay(12.345, EUR);
      expect(money.toCents()).toBe(1235);
      expect(money.toDisplay()).toBe(12.35);
    });

    it('should handle negative values', () => {
      const money = Money.fromDisplay(-12.34, EUR);
      expect(money.toCents()).toBe(-1234);
      expect(money.toDisplay()).toBe(-12.34);
    });
  });

  describe('format', () => {
    it('should format EUR with default locale', () => {
      const money = new Money(1234, EUR);
      const formatted = money.format();
      expect(formatted).toMatch(/12[.,]34/);
    });

    it('should format with en-US locale', () => {
      const money = new Money(1234, EUR);
      const formatted = money.format('en-US');
      expect(formatted).toBe('€12.34');
    });

    it('should format with pt-BR locale', () => {
      const money = new Money(1234, EUR);
      const formatted = money.format('pt-BR');
      expect(formatted).toMatch(/12,34/);
    });

    it('should format JPY without decimal places', () => {
      const money = new Money(1234, JPY);
      const formatted = money.format('en-US');
      expect(formatted).toBe('¥1,234');
    });

    it('should format negative amounts', () => {
      const money = new Money(-1234, EUR);
      const formatted = money.format('en-US');
      expect(formatted).toMatch(/-/);
      expect(formatted).toMatch(/12[.,]34/);
    });

    it('should format large amounts with thousands separator', () => {
      const money = new Money(1234567, EUR);
      const formatted = money.format('en-US');
      expect(formatted).toBe('€12,345.67');
    });
  });

  describe('formatValue', () => {
    it('should format value without currency symbol', () => {
      const money = new Money(1234, EUR);
      const formatted = money.formatValue('en-US');
      expect(formatted).toBe('12.34');
    });

    it('should format JPY value without decimals', () => {
      const money = new Money(1234, JPY);
      const formatted = money.formatValue('en-US');
      expect(formatted).toBe('1,234');
    });

    it('should format with locale-specific decimal separator', () => {
      const money = new Money(1234, EUR);
      const formatted = money.formatValue('pt-BR');
      expect(formatted).toBe('12,34');
    });
  });

  describe('edge cases', () => {
    it('should handle very small amounts', () => {
      const money = new Money(1, EUR);
      expect(money.toDisplay()).toBe(0.01);
    });

    it('should handle floating point precision issues', () => {
      const money = Money.fromDisplay(0.1 + 0.2, EUR);
      expect(money.toCents()).toBe(30);
    });

    it('should maintain precision through round-trip conversion', () => {
      const original = 12.34;
      const money = Money.fromDisplay(original, EUR);
      const result = money.toDisplay();
      expect(result).toBe(original);
    });
  });
});
