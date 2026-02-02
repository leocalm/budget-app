import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea, Table } from '@mantine/core';
import { TransactionResponse } from '@/types/transaction';
import { TransactionRow } from '../Table/TransactionRow';

interface TransactionListProps {
  transactions: TransactionResponse[] | undefined;
  deleteTransaction: (id: string) => Promise<unknown>;
  editTransaction?: (transaction: TransactionResponse) => void;
}

export const TransactionList = ({
  transactions,
  deleteTransaction,
  editTransaction,
}: TransactionListProps) => {
  const { t } = useTranslation();

  return (
    <ScrollArea offsetScrollbars h="calc(100vh - 250px)">
      <Table verticalSpacing="sm" highlightOnHover striped="even">
        <Table.Thead
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--bg-card)',
            zIndex: 1,
            boxShadow: '0 1px 0 var(--mantine-color-default-border)',
          }}
        >
          <Table.Tr>
            <Table.Th w={110} style={{ paddingLeft: '16px' }}>
              {t('transactions.list.date')}
            </Table.Th>
            <Table.Th style={{ paddingLeft: '16px' }}>
              {t('transactions.list.descriptionVendor')}
            </Table.Th>
            <Table.Th w={180} style={{ paddingLeft: '16px' }}>
              {t('transactions.list.category')}
            </Table.Th>
            <Table.Th w={250} style={{ paddingLeft: '16px' }}>
              {t('transactions.list.accounts')}
            </Table.Th>
            <Table.Th w={120} align="right" style={{ paddingLeft: '16px' }}>
              {t('transactions.list.amount')}
            </Table.Th>
            <Table.Th w={50} style={{ paddingLeft: '16px' }} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {transactions?.map((t) => (
            <TransactionRow
              key={t.id}
              transaction={t}
              onDelete={deleteTransaction}
              onEdit={editTransaction || (() => {})}
            />
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
};
