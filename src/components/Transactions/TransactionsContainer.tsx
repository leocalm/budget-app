import React, { useMemo, useState } from 'react';
import { Box, Modal, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useBudgetPeriods } from '@/hooks/useBudget';
import { useDeleteTransaction, useTransactions } from '@/hooks/useTransactions';
import { TransactionResponse } from '@/types/transaction';
import { QuickAddTransaction } from './Form';
import { ExportButton, PageHeader } from './PageHeader';
import { TransactionStats } from './Stats';
import { TransactionFilters, TransactionsSection, TransactionTypeFilter } from './Table';

export function TransactionsContainer() {
  // State for filters
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state for editing
  const [editingTransaction, setEditingTransaction] = useState<TransactionResponse | null>(null);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

  // Get selected budget period from context
  const { selectedPeriodId } = useBudgetPeriodSelection();

  // Data Fetching
  const { data: transactions } = useTransactions(selectedPeriodId);
  const { data: periods } = useBudgetPeriods();

  // Find the selected period from periods list
  const selectedPeriod = useMemo(() => {
    if (!periods || !selectedPeriodId) {
      return null;
    }
    return periods.find((p) => p.id === selectedPeriodId) || null;
  }, [periods, selectedPeriodId]);

  // Mutations
  const deleteTransactionMutation = useDeleteTransaction();

  // Client-side filtering
  const filteredTransactions = useMemo(() => {
    if (!transactions) {
      return [];
    }

    return transactions.filter((t) => {
      // Filter by Type
      if (typeFilter !== 'all' && t.category.categoryType !== typeFilter) {
        return false;
      }

      // Filter by Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesDesc = t.description?.toLowerCase().includes(query);
        const matchesVendor = t.vendor?.name.toLowerCase().includes(query);
        const matchesCategory = t.category.name.toLowerCase().includes(query);
        const matchesAmount = t.amount.toString().includes(query);

        if (!matchesDesc && !matchesVendor && !matchesCategory && !matchesAmount) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, typeFilter, searchQuery]);

  // Calculate Stats
  const stats = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, t) => {
        if (t.category.categoryType === 'Incoming') {
          acc.income += t.amount;
          acc.balance += t.amount;
        } else if (t.category.categoryType === 'Outgoing') {
          acc.expenses += t.amount;
          acc.balance -= t.amount;
        }
        return acc;
      },
      { income: 0, expenses: 0, balance: 0 }
    );
  }, [filteredTransactions]);

  // Handle edit transaction
  const handleEdit = (transaction: TransactionResponse) => {
    setEditingTransaction(transaction);
    openEditModal();
  };

  // Handle delete transaction
  const handleDelete = async (id: string) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransactionMutation.mutateAsync(id);
    }
  };

  // Handle export
  const handleExport = () => {
    // TODO: Implement export functionality
  };

  // Get period display name
  const periodName = useMemo(() => {
    if (!selectedPeriod?.startDate) {
      return 'this period';
    }
    const start = new Date(selectedPeriod.endDate);
    return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedPeriod]);

  return (
    <Box
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px',
      }}
    >
      {/* Page Header */}
      <PageHeader
        title="Transactions"
        subtitle="Review and manage your financial activity for the selected period."
        actions={<ExportButton onClick={handleExport} />}
      />

      {/* Quick Add Transaction Form */}
      <QuickAddTransaction />

      {/* Stats Summary */}
      <TransactionStats income={stats.income} expenses={stats.expenses} balance={stats.balance} />

      {/* Filters */}
      <TransactionFilters
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Transactions Section */}
      <TransactionsSection
        transactions={filteredTransactions}
        period={periodName}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title="Edit Transaction"
        size="lg"
        styles={{
          header: {
            background: '#151b26',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          },
          title: {
            fontSize: '24px',
            fontWeight: 700,
            color: '#ffffff',
          },
          content: {
            background: '#151b26',
          },
          close: {
            color: '#5a6272',
            '&:hover': {
              background: 'rgba(255, 107, 157, 0.1)',
              color: '#ff6b9d',
            },
          },
        }}
      >
        {editingTransaction && (
          <Stack gap="md">
            {/* TODO: Add edit form with pre-populated values */}
            <Box style={{ color: '#8892a6' }}>Editing: {editingTransaction.description}</Box>
          </Stack>
        )}
      </Modal>
    </Box>
  );
}
