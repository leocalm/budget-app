import { describe, expect, it } from 'vitest';
import { CARD_REGISTRY } from './cardRegistry';

describe('CARD_REGISTRY', () => {
  const globalCardTypes = [
    'current_period',
    'budget_stability',
    'net_position',
    'recent_transactions',
    'top_categories',
    'budget_per_day',
    'remaining_budget',
    'balance_over_time',
  ];

  const entityCardTypes = ['account_summary', 'category_breakdown'];

  it('contains all expected global card types', () => {
    for (const cardType of globalCardTypes) {
      expect(CARD_REGISTRY[cardType]).toBeDefined();
    }
  });

  it('contains all expected entity card types', () => {
    for (const cardType of entityCardTypes) {
      expect(CARD_REGISTRY[cardType]).toBeDefined();
    }
  });

  it('has no unexpected card types', () => {
    const allExpected = [...globalCardTypes, ...entityCardTypes];
    const registryKeys = Object.keys(CARD_REGISTRY);
    expect(registryKeys.sort()).toEqual(allExpected.sort());
  });

  it('every entry has a component', () => {
    for (const [key, def] of Object.entries(CARD_REGISTRY)) {
      expect(def.component, `${key} missing component`).toBeDefined();
      expect(typeof def.component).toBe('function');
    }
  });

  it('every entry has a labelKey', () => {
    for (const [key, def] of Object.entries(CARD_REGISTRY)) {
      expect(def.labelKey, `${key} missing labelKey`).toBeTruthy();
      expect(def.labelKey).toMatch(/^dashboard\.cards\./);
    }
  });

  it('every entry has a valid defaultSize', () => {
    for (const [key, def] of Object.entries(CARD_REGISTRY)) {
      expect(['half', 'full'], `${key} invalid defaultSize`).toContain(def.defaultSize);
    }
  });

  it('cardType matches the registry key', () => {
    for (const [key, def] of Object.entries(CARD_REGISTRY)) {
      expect(def.cardType).toBe(key);
    }
  });

  it('global cards do not require entity', () => {
    for (const cardType of globalCardTypes) {
      expect(CARD_REGISTRY[cardType].requiresEntity).toBe(false);
    }
  });

  it('entity cards require entity and have entityType', () => {
    for (const cardType of entityCardTypes) {
      const def = CARD_REGISTRY[cardType];
      expect(def.requiresEntity).toBe(true);
      expect(def.entityType).toBeDefined();
      expect(['account', 'category']).toContain(def.entityType);
    }
  });

  it('account_summary has entityType account', () => {
    expect(CARD_REGISTRY.account_summary.entityType).toBe('account');
  });

  it('category_breakdown has entityType category', () => {
    expect(CARD_REGISTRY.category_breakdown.entityType).toBe('category');
  });

  it('full-width cards have expected sizes', () => {
    expect(CARD_REGISTRY.current_period.defaultSize).toBe('full');
    expect(CARD_REGISTRY.recent_transactions.defaultSize).toBe('full');
    expect(CARD_REGISTRY.balance_over_time.defaultSize).toBe('full');
  });

  it('half-width cards have expected sizes', () => {
    const halfCards = [
      'budget_stability',
      'net_position',
      'top_categories',
      'budget_per_day',
      'remaining_budget',
      'account_summary',
      'category_breakdown',
    ];
    for (const cardType of halfCards) {
      expect(CARD_REGISTRY[cardType].defaultSize, `${cardType} should be half`).toBe('half');
    }
  });
});
