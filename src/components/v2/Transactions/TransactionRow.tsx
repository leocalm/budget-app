import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Badge, Menu, Text } from '@mantine/core';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { ConfirmDeleteModal } from '@/components/v2/ConfirmDeleteModal';
import classes from './Transactions.module.css';

type TransactionResponse = components['schemas']['TransactionResponse'];
type AccountRef = components['schemas']['AccountRef'];

function getTransferToAccount(txn: TransactionResponse): AccountRef | null {
  if (txn.transactionType === 'transfer' && txn.toAccount) {
    return txn.toAccount as AccountRef;
  }
  return null;
}

interface TransactionRowProps {
  transaction: TransactionResponse;
  onEdit: (txn: TransactionResponse) => void;
  onDelete: (id: string) => void;
}

export function TransactionRow({ transaction, onEdit, onDelete }: TransactionRowProps) {
  const { t } = useTranslation('v2');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const isIncome = transaction.category.type === 'income';
  const isTransfer = transaction.transactionType === 'transfer';
  const amountPrefix = isIncome ? '+' : isTransfer ? '' : '-';

  return (
    <>
      {/* Desktop row */}
      <div
        className={classes.txnRow}
        data-testid={`transaction-row-${transaction.id}`}
        onClick={() => onEdit(transaction)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onEdit(transaction);
          }
        }}
      >
        <div
          className={classes.txnAccent}
          style={{ backgroundColor: transaction.category.color }}
        />

        <div className={classes.txnInfo}>
          <Text fz="sm" fw={500} truncate>
            {transaction.description}
          </Text>
          <div className={classes.txnMeta}>
            <Badge
              size="xs"
              variant="light"
              style={{
                backgroundColor: `${transaction.category.color}26`,
                color: transaction.category.color,
              }}
            >
              {transaction.category.icon} {transaction.category.name}
            </Badge>
            {transaction.vendor && (
              <Text fz="xs" c="dimmed">
                {transaction.vendor.name}
              </Text>
            )}
          </div>
        </div>

        <div className={classes.txnAmountCell}>
          <Text fz="sm" fw={600} ff="var(--mantine-font-family-monospace)">
            {amountPrefix}
            <CurrencyValue cents={Math.abs(transaction.amount)} />
          </Text>
          <Text fz="xs" c="dimmed">
            {transaction.fromAccount.name}
            {isTransfer &&
              getTransferToAccount(transaction) &&
              ` → ${getTransferToAccount(transaction)!.name}`}
          </Text>
        </div>

        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          className={classes.kebabCell}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                aria-label={`Actions for ${transaction.description}`}
              >
                <Text fz="lg" lh={1}>
                  ⋮
                </Text>
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => onEdit(transaction)}>{t('common.edit')}</Menu.Item>
              <Menu.Item color="red" onClick={() => setDeleteConfirmOpen(true)}>
                {t('common.delete')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>

      {/* Mobile row */}
      <div
        className={classes.mobileTxnRow}
        data-testid={`transaction-row-mobile-${transaction.id}`}
        onClick={() => onEdit(transaction)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onEdit(transaction);
          }
        }}
      >
        <div
          className={classes.mobileTxnIcon}
          style={{ backgroundColor: `${transaction.category.color}26` }}
        >
          {transaction.category.icon}
        </div>
        <div className={classes.mobileTxnInfo}>
          <Text fz="sm" fw={500} truncate>
            {transaction.description}
          </Text>
          <Text fz="xs" c="dimmed" truncate>
            {transaction.category.name} · {transaction.fromAccount.name}
          </Text>
        </div>
        <div className={classes.mobileTxnAmount}>
          <Text fz="sm" fw={600} ff="var(--mantine-font-family-monospace)">
            {amountPrefix}
            <CurrencyValue cents={Math.abs(transaction.amount)} />
          </Text>
        </div>
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="xs"
                aria-label={`Actions for ${transaction.description}`}
              >
                <Text fz="sm" lh={1}>
                  ⋮
                </Text>
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => onEdit(transaction)}>{t('common.edit')}</Menu.Item>
              <Menu.Item color="red" onClick={() => setDeleteConfirmOpen(true)}>
                {t('common.delete')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>

      <ConfirmDeleteModal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          setDeleteConfirmOpen(false);
          onDelete(transaction.id);
        }}
        entityName={transaction.description}
      />
    </>
  );
}
