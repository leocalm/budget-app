import type { components } from '@/api/v2';

type BillingCycle = components['schemas']['SubscriptionResponse']['billingCycle'];

export const CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: '/mo',
  quarterly: '/qtr',
  yearly: '/yr',
};

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
