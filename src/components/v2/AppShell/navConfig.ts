/**
 * Navigation configuration for the v2 app shell.
 * Defines all nav groups and items with their emoji icons and routes.
 */

export interface NavItemConfig {
  icon: string;
  label: string;
  to: string;
  /** Show dot indicator when condition is true */
  dot?: boolean;
}

export interface NavGroupConfig {
  label: string;
  items: NavItemConfig[];
}

export const navGroups: NavGroupConfig[] = [
  {
    label: 'Overview',
    items: [
      { icon: '📊', label: 'Dashboard', to: '/v2/dashboard' },
      { icon: '📋', label: 'Transactions', to: '/v2/transactions' },
    ],
  },
  {
    label: 'Planning',
    items: [
      { icon: '📅', label: 'Periods', to: '/v2/periods' },
      { icon: '📦', label: 'Categories', to: '/v2/categories' },
      { icon: '✅', label: 'Targets', to: '/v2/targets' },
    ],
  },
  {
    label: 'Tracking',
    items: [
      { icon: '🏦', label: 'Accounts', to: '/v2/accounts' },
      { icon: '🔄', label: 'Subscriptions', to: '/v2/subscriptions' },
      { icon: '🏪', label: 'Vendors', to: '/v2/vendors' },
      { icon: '🔗', label: 'Overlays', to: '/v2/overlays' },
    ],
  },
];

/** Items shown in the mobile bottom nav bar */
export const bottomNavItems: NavItemConfig[] = [
  { icon: '📊', label: 'Dashboard', to: '/v2/dashboard' },
  { icon: '📋', label: 'Transactions', to: '/v2/transactions' },
  { icon: '📅', label: 'Periods', to: '/v2/periods' },
  { icon: '🏦', label: 'Accounts', to: '/v2/accounts' },
];

/** Items shown in the "More" drawer on mobile (everything not in bottomNavItems) */
export const moreDrawerItems: NavItemConfig[] = [
  { icon: '📦', label: 'Categories', to: '/v2/categories' },
  { icon: '✅', label: 'Targets', to: '/v2/targets' },
  { icon: '🔄', label: 'Subscriptions', to: '/v2/subscriptions' },
  { icon: '🏪', label: 'Vendors', to: '/v2/vendors' },
  { icon: '🔗', label: 'Overlays', to: '/v2/overlays' },
  { icon: '⚙️', label: 'Settings', to: '/v2/settings' },
];
