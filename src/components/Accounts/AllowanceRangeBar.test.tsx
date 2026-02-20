import { describe, expect, it } from 'vitest';
import { buildAllowanceRangeModel } from './AllowanceRangeBar';

const DECIMAL_PLACES = 2; // USD / EUR (unit = 100 cents)

describe('buildAllowanceRangeModel', () => {
  it('normal case: current and projected both inside history', () => {
    const model = buildAllowanceRangeModel({
      currentBalance: -5000,
      nextTransferAmount: 10000,
      balancePerDay: [{ balance: -18000 }, { balance: 9000 }],
      decimalPlaces: DECIMAL_PLACES,
    });

    // projected = -5000 + 10000 = 5000
    // low  = min(-18000, 0, 5000) = -18000
    // high = max(9000, 0, 5000)   = 9000
    expect(model.low).toBe(-18000);
    expect(model.high).toBe(9000);
    expect(model.current).toBe(-5000);
    expect(model.projected).toBe(5000);

    // currentPct = ((-5000 - (-18000)) / 27000) * 100 ≈ 48.15
    expect(model.currentPct).toBeCloseTo(48.15, 1);

    // projectedPct = ((5000 - (-18000)) / 27000) * 100 ≈ 85.19
    expect(model.projectedPct).toBeCloseTo(85.19, 1);

    // zeroPct = ((0 - (-18000)) / 27000) * 100 ≈ 66.67
    expect(model.zeroPct).toBeCloseTo(66.67, 1);
  });

  it('current below 0, projected above 0', () => {
    const model = buildAllowanceRangeModel({
      currentBalance: -5000,
      nextTransferAmount: 10000,
      balancePerDay: [],
      decimalPlaces: DECIMAL_PLACES,
    });

    // history empty → base = [-5000]
    // projected = 5000
    // low  = min(-5000, 0, 5000) = -5000
    // high = max(-5000, 0, 5000) = 5000
    expect(model.low).toBe(-5000);
    expect(model.high).toBe(5000);
    expect(model.projected).toBe(5000);

    // currentPct = 0  (at the left edge)
    expect(model.currentPct).toBe(0);
    // projectedPct = 100 (at the right edge)
    expect(model.projectedPct).toBe(100);
    // zeroPct = 50
    expect(model.zeroPct).toBe(50);
  });

  it('no next transfer: projected is null', () => {
    const model = buildAllowanceRangeModel({
      currentBalance: 4000,
      nextTransferAmount: undefined,
      balancePerDay: [{ balance: -11000 }, { balance: 14000 }],
      decimalPlaces: DECIMAL_PLACES,
    });

    expect(model.projected).toBeNull();
    expect(model.projectedPct).toBeNull();
    // bounds derived without projected
    // low  = min(-11000, 0, 4000) = -11000
    // high = max(14000, 0, 4000)  = 14000
    expect(model.low).toBe(-11000);
    expect(model.high).toBe(14000);
  });

  it('no history data: falls back to currentBalance', () => {
    const model = buildAllowanceRangeModel({
      currentBalance: 3000,
      nextTransferAmount: undefined,
      balancePerDay: [],
      decimalPlaces: DECIMAL_PLACES,
    });

    // base = [3000], histLow = histHigh = 3000
    // projected = null, so use currentBalance for min/max
    // low  = min(3000, 0, 3000) = 0
    // high = max(3000, 0, 3000) = 3000
    expect(model.low).toBe(0);
    expect(model.high).toBe(3000);
  });

  it('flat history (all equal): range is expanded by one currency unit', () => {
    const model = buildAllowanceRangeModel({
      currentBalance: 5000,
      nextTransferAmount: undefined,
      balancePerDay: [{ balance: 5000 }, { balance: 5000 }, { balance: 5000 }],
      decimalPlaces: DECIMAL_PLACES,
    });

    // histLow = histHigh = 5000
    // low  = min(5000, 0, 5000) = 0
    // high = max(5000, 0, 5000) = 5000
    // low !== high, so no expansion needed here
    expect(model.low).toBe(0);
    expect(model.high).toBe(5000);
  });

  it('all values at zero triggers artificial expansion', () => {
    // unit = 10^2 = 100
    const model = buildAllowanceRangeModel({
      currentBalance: 0,
      nextTransferAmount: undefined,
      balancePerDay: [],
      decimalPlaces: DECIMAL_PLACES,
    });

    // base = [0], histLow = histHigh = 0
    // low = min(0, 0, 0) = 0, high = max(0, 0, 0) = 0 → low === high
    // unit = 100 → low = -100, high = 100
    expect(model.low).toBe(-100);
    expect(model.high).toBe(100);
    expect(model.zeroPct).toBe(50);
    expect(model.currentPct).toBe(50);
  });

  it('very negative projected: low expands to projected', () => {
    const model = buildAllowanceRangeModel({
      currentBalance: -5000,
      nextTransferAmount: -20000,
      balancePerDay: [{ balance: -1000 }, { balance: 2000 }],
      decimalPlaces: DECIMAL_PLACES,
    });

    // projected = -5000 + (-20000) = -25000
    // low  = min(-1000, 0, -25000) = -25000
    // high = max(2000, 0, -25000)  = 2000
    expect(model.low).toBe(-25000);
    expect(model.high).toBe(2000);
    expect(model.projected).toBe(-25000);
    expect(model.projectedPct).toBe(0);
  });

  it('very positive projected: high expands to projected', () => {
    const model = buildAllowanceRangeModel({
      currentBalance: 1000,
      nextTransferAmount: 50000,
      balancePerDay: [{ balance: 500 }, { balance: 2000 }],
      decimalPlaces: DECIMAL_PLACES,
    });

    // projected = 1000 + 50000 = 51000
    // low  = min(500, 0, 51000) = 0
    // high = max(2000, 0, 51000) = 51000
    expect(model.low).toBe(0);
    expect(model.high).toBe(51000);
    expect(model.projected).toBe(51000);
    expect(model.projectedPct).toBe(100);
  });

  it('currency with 0 decimal places uses unit=1 for expansion', () => {
    const model = buildAllowanceRangeModel({
      currentBalance: 0,
      nextTransferAmount: undefined,
      balancePerDay: [],
      decimalPlaces: 0,
    });

    // unit = 10^0 = 1
    expect(model.low).toBe(-1);
    expect(model.high).toBe(1);
  });

  it('currency with 3 decimal places uses unit=1000 for expansion', () => {
    const model = buildAllowanceRangeModel({
      currentBalance: 0,
      nextTransferAmount: undefined,
      balancePerDay: [],
      decimalPlaces: 3,
    });

    // unit = 10^3 = 1000
    expect(model.low).toBe(-1000);
    expect(model.high).toBe(1000);
  });

  it('toPercent clamps markers to [0, 100]', () => {
    const model = buildAllowanceRangeModel({
      currentBalance: 5000,
      nextTransferAmount: undefined,
      balancePerDay: [{ balance: 1000 }, { balance: 4000 }],
      decimalPlaces: DECIMAL_PLACES,
    });

    // low  = min(1000, 0, 5000) = 0
    // high = max(4000, 0, 5000) = 5000
    // currentBalance = 5000 → at exact right edge
    expect(model.currentPct).toBe(100);
    expect(model.zeroPct).toBe(0);
  });
});
