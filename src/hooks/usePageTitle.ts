import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

/**
 * Returns the current page title based on the route, matching the nav label exactly.
 */
export function usePageTitle(): string {
  const { t } = useTranslation();
  const location = useLocation();

  const routeTitleMap: Record<string, string> = {
    '/dashboard': t('layout.navigation.dashboard'),
    '/': t('layout.navigation.dashboard'),
    '/transactions': t('layout.navigation.transactions'),
    '/periods': t('layout.navigation.periods'),
    '/accounts': t('layout.navigation.accounts'),
    '/categories': t('layout.navigation.categories'),
    '/vendors': t('layout.navigation.vendors'),
    '/settings': t('layout.navigation.settings'),
    '/budget': t('layout.navigation.budgetPlan'),
    '/overlays': t('layout.navigation.overlays'),
    // Error pages intentionally return empty string (no page title shown in header)
  };

  // Match exact path first, then check prefix for detail routes
  const exactMatch = routeTitleMap[location.pathname];
  if (exactMatch) {
    return exactMatch;
  }

  // Handle sub-routes (e.g. /accounts/:id → "Accounts")
  const prefix = Object.keys(routeTitleMap).find(
    (route) => route !== '/' && location.pathname.startsWith(`${route}/`)
  );
  if (prefix) {
    return routeTitleMap[prefix];
  }

  return '';
}
