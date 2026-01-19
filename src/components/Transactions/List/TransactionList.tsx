import React from 'react';
import { ScrollArea, Table, useMantineColorScheme } from '@mantine/core';
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
  const { colorScheme } = useMantineColorScheme();

  return (
    <ScrollArea offsetScrollbars h="calc(100vh - 250px)">
      <Table verticalSpacing="sm" highlightOnHover striped="even">
        <Table.Thead
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor:
              colorScheme === 'dark' ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-white)',
            zIndex: 1,
            boxShadow: '0 1px 0 var(--mantine-color-default-border)',
          }}
        >
          <Table.Tr>
            <Table.Th w={110}>Date</Table.Th>
            <Table.Th>Description / Vendor</Table.Th>
            <Table.Th w={180}>Category</Table.Th>
            <Table.Th w={250}>Accounts (From → To)</Table.Th>
            <Table.Th w={120} align="right">
              Amount
            </Table.Th>
            <Table.Th w={50} />
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
