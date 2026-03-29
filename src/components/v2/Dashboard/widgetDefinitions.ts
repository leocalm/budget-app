export interface WidgetDefinition {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  defaultVisible: boolean;
  isHero?: boolean;
}

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    id: 'current_period',
    emoji: '\u{1F4CA}',
    name: 'Current Period',
    desc: 'Budget progress for the active period',
    defaultVisible: true,
    isHero: true,
  },
  {
    id: 'net_position',
    emoji: '\u{1F4B0}',
    name: 'Net Position',
    desc: 'Total across all accounts',
    defaultVisible: true,
    isHero: true,
  },
  {
    id: 'cash_flow',
    emoji: '\u{1F4B8}',
    name: 'Cash Flow',
    desc: 'Inflows vs outflows',
    defaultVisible: true,
  },
  {
    id: 'recent_transactions',
    emoji: '\u{1F9FE}',
    name: 'Recent Transactions',
    desc: 'Latest activity',
    defaultVisible: true,
  },
  {
    id: 'spending_trend',
    emoji: '\u{1F4C8}',
    name: 'Spending Trend',
    desc: 'Spend over time',
    defaultVisible: false,
  },
  {
    id: 'top_vendors',
    emoji: '\u{1F3EA}',
    name: 'Top Vendors',
    desc: 'Where money goes',
    defaultVisible: false,
  },
  {
    id: 'variable_categories',
    emoji: '\u{1F4CB}',
    name: 'Variable Categories',
    desc: 'Discretionary spending tracker',
    defaultVisible: true,
  },
  {
    id: 'fixed_categories',
    emoji: '\u2705',
    name: 'Fixed Categories',
    desc: 'Predictable expenses checklist',
    defaultVisible: false,
  },
  {
    id: 'subscriptions',
    emoji: '\u{1F504}',
    name: 'Subscriptions',
    desc: 'Recurring charges timeline',
    defaultVisible: false,
  },
];

/** Default widget order — hero cards first, then grid cards */
export const DEFAULT_WIDGET_ORDER = WIDGET_DEFINITIONS.map((w) => w.id);

/** Default hidden widgets — those with defaultVisible: false */
export const DEFAULT_HIDDEN = WIDGET_DEFINITIONS.filter((w) => !w.defaultVisible).map((w) => w.id);
