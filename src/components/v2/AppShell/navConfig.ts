/**
 * Navigation configuration for the v2 app shell.
 * Uses Tabler icons for all nav items.
 */

import type { ComponentType } from 'react';
import {
  IconBuildingBank,
  IconCalendar,
  IconCategory,
  IconChartBar,
  IconLayoutDashboard,
  IconLink,
  IconList,
  IconReceipt2,
  IconRepeat,
  IconSettings,
  IconTarget,
} from '@tabler/icons-react';

export interface NavItemConfig {
  icon: ComponentType<{ size?: number | string; stroke?: number; color?: string }>;
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
      { icon: IconLayoutDashboard, label: 'Dashboard', to: '/v2/dashboard' },
      { icon: IconReceipt2, label: 'Transactions', to: '/v2/transactions' },
    ],
  },
  {
    label: 'Planning',
    items: [
      { icon: IconCalendar, label: 'Periods', to: '/v2/periods' },
      { icon: IconCategory, label: 'Categories', to: '/v2/categories' },
      { icon: IconTarget, label: 'Targets', to: '/v2/targets' },
    ],
  },
  {
    label: 'Tracking',
    items: [
      { icon: IconBuildingBank, label: 'Accounts', to: '/v2/accounts' },
      { icon: IconRepeat, label: 'Subscriptions', to: '/v2/subscriptions' },
      { icon: IconList, label: 'Vendors', to: '/v2/vendors' },
      { icon: IconLink, label: 'Overlays', to: '/v2/overlays' },
    ],
  },
];

/** Items shown in the mobile bottom nav bar */
export const bottomNavItems: NavItemConfig[] = [
  { icon: IconChartBar, label: 'Dashboard', to: '/v2/dashboard' },
  { icon: IconReceipt2, label: 'Transactions', to: '/v2/transactions' },
  { icon: IconCalendar, label: 'Periods', to: '/v2/periods' },
  { icon: IconBuildingBank, label: 'Accounts', to: '/v2/accounts' },
];

/** Items shown in the "More" drawer on mobile (everything not in bottomNavItems) */
export const moreDrawerItems: NavItemConfig[] = [
  { icon: IconCategory, label: 'Categories', to: '/v2/categories' },
  { icon: IconTarget, label: 'Targets', to: '/v2/targets' },
  { icon: IconRepeat, label: 'Subscriptions', to: '/v2/subscriptions' },
  { icon: IconList, label: 'Vendors', to: '/v2/vendors' },
  { icon: IconLink, label: 'Overlays', to: '/v2/overlays' },
  { icon: IconSettings, label: 'Settings', to: '/v2/settings' },
];
