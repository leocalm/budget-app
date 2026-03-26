import type { ColorTheme } from '@/theme/v2';

type AccountType = 'Checking' | 'Savings' | 'CreditCard' | 'Allowance' | 'Wallet';

/**
 * Maps account types to theme-based badge colors.
 * Returns the CSS variable name for the color.
 */
const colorMap: Record<ColorTheme, Record<AccountType, string>> = {
  moonlit: {
    Checking: 'var(--v2-primary)', // lavender
    Savings: 'var(--v2-tertiary)', // sky
    CreditCard: 'var(--v2-secondary)', // silver
    Allowance: 'var(--v2-secondary)', // silver
    Wallet: 'var(--v2-tertiary)', // sky
  },
  nebula: {
    Checking: 'var(--v2-primary)', // lavender
    Savings: 'var(--v2-tertiary)', // steel
    CreditCard: 'var(--v2-secondary)', // rose
    Allowance: 'var(--v2-secondary)', // rose
    Wallet: '#9AA0CC', // peri (quaternary)
  },
  frost: {
    Checking: 'var(--v2-primary)', // lavender
    Savings: 'var(--v2-secondary)', // ice
    CreditCard: 'var(--v2-tertiary)', // plum
    Allowance: 'var(--v2-tertiary)', // plum
    Wallet: '#7C98B4', // slate (quaternary)
  },
  twilight: {
    Checking: 'var(--v2-primary)', // lavender
    Savings: 'var(--v2-secondary)', // teal
    CreditCard: 'var(--v2-tertiary)', // grape
    Allowance: 'var(--v2-tertiary)', // grape
    Wallet: '#8090B8', // storm (quaternary)
  },
};

export function getAccountTypeColor(type: AccountType, theme: ColorTheme): string {
  return colorMap[theme]?.[type] ?? 'var(--v2-primary)';
}

export function getAccountTypeLabel(type: AccountType): string {
  switch (type) {
    case 'CreditCard':
      return 'Credit Card';
    default:
      return type;
  }
}
