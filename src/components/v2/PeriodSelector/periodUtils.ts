import type { components } from '@/api/v2';

type PeriodResponse = components['schemas']['PeriodResponse'];
type TFunction = (key: string, opts?: Record<string, unknown>) => string;

export interface PeriodGroup {
  label: string;
  periods: PeriodResponse[];
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Groups periods by status (current/future/past) for the dropdown.
 */
export function groupPeriods(periods: PeriodResponse[], t?: TFunction): PeriodGroup[] {
  const current = periods.filter((p) => p.status === 'active');
  const future = periods.filter((p) => p.status === 'upcoming');
  const past = periods.filter((p) => p.status === 'past');

  const label = (key: string, fallback: string) => (t ? t(key) : fallback);

  const groups: PeriodGroup[] = [];
  if (current.length > 0) {
    groups.push({ label: label('periods.groupCurrent', 'Current'), periods: current });
  }
  if (future.length > 0) {
    groups.push({ label: label('periods.groupFuture', 'Future'), periods: future });
  }
  if (past.length > 0) {
    groups.push({ label: label('periods.groupPast', 'Past'), periods: past });
  }
  return groups;
}

/**
 * Builds a human-readable badge for a period.
 */
export function periodBadgeText(period: PeriodResponse, t?: TFunction): string {
  if (period.status === 'active' && period.remainingDays != null) {
    return t
      ? t('periods.badgeDaysLeft', { count: period.remainingDays })
      : `${period.remainingDays} days left`;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = parseLocalDate(period.startDate);

  if (period.status === 'upcoming') {
    const daysUntil = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return t ? t('periods.badgeInDays', { count: daysUntil }) : `in ${daysUntil} days`;
  }

  if (period.status === 'past') {
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + period.length - 1);
    const daysAgo = Math.ceil((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
    return t ? t('periods.badgeDaysAgo', { count: daysAgo }) : `${daysAgo} days ago`;
  }

  return '';
}

/**
 * Format date range from a period.
 */
export function periodDateRange(period: PeriodResponse): string {
  const start = parseLocalDate(period.startDate);
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
