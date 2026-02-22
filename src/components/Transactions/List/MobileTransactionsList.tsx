import React, { useMemo, useState } from 'react';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Badge, Button, Card, Group, Stack, Text } from '@mantine/core';
import { TransactionResponse } from '@/types/transaction';
import { convertCentsToDisplay } from '@/utils/currency';

interface MobileTransactionsListProps {
  transactions: TransactionResponse[];
  onEdit: (transaction: TransactionResponse) => void;
  onDelete: (id: string) => Promise<void>;
}

interface DateGroup {
  date: string;
  items: TransactionResponse[];
}

function groupByDate(transactions: TransactionResponse[]): DateGroup[] {
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

function formatAmount(tx: TransactionResponse): { display: string; color?: string } {
  const isIncoming = tx.category.categoryType === 'Incoming';
  const isTransfer = tx.category.categoryType === 'Transfer';
  const display = convertCentsToDisplay(tx.amount).toFixed(2);

  if (isTransfer) {
    return { display, color: undefined };
  }

  return {
    display: isIncoming ? `+${display}` : `−${display}`,
    color: isIncoming ? 'teal' : undefined,
  };
}

export const MobileTransactionsList = ({
  transactions,
  onEdit,
  onDelete,
}: MobileTransactionsListProps) => {
  const { t } = useTranslation();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const groups = useMemo(() => groupByDate(transactions), [transactions]);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await onDelete(id);
      setConfirmDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Stack gap="xs">
      {groups.map(({ date, items }) => (
        <div key={date}>
          {/* Date header */}
          <Text
            size="xs"
            fw={600}
            c="dimmed"
            ta="center"
            py="xs"
            style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            {date}
          </Text>

          {/* Cards for this date group */}
          <Stack gap="xs">
            {items.map((tx) => {
              if (confirmDeleteId === tx.id) {
                return (
                  <Card key={tx.id} withBorder radius="md" p="sm">
                    <Text size="sm" mb="sm">
                      {t('transactions.ledger.confirmDelete')}
                    </Text>
                    <Group gap="xs" justify="flex-end">
                      <Button size="xs" variant="subtle" onClick={() => setConfirmDeleteId(null)}>
                        {t('common.cancel')}
                      </Button>
                      <Button
                        size="xs"
                        variant="subtle"
                        loading={isDeleting}
                        onClick={() => void handleDelete(tx.id)}
                      >
                        {t('common.confirm')}
                      </Button>
                    </Group>
                  </Card>
                );
              }

              const isTransfer = tx.category.categoryType === 'Transfer';
              const { display: amountDisplay, color: amountColor } = formatAmount(tx);

              return (
                <Card key={tx.id} withBorder radius="md" p="sm">
                  {/* Top row: description and amount */}
                  <Group justify="space-between" align="baseline" gap="sm" mb="xs">
                    <Text size="sm" fw={600} style={{ flex: 1, minWidth: 0 }}>
                      {tx.description || '−'}
                    </Text>
                    <Text size="sm" fw={700} c={amountColor} style={{ whiteSpace: 'nowrap' }}>
                      {amountDisplay}
                    </Text>
                  </Group>

                  {/* Meta row: category and vendor or account */}
                  <Text size="xs" c="dimmed">
                    {isTransfer ? (
                      <>
                        {tx.fromAccount.name} → {tx.toAccount?.name || ''}
                      </>
                    ) : (
                      <>
                        <Badge size="sm" variant="light" color={tx.category.color}>
                          {tx.category.icon} {tx.category.name}
                        </Badge>{' '}
                        {tx.vendor?.name ? `• ${tx.vendor.name}` : ''}
                      </>
                    )}
                  </Text>

                  {/* Actions */}
                  <Group gap="xs" mt="sm" justify="flex-end">
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
                </Card>
              );
            })}
          </Stack>
        </div>
      ))}
    </Stack>
  );
};
