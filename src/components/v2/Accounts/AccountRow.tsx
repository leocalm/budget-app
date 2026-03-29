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
      onClick={() => navigate(`/v2/accounts/${account.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/v2/accounts/${account.id}`);
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
              {account.numberOfTransactions} txns this period
            </Text>
          )}
          {isArchived && (
            <Text fz="xs" c="dimmed">
              Archived
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
            {!isArchived && <Menu.Item onClick={() => onEdit(account.id)}>Edit</Menu.Item>}
            <Menu.Item onClick={() => navigate(`/v2/accounts/${account.id}`)}>
              View details
            </Menu.Item>
            {isArchived ? (
              <Menu.Item onClick={() => onUnarchive(account.id)}>Unarchive</Menu.Item>
            ) : (
              <Menu.Item color="red" onClick={() => onArchive(account.id)}>
                Archive
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
}

function AllowanceExtra({ account }: { account: AccountSummary }) {
  return (
    <div className={classes.allowanceExtra}>
      <div className={classes.allowanceItem}>
        <Text fz="xs" c="dimmed">
          Available:
        </Text>
        <Text fz="xs" ff="var(--mantine-font-family-monospace)" c="dimmed">
          <CurrencyValue cents={Math.max(account.currentBalance, 0)} />
        </Text>
      </div>
      {account.nextTransfer && (
        <div className={classes.allowanceItem}>
          <Text fz="xs" c="dimmed">
            Next top-up:
          </Text>
          <Text fz="xs" ff="var(--mantine-font-family-monospace)" c="dimmed">
            {formatDate(account.nextTransfer)}
          </Text>
        </div>
      )}
      {account.balanceAfterNextTransfer != null && (
        <div className={classes.allowanceItem}>
          <Text fz="xs" c="dimmed">
            After top-up:
          </Text>
          <Text fz="xs" ff="var(--mantine-font-family-monospace)" c="dimmed">
            <CurrencyValue cents={account.balanceAfterNextTransfer} />
          </Text>
        </div>
      )}
    </div>
  );
}
