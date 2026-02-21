import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Skeleton, Table, Text } from '@mantine/core';
import { useAccountTransactions } from '@/hooks/useAccountTransactions';
import { AccountTransaction, CurrencyResponse } from '@/types/account';
import { formatCurrency } from '@/utils/currency';

type FlowFilter = 'all' | 'in' | 'out';

interface Props {
  accountId: string;
  periodId: string | null;
  currency: CurrencyResponse | undefined;
}

export function AccountTransactions({ accountId, periodId, currency }: Props) {
  const { t } = useTranslation();
  const [txType, setTxType] = useState<FlowFilter>('all');
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useAccountTransactions(accountId, periodId, txType);

  const transactions = data?.pages.flatMap((p) => p.data ?? []) ?? [];

  const fmt = (cents: number) => (currency ? formatCurrency(cents, currency) : '—');

  const grouped = transactions.reduce<Record<string, AccountTransaction[]>>((acc, tx) => {
    (acc[tx.occurredAt] ??= []).push(tx);
    return acc;
  }, {});

  return (
    <div
      style={{
        marginTop: 60,
        borderTop: '1px solid var(--mantine-color-default-border)',
        paddingTop: 32,
      }}
    >
      <Text size="xs" tt="uppercase" c="dimmed" mb="md">
        {t('accounts.detail.transactions.title')}
      </Text>

      <Group gap="xs" mb="md">
        {(['all', 'in', 'out'] as FlowFilter[]).map((f) => (
          <Button
            key={f}
            size="xs"
            variant={txType === f ? 'outline' : 'subtle'}
            onClick={() => setTxType(f)}
          >
            {f === 'all'
              ? t('accounts.detail.transactions.filterAll')
              : f === 'in'
                ? t('accounts.detail.transactions.filterIn')
                : t('accounts.detail.transactions.filterOut')}
          </Button>
        ))}
      </Group>

      {isLoading ? (
        <Skeleton height={200} />
      ) : transactions.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          {t('accounts.detail.transactions.empty')}
        </Text>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('accounts.detail.transactions.colDate')}</Table.Th>
              <Table.Th>{t('accounts.detail.transactions.colDescription')}</Table.Th>
              <Table.Th>{t('accounts.detail.transactions.colCategory')}</Table.Th>
              <Table.Th ta="right">{t('accounts.detail.transactions.colAmount')}</Table.Th>
              <Table.Th ta="right">{t('accounts.detail.transactions.colBalance')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Object.entries(grouped)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, txs]) => (
                <>
                  <Table.Tr key={`group-${date}`}>
                    <Table.Td colSpan={5}>
                      <Text size="xs" tt="uppercase" c="dimmed">
                        {date}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                  {txs.map((tx) => (
                    <Table.Tr key={tx.id}>
                      <Table.Td>{tx.occurredAt}</Table.Td>
                      <Table.Td>{tx.description}</Table.Td>
                      <Table.Td>{tx.categoryName}</Table.Td>
                      <Table.Td ta="right" c={tx.flow === 'in' ? 'indigo' : undefined}>
                        {tx.flow === 'in' ? '+' : '-'}
                        {fmt(tx.amount)}
                      </Table.Td>
                      <Table.Td ta="right" c="dimmed">
                        {fmt(tx.runningBalance)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </>
              ))}
          </Table.Tbody>
        </Table>
      )}

      {hasNextPage && (
        <Button
          variant="subtle"
          onClick={() => fetchNextPage()}
          loading={isFetchingNextPage}
          mt="md"
          fullWidth
        >
          {t('accounts.detail.transactions.loadMore')}
        </Button>
      )}
    </div>
  );
}
