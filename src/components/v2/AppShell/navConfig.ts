/**
 * Navigation configuration for the v2 app shell.
 * Uses Tabler icons for all nav items.
 * Labels are i18n keys (v2 namespace, nav.* section) — resolved at render time.
 */

import type { ComponentType } from 'react';
import {
  IconBuildingBank,
  IconCalendar,
  IconCategory,
  IconChartBar,
  IconLayoutDashboard,
  IconList,
  IconReceipt2,
  IconRepeat,
  IconSettings,
  IconTarget,
} from '@tabler/icons-react';

export interface NavItemConfig {
  icon: ComponentType<{ size?: number | string; stroke?: number; color?: string }>;
  /** i18n key under v2 namespace (e.g. 'nav.dashboard') */
  labelKey: string;
  to: string;
  /** Show dot indicator when condition is true */
  dot?: boolean;
}

export interface NavGroupConfig {
  /** i18n key under v2 namespace (e.g. 'nav.overview') */
  labelKey: string;
  items: NavItemConfig[];
}

export const navGroups: NavGroupConfig[] = [
  {
    labelKey: 'nav.overview',
    items: [
      { icon: IconLayoutDashboard, labelKey: 'nav.dashboard', to: '/v2/dashboard' },
      { icon: IconReceipt2, labelKey: 'nav.transactions', to: '/v2/transactions' },
    ],
  },
  {
    labelKey: 'nav.planning',
    items: [
      { icon: IconCalendar, labelKey: 'nav.periods', to: '/v2/periods' },
      { icon: IconCategory, labelKey: 'nav.categories', to: '/v2/categories' },
      { icon: IconTarget, labelKey: 'nav.targets', to: '/v2/targets' },
    ],
  },
  {
    labelKey: 'nav.tracking',
    items: [
      { icon: IconBuildingBank, labelKey: 'nav.accounts', to: '/v2/accounts' },
      { icon: IconRepeat, labelKey: 'nav.subscriptions', to: '/v2/subscriptions' },
      { icon: IconList, labelKey: 'nav.vendors', to: '/v2/vendors' },
    ],
  },
];

/** Items shown in the mobile bottom nav bar */
export const bottomNavItems: NavItemConfig[] = [
  { icon: IconChartBar, labelKey: 'nav.dashboard', to: '/v2/dashboard' },
  { icon: IconReceipt2, labelKey: 'nav.transactions', to: '/v2/transactions' },
  { icon: IconCalendar, labelKey: 'nav.periods', to: '/v2/periods' },
  { icon: IconBuildingBank, labelKey: 'nav.accounts', to: '/v2/accounts' },
];

/** Items shown in the "More" drawer on mobile (everything not in bottomNavItems) */
export const moreDrawerItems: NavItemConfig[] = [
  { icon: IconCategory, labelKey: 'nav.categories', to: '/v2/categories' },
  { icon: IconTarget, labelKey: 'nav.targets', to: '/v2/targets' },
  { icon: IconRepeat, labelKey: 'nav.subscriptions', to: '/v2/subscriptions' },
  { icon: IconList, labelKey: 'nav.vendors', to: '/v2/vendors' },
  { icon: IconSettings, labelKey: 'nav.settings', to: '/v2/settings' },
];
