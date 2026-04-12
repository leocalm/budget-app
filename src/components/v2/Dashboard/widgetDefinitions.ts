export interface WidgetDefinition {
  id: string;
  emoji: string;
  /** i18n key for name (v2 namespace, e.g. 'settings.widgets.currentPeriod.name') */
  nameKey: string;
  /** i18n key for description */
  descKey: string;
  defaultVisible: boolean;
  isHero?: boolean;
}

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    id: 'current_period',
    emoji: '\u{1F4CA}',
    nameKey: 'settings.widgets.currentPeriod.name',
    descKey: 'settings.widgets.currentPeriod.description',
    defaultVisible: true,
    isHero: true,
  },
  {
    id: 'net_position',
    emoji: '\u{1F4B0}',
    nameKey: 'settings.widgets.netPosition.name',
    descKey: 'settings.widgets.netPosition.description',
    defaultVisible: true,
    isHero: true,
  },
  {
    id: 'cash_flow',
    emoji: '\u{1F4B8}',
    nameKey: 'settings.widgets.cashFlow.name',
    descKey: 'settings.widgets.cashFlow.description',
    defaultVisible: true,
  },
  {
    id: 'recent_transactions',
    emoji: '\u{1F9FE}',
    nameKey: 'settings.widgets.recentTransactions.name',
    descKey: 'settings.widgets.recentTransactions.description',
    defaultVisible: true,
  },
  {
    id: 'spending_trend',
    emoji: '\u{1F4C8}',
    nameKey: 'settings.widgets.spendingTrend.name',
    descKey: 'settings.widgets.spendingTrend.description',
    defaultVisible: false,
  },
  {
    id: 'top_vendors',
    emoji: '\u{1F3EA}',
    nameKey: 'settings.widgets.topVendors.name',
    descKey: 'settings.widgets.topVendors.description',
    defaultVisible: false,
  },
  {
    id: 'variable_categories',
    emoji: '\u{1F4CB}',
    nameKey: 'settings.widgets.variableCategories.name',
    descKey: 'settings.widgets.variableCategories.description',
    defaultVisible: true,
  },
  {
    id: 'fixed_categories',
    emoji: '\u2705',
    nameKey: 'settings.widgets.fixedCategories.name',
    descKey: 'settings.widgets.fixedCategories.description',
    defaultVisible: false,
  },
  {
    id: 'subscriptions',
    emoji: '\u{1F504}',
    nameKey: 'settings.widgets.subscriptions.name',
    descKey: 'settings.widgets.subscriptions.description',
    defaultVisible: false,
  },
];

/** Default widget order — hero cards first, then grid cards */
export const DEFAULT_WIDGET_ORDER = WIDGET_DEFINITIONS.map((w) => w.id);

/** Default hidden widgets — those with defaultVisible: false */
export const DEFAULT_HIDDEN = WIDGET_DEFINITIONS.filter((w) => !w.defaultVisible).map((w) => w.id);
