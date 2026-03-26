import type { themes } from '@/theme/v2';

type AccountType = 'Checking' | 'Savings' | 'CreditCard' | 'Allowance' | 'Wallet';
type ThemeAccents = (typeof themes)[keyof typeof themes];

/**
 * Returns the hex accent color for a given account type, sourced directly from
 * the resolved theme accents so Badge styling works with actual color values.
 */
export function getAccountTypeColor(type: AccountType, accents: ThemeAccents): string {
  switch (type) {
    case 'Checking':
      return accents.primary; // lavender — consistent across all themes
    case 'Savings':
      return accents.tertiary;
    case 'CreditCard':
      return accents.secondary;
    case 'Allowance':
      return accents.secondary;
    case 'Wallet':
      return accents.quaternary ?? accents.tertiary;
  }
}

export function getAccountTypeLabel(type: AccountType): string {
  switch (type) {
    case 'CreditCard':
      return 'Credit Card';
    default:
      return type;
  }
}
