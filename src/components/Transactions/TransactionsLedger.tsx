import React, { useMemo, useState } from 'react';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Badge, Button, Group, Paper, ScrollArea, Table, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { TransactionRequest, TransactionResponse } from '@/types/transaction';
import { Vendor } from '@/types/vendor';
import { formatDisplayDate } from '@/utils/date';
import { BatchEntryRow } from './BatchEntryRow';

interface TransactionsLedgerProps {
  transactions: TransactionResponse[];
  batchMode: boolean;
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  vendors: Vendor[];
  onSaveBatch: (payload: TransactionRequest) => Promise<void>;
  onEdit: (transaction: TransactionResponse) => void;
  onDelete: (id: string) => Promise<void>;
  isFetchingMore?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
}

function groupByDate(
  transactions: TransactionResponse[]
): Array<{ date: string; items: TransactionResponse[] }> {
  const map = new Map<string, TransactionResponse[]>();
  for (const tx of transactions) {
    const d = tx.occurredAt.slice(0, 10);
    if (!map.has(d)) {
      map.set(d, []);
    }
    map.get(d)!.push(tx);
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

export const TransactionsLedger = ({
  transactions,
  batchMode,
  accounts,
  categories,
  vendors,
  onSaveBatch,
  onEdit,
  onDelete,
  isFetchingMore,
  hasNextPage,
  onLoadMore,
}: TransactionsLedgerProps) => {
  const { t } = useTranslation();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const groups = useMemo(() => groupByDate(transactions), [transactions]);

  const handleDelete = async (id: string) => {
    await onDelete(id);
    setConfirmDeleteId(null);
  };

  return (
    <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
      <ScrollArea h="calc(100vh - 280px)" scrollbars="y">
        <Table verticalSpacing="md" horizontalSpacing="md" highlightOnHover striped="even">
          <Table.Thead
            style={{
              position: 'sticky',
              top: 0,
              background: 'var(--mantine-color-body)',
              zIndex: 1,
              boxShadow: '0 1px 0 var(--mantine-color-default-border)',
            }}
          >
            <Table.Tr>
              <Table.Th w={110} style={{ textTransform: 'uppercase' }}>
                {t('transactions.list.date')}
              </Table.Th>
              <Table.Th style={{ textTransform: 'uppercase' }}>
                {t('transactions.list.notes')}
              </Table.Th>
              <Table.Th w={180} style={{ textTransform: 'uppercase' }}>
                {t('transactions.list.category')}
              </Table.Th>
              <Table.Th w={220} style={{ textTransform: 'uppercase' }}>
                {t('transactions.list.account')}
              </Table.Th>
              <Table.Th w={150} style={{ textTransform: 'uppercase' }}>
                {t('transactions.list.vendor')}
              </Table.Th>
              <Table.Th w={120} ta="right" style={{ textTransform: 'uppercase' }}>
                {t('transactions.list.amount')}
              </Table.Th>
              <Table.Th w={80} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {batchMode && (
              <BatchEntryRow
                accounts={accounts}
                categories={categories}
                vendors={vendors}
                onSave={onSaveBatch}
              />
            )}

            {groups.map(({ date, items }) => (
              <React.Fragment key={date}>
                <Table.Tr>
                  <Table.Td
                    colSpan={7}
                    style={{
                      background: 'var(--mantine-color-default-hover)',
                      padding: '6px var(--mantine-spacing-md)',
                    }}
                  >
                    <Text size="xs" fw={600} c="dimmed">
                      {formatDisplayDate(date)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
                {items.map((tx) => {
                  if (confirmDeleteId === tx.id) {
                    return (
                      <Table.Tr key={tx.id}>
                        <Table.Td colSpan={5}>
                          <Text size="sm">{t('transactions.ledger.confirmDelete')}</Text>
                        </Table.Td>
                        <Table.Td colSpan={2}>
                          <Group gap="xs" justify="flex-end">
                            <Button
                              size="xs"
                              variant="subtle"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              {t('common.cancel')}
                            </Button>
                            <Button
                              size="xs"
                              variant="subtle"
                              onClick={() => void handleDelete(tx.id)}
                            >
                              {t('common.confirm')}
                            </Button>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  }

                  const isTransfer = tx.category.categoryType === 'Transfer';
                  const amountColor = tx.category.categoryType === 'Incoming' ? 'teal' : undefined;

                  return (
                    <Table.Tr key={tx.id}>
                      <Table.Td>
                        <Text size="sm">{formatDisplayDate(tx.occurredAt.slice(0, 10))}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{tx.description}</Text>
                      </Table.Td>
                      <Table.Td>
                        {isTransfer ? (
                          <Text size="sm" c="dimmed">
                            → {tx.toAccount?.name ?? ''}
                          </Text>
                        ) : (
                          <Badge size="sm" variant="light" color={tx.category.color}>
                            {tx.category.icon} {tx.category.name}
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{tx.fromAccount.name}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {tx.vendor?.name ?? ''}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="sm" c={amountColor} fw={500}>
                          <CurrencyValue cents={Math.abs(tx.amount)} />
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} justify="flex-end">
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            onClick={() => onEdit(tx)}
                            aria-label={t('common.edit')}
                          >
                            <IconPencil size={14} />
                          </ActionIcon>
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            onClick={() => setConfirmDeleteId(tx.id)}
                            aria-label={t('common.delete')}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </React.Fragment>
            ))}
          </Table.Tbody>
        </Table>

        {hasNextPage && (
          <Group justify="center" py="md">
            <Button variant="subtle" size="sm" loading={isFetchingMore} onClick={onLoadMore}>
              {t('common.loadMore')}
            </Button>
          </Group>
        )}
      </ScrollArea>
    </Paper>
  );
};
