import { describe, expect, it } from 'vitest';
import { buildStandardRangeModel } from './StandardRangeBar';

const DECIMAL_PLACES = 2; // USD / EUR (unit = 100 cents)

describe('buildStandardRangeModel', () => {
  it('current inside range', () => {
    const model = buildStandardRangeModel({
      currentBalance: 452000,
      balancePerDay: [{ balance: 280000 }, { balance: 510000 }],
      decimalPlaces: DECIMAL_PLACES,
    });

    expect(model.low).toBe(280000);
    expect(model.high).toBe(510000);
    expect(model.isAboveHigh).toBe(false);
    expect(model.isBelowLow).toBe(false);
    expect(model.aboveDelta).toBe(0);
    expect(model.belowDelta).toBe(0);

    // currentPct = ((452000 - 280000) / 230000) * 100 ≈ 74.78
    expect(model.currentPct).toBeCloseTo(74.78, 1);
  });

  it('current above high: clamps to 100%, reports aboveDelta', () => {
    const model = buildStandardRangeModel({
      currentBalance: 548000,
      balancePerDay: [{ balance: 280000 }, { balance: 510000 }],
      decimalPlaces: DECIMAL_PLACES,
    });

    expect(model.isAboveHigh).toBe(true);
    expect(model.isBelowLow).toBe(false);
    expect(model.currentPct).toBe(100);
    // aboveDelta = 548000 - 510000 = 38000
    expect(model.aboveDelta).toBe(38000);
    expect(model.belowDelta).toBe(0);
  });

  it('current below low: clamps to 0%, reports belowDelta', () => {
    const model = buildStandardRangeModel({
      currentBalance: 240000,
      balancePerDay: [{ balance: 280000 }, { balance: 510000 }],
      decimalPlaces: DECIMAL_PLACES,
    });

    expect(model.isBelowLow).toBe(true);
    expect(model.isAboveHigh).toBe(false);
    expect(model.currentPct).toBe(0);
    // belowDelta = 280000 - 240000 = 40000
    expect(model.belowDelta).toBe(40000);
    expect(model.aboveDelta).toBe(0);
  });

  it('no history data: falls back to currentBalance, gets expanded range', () => {
    const model = buildStandardRangeModel({
      currentBalance: 100000,
      balancePerDay: [],
      decimalPlaces: DECIMAL_PLACES,
    });

    // base = [100000], low === high → expand by unit=100
    expect(model.low).toBe(100000 - 100);
    expect(model.high).toBe(100000 + 100);
    // current is at center after expansion
    expect(model.currentPct).toBeCloseTo(50, 0);
    expect(model.isAboveHigh).toBe(false);
    expect(model.isBelowLow).toBe(false);
  });

  it('flat history (all equal): range expanded by one currency unit', () => {
    const model = buildStandardRangeModel({
      currentBalance: 50000,
      balancePerDay: [{ balance: 50000 }, { balance: 50000 }, { balance: 50000 }],
      decimalPlaces: DECIMAL_PLACES,
    });

    expect(model.low).toBe(49900);
    expect(model.high).toBe(50100);
    expect(model.currentPct).toBeCloseTo(50, 0);
  });

  it('range crossing zero: zeroPct is computed and visible', () => {
    const model = buildStandardRangeModel({
      currentBalance: 5000,
      balancePerDay: [{ balance: -10000 }, { balance: 20000 }],
      decimalPlaces: DECIMAL_PLACES,
    });

    expect(model.low).toBe(-10000);
    expect(model.high).toBe(20000);
    expect(model.zeroPct).not.toBeNull();
    // zeroPct = ((0 - (-10000)) / 30000) * 100 ≈ 33.33
    expect(model.zeroPct).toBeCloseTo(33.33, 1);
  });

  it('range entirely positive: zeroPct is null', () => {
    const model = buildStandardRangeModel({
      currentBalance: 300000,
      balancePerDay: [{ balance: 280000 }, { balance: 510000 }],
      decimalPlaces: DECIMAL_PLACES,
    });

    expect(model.zeroPct).toBeNull();
  });

  it('range entirely negative: zeroPct is null', () => {
    const model = buildStandardRangeModel({
      currentBalance: -5000,
      balancePerDay: [{ balance: -20000 }, { balance: -1000 }],
      decimalPlaces: DECIMAL_PLACES,
    });

    expect(model.zeroPct).toBeNull();
  });

  it('currency with 0 decimal places: expansion unit = 1', () => {
    const model = buildStandardRangeModel({
      currentBalance: 500,
      balancePerDay: [{ balance: 500 }],
      decimalPlaces: 0,
    });

    expect(model.low).toBe(499);
    expect(model.high).toBe(501);
  });

  it('currency with 3 decimal places: expansion unit = 1000', () => {
    const model = buildStandardRangeModel({
      currentBalance: 50000,
      balancePerDay: [{ balance: 50000 }],
      decimalPlaces: 3,
    });

    expect(model.low).toBe(49000);
    expect(model.high).toBe(51000);
  });

  it('only uses last 30 closes, ignores older history', () => {
    const older = Array.from({ length: 5 }, () => ({ balance: 999999 }));
    const recent = Array.from({ length: 30 }, (_, i) => ({ balance: 10000 + i * 100 }));
    const model = buildStandardRangeModel({
      currentBalance: 12000,
      balancePerDay: [...older, ...recent],
      decimalPlaces: DECIMAL_PLACES,
    });

    // low/high from recent slice only
    expect(model.low).toBe(10000);
    expect(model.high).toBe(12900);
  });
});
