import React, { useMemo, useState } from 'react';
import { IconArrowRight, IconPencil, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { TransactionRequest, TransactionResponse } from '@/types/transaction';
import { Vendor } from '@/types/vendor';
import { formatDisplayDate } from '@/utils/date';
import { BatchEntryRow } from './BatchEntryRow';

interface DesktopTransactionsListProps {
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

export const DesktopTransactionsList = ({
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
}: DesktopTransactionsListProps) => {
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
        {batchMode && (
          <Paper
            p="md"
            mb="xs"
            style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
          >
            <Table>
              <Table.Tbody>
                <BatchEntryRow
                  accounts={accounts}
                  categories={categories}
                  vendors={vendors}
                  onSave={onSaveBatch}
                />
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        <Stack gap={0}>
          {groups.length === 0 && (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              {t('states.empty.transactions.message')}
            </Text>
          )}
          {groups.map(({ date, items }, groupIndex) => (
            <React.Fragment key={date}>
              <Text
                size="sm"
                fw={600}
                c="dimmed"
                px="md"
                py="xs"
                style={{
                  ...(groupIndex > 0
                    ? { borderTop: '1px solid var(--mantine-color-default-border)' }
                    : {}),
                }}
              >
                {formatDisplayDate(date)}
              </Text>

              {items.map((tx) => {
                if (confirmDeleteId === tx.id) {
                  return (
                    <Group
                      key={tx.id}
                      justify="space-between"
                      px="md"
                      py="sm"
                      style={{
                        borderBottom: '1px solid var(--mantine-color-default-border)',
                      }}
                    >
                      <Text size="sm">{t('transactions.ledger.confirmDelete')}</Text>
                      <Group gap="xs">
                        <Button size="xs" variant="subtle" onClick={() => setConfirmDeleteId(null)}>
                          {t('common.cancel')}
                        </Button>
                        <Button
                          size="xs"
                          variant="subtle"
                          color="red"
                          onClick={() => void handleDelete(tx.id)}
                        >
                          {t('common.confirm')}
                        </Button>
                      </Group>
                    </Group>
                  );
                }

                const isTransfer = tx.category.categoryType === 'Transfer';
                const isIncoming = tx.category.categoryType === 'Incoming';
                const amountColor = isIncoming ? 'teal' : undefined;
                const amountPrefix = isIncoming ? '+' : '-';

                return (
                  <div
                    key={tx.id}
                    className="transaction-card-row"
                    role="button"
                    tabIndex={0}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--mantine-spacing-md)',
                      padding: 'var(--mantine-spacing-sm) var(--mantine-spacing-md)',
                      borderBottom: '1px solid var(--mantine-color-default-border)',
                      cursor: 'pointer',
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--mantine-color-default-hover)';
                      const actions = e.currentTarget.querySelector(
                        '[data-actions]'
                      ) as HTMLElement;
                      if (actions) {
                        actions.style.opacity = '1';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '';
                      const actions = e.currentTarget.querySelector(
                        '[data-actions]'
                      ) as HTMLElement;
                      if (actions) {
                        actions.style.opacity = '0';
                      }
                    }}
                    onClick={() => onEdit(tx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onEdit(tx);
                      }
                    }}
                  >
                    {/* Description + category/vendor */}
                    <div>
                      <Text size="sm" fw={600}>
                        {tx.description || '—'}
                      </Text>
                      <Group gap="xs" mt={4}>
                        {isTransfer ? (
                          <Text size="xs" c="dimmed">
                            {tx.fromAccount.name}{' '}
                            <IconArrowRight size={10} style={{ verticalAlign: 'middle' }} />{' '}
                            {tx.toAccount?.name ?? ''}
                          </Text>
                        ) : (
                          <>
                            <Badge size="sm" variant="light" color={tx.category.color}>
                              {tx.category.icon} {tx.category.name}
                            </Badge>
                            {tx.vendor?.name && (
                              <Text size="xs" c="dimmed">
                                · {tx.vendor.name}
                              </Text>
                            )}
                          </>
                        )}
                      </Group>
                    </div>

                    {/* Account */}
                    {!isTransfer && (
                      <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                        {tx.fromAccount.name}
                      </Text>
                    )}

                    {/* Amount */}
                    <Text
                      size="sm"
                      fw={700}
                      c={amountColor}
                      style={{
                        whiteSpace: 'nowrap',
                        fontVariantNumeric: 'tabular-nums',
                        minWidth: 90,
                        textAlign: 'right',
                      }}
                    >
                      {amountPrefix}
                      <CurrencyValue cents={Math.abs(tx.amount)} />
                    </Text>

                    {/* Hover actions */}
                    <Group
                      gap={4}
                      data-actions
                      style={{
                        opacity: 0,
                        transition: 'opacity 150ms ease',
                        minWidth: 52,
                      }}
                    >
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(tx);
                        }}
                        aria-label={t('common.edit')}
                      >
                        <IconPencil size={14} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(tx.id);
                        }}
                        aria-label={t('common.delete')}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </Stack>

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
