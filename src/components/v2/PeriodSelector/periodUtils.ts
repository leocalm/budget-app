import type { components } from '@/api/v2';

type PeriodResponse = components['schemas']['PeriodResponse'];

export interface PeriodGroup {
  label: string;
  periods: PeriodResponse[];
}

/**
 * Groups periods by status (current/future/past) for the dropdown.
 */
export function groupPeriods(periods: PeriodResponse[]): PeriodGroup[] {
  const current = periods.filter((p) => p.status === 'active');
  const future = periods.filter((p) => p.status === 'upcoming');
  const past = periods.filter((p) => p.status === 'past');

  const groups: PeriodGroup[] = [];
  if (current.length > 0) {
    groups.push({ label: 'Current', periods: current });
  }
  if (future.length > 0) {
    groups.push({ label: 'Future', periods: future });
  }
  if (past.length > 0) {
    groups.push({ label: 'Past', periods: past });
  }
  return groups;
}

/**
 * Builds a human-readable badge for a period.
 * - Active: "14 days left"
 * - Upcoming: "in 15 days"
 * - Past: "13 days ago"
 */
export function periodBadgeText(period: PeriodResponse): string {
  if (period.status === 'active' && period.remainingDays != null) {
    return `${period.remainingDays} days left`;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(period.startDate);
  start.setHours(0, 0, 0, 0);

  if (period.status === 'upcoming') {
    const daysUntil = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return `in ${daysUntil} days`;
  }

  if (period.status === 'past') {
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + period.length);
    const daysAgo = Math.ceil((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${daysAgo} days ago`;
  }

  return '';
}

/**
 * Format date range from a period.
 */
export function periodDateRange(period: PeriodResponse): string {
  const start = new Date(period.startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + period.length - 1);

  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${fmt(start)} – ${fmt(end)}`;
}

/**
 * Calculates progress percentage for a period (time elapsed / total).
 */
export function periodProgress(period: PeriodResponse): number {
  if (period.status === 'past') {
    return 100;
  }
  if (period.status === 'upcoming') {
    return 0;
  }
  if (period.remainingDays == null) {
    return 0;
  }
  const elapsed = period.length - period.remainingDays;
  return Math.round((elapsed / period.length) * 100);
}
