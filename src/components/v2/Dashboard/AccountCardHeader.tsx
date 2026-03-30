import { useTranslation } from 'react-i18next';
import { Badge, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import type { AccountExt } from './AccountCard.types';
import { getAccountTypeLabel } from './accountTypeColors';
import classes from './AccountCard.module.css';

interface AccountCardHeaderRowProps {
  name: string;
  type: AccountExt['type'];
  /** Resolved hex color for the account type badge. */
  typeColor: string;
}

/** Full-width header row: account name on the left, type badge on the right. */
export function AccountCardHeaderRow({ name, type, typeColor }: AccountCardHeaderRowProps) {
  return (
    <div className={classes.header}>
      <Text fz="sm" fw={600}>
        {name}
      </Text>
      <Badge
        size="xs"
        variant="light"
        style={{ backgroundColor: `${typeColor}26`, color: typeColor }}
      >
        {getAccountTypeLabel(type)}
      </Badge>
    </div>
  );
}

/** Inline header used inside centred empty/archived states. */
export function CardHeader({ name, type, typeColor }: AccountCardHeaderRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Text fz="sm" fw={600}>
        {name}
      </Text>
      <Badge
        size="xs"
        variant="light"
        style={{ backgroundColor: `${typeColor}26`, color: typeColor }}
      >
        {getAccountTypeLabel(type)}
      </Badge>
    </div>
  );
}

interface HeroSubtitleProps {
  acct: AccountExt;
  changePrefix: string;
}

/** Subtitle line beneath the hero balance — varies by account type. */
export function HeroSubtitle({ acct, changePrefix }: HeroSubtitleProps) {
  const { t } = useTranslation('v2');

  if (acct.type === 'CreditCard') {
    return (
      <Text fz="sm" c="dimmed" ff="var(--mantine-font-family-monospace)" mt={4}>
        {t('dashboard.account.currentBalance')}
      </Text>
    );
  }
  if (acct.type === 'Allowance' && acct.topUpAmount != null && acct.topUpAmount > 0) {
    return (
      <Text fz="sm" c="dimmed" ff="var(--mantine-font-family-monospace)" mt={4}>
        <CurrencyValue cents={acct.topUpAmount} /> / {acct.topUpCycle ?? 'week'}
      </Text>
    );
  }
  return (
    <Text fz="sm" c="dimmed" ff="var(--mantine-font-family-monospace)" mt={4}>
      <span>
        {changePrefix}
        <CurrencyValue cents={Math.abs(acct.netChangeThisPeriod)} />
      </span>{' '}
      {t('common.thisPeriod')}
    </Text>
  );
}

/** Returns '+', '-', or '' for displaying net change. */
export function getChangePrefix(netChange: number): string {
  if (netChange > 0) {
    return '+';
  }
  if (netChange < 0) {
    return '-';
  }
  return '';
}
