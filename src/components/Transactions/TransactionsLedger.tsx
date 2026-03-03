import React, { useMemo, useState } from 'react';
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Button, Group, Menu, Paper, ScrollArea, Table, Text } from '@mantine/core';
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
    <Paper radius="md" style={{ overflow: 'hidden' }}>
      <ScrollArea h="calc(100vh - 280px)" scrollbars="y">
        <Table verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead
            style={{
              position: 'sticky',
              top: 0,
              background: 'var(--mantine-color-body)',
              zIndex: 1,
              borderBottom: '1px solid var(--mantine-color-default-border)',
            }}
          >
            <Table.Tr>
              <Table.Th>{t('transactions.list.notes')}</Table.Th>
              <Table.Th w={160}>{t('transactions.list.category')}</Table.Th>
              <Table.Th w={180}>{t('transactions.list.account')}</Table.Th>
              <Table.Th w={140}>{t('transactions.list.vendor')}</Table.Th>
              <Table.Th w={120} ta="right">
                {t('transactions.list.amount')}
              </Table.Th>
              <Table.Th w={44} />
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

            {groups.map(({ date, items }, groupIndex) => (
              <React.Fragment key={date}>
                <Table.Tr>
                  <Table.Td
                    colSpan={6}
                    style={{
                      padding: '12px var(--mantine-spacing-md) 4px',
                      borderBottom: 'none',
                      ...(groupIndex > 0
                        ? { borderTop: '1px solid var(--mantine-color-default-border)' }
                        : {}),
                    }}
                  >
                    <Text size="sm" fw={600} c="dimmed">
                      {formatDisplayDate(date)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
                {items.map((tx) => {
                  if (confirmDeleteId === tx.id) {
                    return (
                      <Table.Tr key={tx.id}>
                        <Table.Td colSpan={4}>
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
                  const isIncoming = tx.category.categoryType === 'Incoming';
                  const amountColor = isIncoming ? 'teal' : undefined;
                  const amountPrefix = isIncoming ? '+' : '-';

                  return (
                    <Table.Tr key={tx.id}>
                      <Table.Td>
                        <Text size="sm">{tx.description}</Text>
                      </Table.Td>
                      <Table.Td>
                        {isTransfer ? (
                          <Text size="sm" c="dimmed">
                            → {tx.toAccount?.name ?? ''}
                          </Text>
                        ) : (
                          <Group gap={8} wrap="nowrap">
                            <span
                              style={{
                                display: 'inline-block',
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: tx.category.color
                                  ? tx.category.color.startsWith('#')
                                    ? tx.category.color
                                    : `var(--mantine-color-${tx.category.color}-5)`
                                  : '#868e96',
                                flexShrink: 0,
                              }}
                            />
                            <Text size="sm" truncate>
                              {tx.category.name}
                            </Text>
                          </Group>
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
                        <Text size="sm" c={amountColor} fw={600}>
                          {amountPrefix}
                          <CurrencyValue cents={Math.abs(tx.amount)} />
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Menu shadow="sm" position="bottom-end" withArrow>
                          <Menu.Target>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              color="gray"
                              aria-label="Actions"
                            >
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconPencil size={14} />}
                              onClick={() => onEdit(tx)}
                            >
                              {t('common.edit')}
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={() => setConfirmDeleteId(tx.id)}
                            >
                              {t('common.delete')}
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
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
