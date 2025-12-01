import React, { useEffect, useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import { ActionIcon, ColorSwatch, Table } from '@mantine/core';
import { deleteAccount, fetchAccounts } from '@/api/account';
import { AccountResponse } from '@/types/account';

interface AccountsTableProps {
  refreshKey?: number;
}

export const AccountsTable: React.FC<AccountsTableProps> = ({ refreshKey }) => {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAccounts()
      .then(setAccounts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    try {
      await deleteAccount(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const rows = accounts.map((account) => (
    <Table.Tr key={account.id}>
      <Table.Td>{account.name}</Table.Td>
      <Table.Td>{account.account_type}</Table.Td>
      <Table.Td>
        {account.currency.symbol}
        &nbsp;
        {account.balance.toFixed(account.currency.decimal_places)}
      </Table.Td>
      <Table.Td>
        <ColorSwatch color={account.color} />
      </Table.Td>
      <Table.Td align="right">
        <ActionIcon color="red" onClick={() => handleDelete(account.id)}>
          <IconTrash size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Type</Table.Th>
          <Table.Th>Balance</Table.Th>
          <Table.Th>Color</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};
