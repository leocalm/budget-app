import type { ComponentType } from 'react';
import type { CardSize } from '@/types/dashboardLayout';
import { BalanceLineChartAdapter } from './adapters/BalanceLineChartAdapter';
import { BudgetPerDayAdapter } from './adapters/BudgetPerDayAdapter';
import { BudgetStabilityCardAdapter } from './adapters/BudgetStabilityCardAdapter';
import { CurrentPeriodCardAdapter } from './adapters/CurrentPeriodCardAdapter';
import { NetPositionCardAdapter } from './adapters/NetPositionCardAdapter';
import { RecentActivityAdapter } from './adapters/RecentActivityAdapter';
import { RemainingBudgetAdapter } from './adapters/RemainingBudgetAdapter';
import { TopCategoriesChartAdapter } from './adapters/TopCategoriesChartAdapter';

export interface CardProps {
  selectedPeriodId: string | null;
  entityId?: string;
  size: CardSize;
}

export interface CardDefinition {
  cardType: string;
  component: ComponentType<CardProps>;
  defaultSize: CardSize;
  labelKey: string;
  requiresEntity: boolean;
  entityType?: 'account' | 'category' | 'vendor';
  requiresPeriod: boolean;
}

export const CARD_REGISTRY: Record<string, CardDefinition> = {
  current_period: {
    cardType: 'current_period',
    component: CurrentPeriodCardAdapter,
    defaultSize: 'full',
    labelKey: 'dashboard.cards.currentPeriod',
    requiresEntity: false,
    requiresPeriod: true,
  },
  budget_stability: {
    cardType: 'budget_stability',
    component: BudgetStabilityCardAdapter,
    defaultSize: 'half',
    labelKey: 'dashboard.cards.budgetStability',
    requiresEntity: false,
    requiresPeriod: false,
  },
  net_position: {
    cardType: 'net_position',
    component: NetPositionCardAdapter,
    defaultSize: 'half',
    labelKey: 'dashboard.cards.netPosition',
    requiresEntity: false,
    requiresPeriod: true,
  },
  recent_transactions: {
    cardType: 'recent_transactions',
    component: RecentActivityAdapter,
    defaultSize: 'full',
    labelKey: 'dashboard.cards.recentTransactions',
    requiresEntity: false,
    requiresPeriod: true,
  },
  top_categories: {
    cardType: 'top_categories',
    component: TopCategoriesChartAdapter,
    defaultSize: 'half',
    labelKey: 'dashboard.cards.topCategories',
    requiresEntity: false,
    requiresPeriod: true,
  },
  budget_per_day: {
    cardType: 'budget_per_day',
    component: BudgetPerDayAdapter,
    defaultSize: 'half',
    labelKey: 'dashboard.cards.budgetPerDay',
    requiresEntity: false,
    requiresPeriod: true,
  },
  remaining_budget: {
    cardType: 'remaining_budget',
    component: RemainingBudgetAdapter,
    defaultSize: 'half',
    labelKey: 'dashboard.cards.remainingBudget',
    requiresEntity: false,
    requiresPeriod: true,
  },
  balance_over_time: {
    cardType: 'balance_over_time',
    component: BalanceLineChartAdapter,
    defaultSize: 'full',
    labelKey: 'dashboard.cards.balanceOverTime',
    requiresEntity: false,
    requiresPeriod: true,
  },
};
