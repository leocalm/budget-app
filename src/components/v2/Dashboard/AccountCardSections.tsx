import { useTranslation } from 'react-i18next';
import { Progress, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import type { AccountExt } from './AccountCard.types';
import classes from './AccountCard.module.css';

// ---------------------------------------------------------------------------
// Standard section (Checking / Savings / Wallet)
// ---------------------------------------------------------------------------

export function StandardSection({ acct }: { acct: AccountExt }) {
  const { t } = useTranslation('v2');
  const boxes: { label: string; value: React.ReactNode }[] = [];

  if (acct.type === 'Checking') {
    boxes.push({ label: t('dashboard.account.transactions'), value: acct.numberOfTransactions });
    boxes.push({
      label: t('dashboard.account.avgDailyBalance'),
      value: <CurrencyValue cents={acct.avgDailyBalance} />,
    });
  } else if (acct.type === 'Savings') {
    boxes.push({
      label: t('dashboard.account.inflows'),
      value: <CurrencyValue cents={acct.inflow} />,
    });
    boxes.push({
      label: t('dashboard.account.outflows'),
      value: <CurrencyValue cents={acct.outflow} />,
    });
  } else {
    // Wallet (and any future account types)
    boxes.push({ label: t('dashboard.account.transactions'), value: acct.numberOfTransactions });
    boxes.push({
      label: t('dashboard.account.periodChange'),
      value: <CurrencyValue cents={acct.netChangeThisPeriod} />,
    });
  }

  return (
    <div className={classes.statsGrid}>
      {boxes.map((b) => (
        <div key={b.label} className={classes.statBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            {b.label}
          </Text>
          <Text fz="md" fw={500} ff="var(--mantine-font-family-monospace)">
            {b.value}
          </Text>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Allowance section
// ---------------------------------------------------------------------------

export function AllowanceSection({ acct }: { acct: AccountExt }) {
  const { t } = useTranslation('v2');
  const available = Math.max(acct.currentBalance, 0);
  const isOverspent = acct.currentBalance < 0;

  const rows = [
    { label: t('dashboard.account.availableToSpend'), value: <CurrencyValue cents={available} /> },
    {
      label: isOverspent ? t('dashboard.account.overspent') : t('dashboard.account.spentThisCycle'),
      value: (
        <CurrencyValue cents={isOverspent ? Math.abs(acct.currentBalance) : acct.spentThisCycle} />
      ),
    },
  ];

  return (
    <div className={classes.detailRows}>
      {rows.map((r) => (
        <div key={r.label} className={classes.detailRow}>
          <Text fz="xs" c="dimmed">
            {r.label}
          </Text>
          <Text fz="sm" ff="var(--mantine-font-family-monospace)">
            {r.value}
          </Text>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Credit card section
// ---------------------------------------------------------------------------

interface CreditCardSectionProps {
  acct: AccountExt;
  /** Resolved hex color for the limit progress bar. */
  typeColor: string;
}

export function CreditCardSection({ acct, typeColor }: CreditCardSectionProps) {
  const { t } = useTranslation('v2');
  const limit = acct.spendLimit ?? 0;
  const hasLimit = limit > 0;
  const available = hasLimit ? Math.max(limit - acct.currentBalance, 0) : 0;
  const usedPct = hasLimit ? Math.min(Math.round((acct.currentBalance / limit) * 100), 100) : 0;

  return (
    <>
      {hasLimit && (
        <div className={classes.limitSection}>
          <div className={classes.limitRow}>
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
              <CurrencyValue cents={available} /> {t('dashboard.account.available')}
            </Text>
            <Text fz="xs" c="dimmed" ff="var(--mantine-font-family-monospace)">
              <CurrencyValue cents={limit} /> {t('dashboard.account.limit')}
            </Text>
          </div>
          <Progress
            value={usedPct}
            size={8}
            radius="xl"
            color={typeColor}
            aria-label={t('dashboard.account.creditUsed', { pct: usedPct })}
          />
        </div>
      )}
      {(acct.statementCloseDay != null || acct.paymentDueDay != null) && (
        <div className={classes.dateGrid}>
          {acct.statementCloseDay != null && (
            <DateBox label={t('dashboard.account.statementCloses')} day={acct.statementCloseDay} />
          )}
          {acct.paymentDueDay != null && (
            <DateBox label={t('dashboard.account.paymentDue')} day={acct.paymentDueDay} />
          )}
        </div>
      )}
      <div className={classes.statsGrid}>
        <div className={classes.statBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            {t('dashboard.account.balance')}
          </Text>
          <Text fz="md" fw={500} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={acct.currentBalance} />
          </Text>
        </div>
        <div className={classes.statBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            {t('dashboard.account.transactions')}
          </Text>
          <Text fz="md" fw={500} ff="var(--mantine-font-family-monospace)">
            {acct.numberOfTransactions}
          </Text>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Date box (used for statement close and payment due dates)
// ---------------------------------------------------------------------------

function DateBox({ label, day }: { label: string; day: number }) {
  const { t } = useTranslation('v2');
  const now = new Date();
  const nextDate = getNextDateForDay(day, now);
  const msUntil = nextDate.getTime() - now.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil(msUntil / (1000 * 60 * 60 * 24));

  const formatted = nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const daysLabel =
    daysUntil === 0
      ? t('dashboard.account.today')
      : daysUntil === 1
        ? t('dashboard.account.tomorrow')
        : t('dashboard.account.inDays', { count: daysUntil });

  return (
    <div className={classes.dateBox}>
      <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
        {label}
      </Text>
      <Text fz="sm" fw={600}>
        {formatted}
      </Text>
      <Text fz="xs" c="dimmed">
        {daysLabel}
      </Text>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the next calendar date on which the given day-of-month falls,
 * clamping to the last day of the month to avoid date rollover (e.g. day 31
 * in February resolves to Feb 28/29 rather than rolling into March).
 */
function getNextDateForDay(day: number, from: Date): Date {
  const year = from.getFullYear();
  const month = from.getMonth();

  const clampedDay = Math.min(day, daysInMonth(year, month));
  const thisMonth = new Date(year, month, clampedDay);

  if (thisMonth > from) {
    return thisMonth;
  }

  const nextMonth = month + 1;
  const nextYear = nextMonth > 11 ? year + 1 : year;
  const nextMonthIdx = nextMonth > 11 ? 0 : nextMonth;
  const clampedDayNext = Math.min(day, daysInMonth(nextYear, nextMonthIdx));
  return new Date(nextYear, nextMonthIdx, clampedDayNext);
}

/** Returns the number of days in a given month (0-based month index). */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Formats an ISO date string (YYYY-MM-DD) as a relative label.
 * Parses without timezone shifting by using the year/month/day parts directly.
 */
export function formatDate(
  dateStr: string,
  t: (key: string, opts?: Record<string, unknown>) => string
): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  if (daysUntil === 0) {
    return `${formatted} ${t('dashboard.account.todayParens')}`;
  }
  if (daysUntil > 0) {
    return `${formatted} ${t('dashboard.account.inDaysParens', { count: daysUntil })}`;
  }
  return formatted;
}
