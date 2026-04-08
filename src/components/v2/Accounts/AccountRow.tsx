import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ActionIcon, Badge, Menu, Text } from '@mantine/core';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useAccountBalanceHistory } from '@/hooks/v2/useAccounts';
import { useV2Theme } from '@/theme/v2';
import { formatDate } from '../Dashboard/AccountCardSections';
import { AccountSparkline } from '../Dashboard/AccountSparkline';
import { getAccountTypeColor, getAccountTypeLabel } from '../Dashboard/accountTypeColors';
import classes from './Accounts.module.css';

type AccountSummary = components['schemas']['AccountSummaryResponse'];

interface AccountRowProps {
  account: AccountSummary;
  periodId: string;
  onEdit: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
}

export function AccountRow({ account, periodId, onEdit, onArchive, onUnarchive }: AccountRowProps) {
  const { t } = useTranslation('v2');
  const navigate = useNavigate();
  const { data: history } = useAccountBalanceHistory(account.id, periodId);
  const { accents } = useV2Theme();
  const typeColor = getAccountTypeColor(account.type, accents);
  const isArchived = account.status === 'inactive';

  const changePrefix =
    account.netChangeThisPeriod > 0 ? '+' : account.netChangeThisPeriod < 0 ? '-' : '';

  return (
    <div
      className={classes.accountRow}
      data-testid={`account-row-${account.id}`}
      data-archived={isArchived || undefined}
      onClick={() => navigate(`/accounts/${account.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/accounts/${account.id}`);
        }
      }}
    >
      {/* Color dot */}
      <span
        className={classes.accountColorDot}
        style={{ backgroundColor: account.color || 'var(--v2-border)' }}
      />

      {/* Name + meta */}
      <div className={classes.accountInfo}>
        <div className={classes.accountNameRow}>
          <Text fz="md" fw={600} truncate>
            {account.name}
          </Text>
        </div>
        <div className={classes.accountMeta}>
          <Badge
            size="xs"
            variant="light"
            style={{ backgroundColor: `${typeColor}26`, color: typeColor }}
          >
            {getAccountTypeLabel(account.type)}
          </Badge>
          {!isArchived && (
            <Text fz="xs" c="dimmed">
              {t('common.txnsThisPeriod', { count: account.numberOfTransactions })}
            </Text>
          )}
          {isArchived && (
            <Text fz="xs" c="dimmed">
              {t('common.archived')}
            </Text>
          )}
        </div>

        {/* Type-specific extras */}
        {!isArchived && account.type === 'Allowance' && <AllowanceExtra account={account} />}
      </div>

      {/* Sparkline */}
      {!isArchived && (
        <div className={classes.sparklineCell}>
          <AccountSparkline history={history ?? undefined} acctName={account.name} />
        </div>
      )}

      {/* Balance */}
      <div className={classes.balanceCell}>
        <Text fz="md" fw={700} ff="var(--mantine-font-family-monospace)">
          <CurrencyValue cents={account.currentBalance} />
        </Text>
        {!isArchived && (
          <Text fz="xs" c="dimmed" ff="var(--mantine-font-family-monospace)">
            {changePrefix}
            <CurrencyValue cents={Math.abs(account.netChangeThisPeriod)} />
          </Text>
        )}
      </div>

      {/* Kebab menu */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={classes.kebabCell}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="sm">
              <Text fz="lg" lh={1}>
                ⋮
              </Text>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {!isArchived && (
              <Menu.Item onClick={() => onEdit(account.id)}>{t('common.edit')}</Menu.Item>
            )}
            <Menu.Item onClick={() => navigate(`/accounts/${account.id}`)}>
              {t('common.viewDetails')}
            </Menu.Item>
            {isArchived ? (
              <Menu.Item onClick={() => onUnarchive(account.id)}>{t('common.unarchive')}</Menu.Item>
            ) : (
              <Menu.Item color="red" onClick={() => onArchive(account.id)}>
                {t('common.archive')}
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
}

function AllowanceExtra({ account }: { account: AccountSummary }) {
  const { t } = useTranslation('v2');
  return (
    <div className={classes.allowanceExtra}>
      <div className={classes.allowanceItem}>
        <Text fz="xs" c="dimmed">
          {t('accounts.available')}
        </Text>
        <Text fz="xs" ff="var(--mantine-font-family-monospace)" c="dimmed">
          <CurrencyValue cents={Math.max(account.currentBalance, 0)} />
        </Text>
      </div>
      {account.nextTransfer && (
        <div className={classes.allowanceItem}>
          <Text fz="xs" c="dimmed">
            {t('accounts.nextTopUp')}
          </Text>
          <Text fz="xs" ff="var(--mantine-font-family-monospace)" c="dimmed">
            {formatDate(account.nextTransfer, t)}
          </Text>
        </div>
      )}
      {account.balanceAfterNextTransfer != null && (
        <div className={classes.allowanceItem}>
          <Text fz="xs" c="dimmed">
            {t('accounts.afterTopUp')}
          </Text>
          <Text fz="xs" ff="var(--mantine-font-family-monospace)" c="dimmed">
            <CurrencyValue cents={account.balanceAfterNextTransfer} />
          </Text>
        </div>
      )}
    </div>
  );
}
