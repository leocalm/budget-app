import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useAccounts } from '@/hooks/useAccounts';
import { useBudgetPeriods } from '@/hooks/useBudget';
import { useCategories } from '@/hooks/useCategories';
import {
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from '@/hooks/useTransactions';
import { useCreateVendor, useVendors } from '@/hooks/useVendors';
import { TransactionRequest, TransactionResponse } from '@/types/transaction';
import { convertDisplayToCents } from '@/utils/currency';
import { formatDateForApi } from '@/utils/date';
import { EditFormValues, EditTransactionForm, QuickAddTransaction } from './Form';
import { PageHeader } from './PageHeader';
import { TransactionStats } from './Stats';
import { TransactionFilters, TransactionsSection, TransactionTypeFilter } from './Table';

export function TransactionsContainer() {
  const { t } = useTranslation();
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
  const { data: accounts = [] } = useAccounts(selectedPeriodId);
  const { data: categories = [] } = useCategories(selectedPeriodId);
  const { data: vendors = [] } = useVendors(selectedPeriodId);

  // Find the selected period from periods list
  const selectedPeriod = useMemo(() => {
    if (!periods || !selectedPeriodId) {
      return null;
    }
    return periods.find((p) => p.id === selectedPeriodId) || null;
  }, [periods, selectedPeriodId]);

  // Mutations
  const deleteTransactionMutation = useDeleteTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const createVendorMutation = useCreateVendor();

  // Client-side filtering
  const filteredTransactions = useMemo(() => {
    if (!transactions) {
      return [];
    }

    return transactions.filter((tx) => {
      // Filter by Type
      if (typeFilter !== 'all' && tx.category.categoryType !== typeFilter) {
        return false;
      }

      // Filter by Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesDesc = tx.description?.toLowerCase().includes(query);
        const matchesVendor = tx.vendor?.name.toLowerCase().includes(query);
        const matchesCategory = tx.category.name.toLowerCase().includes(query);
        const matchesAmount = tx.amount.toString().includes(query);

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
      (acc, tx) => {
        if (tx.category.categoryType === 'Incoming') {
          acc.income += tx.amount;
          acc.balance += tx.amount;
        } else if (tx.category.categoryType === 'Outgoing') {
          acc.expenses += tx.amount;
          acc.balance -= tx.amount;
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

  // Handle save edited transaction
  const handleSaveEdit = async (values: EditFormValues) => {
    if (!editingTransaction) {
      return;
    }

    // Find or create vendor
    let vendorId: string | undefined = undefined;
    if (values.vendorName.trim()) {
      const existingVendor = vendors.find(
        (v) => v.name.toLowerCase() === values.vendorName.toLowerCase()
      );
      if (existingVendor) {
        vendorId = existingVendor.id;
      } else {
        const newVendor = await createVendorMutation.mutateAsync({
          name: values.vendorName.trim(),
        });
        vendorId = newVendor.id;
      }
    }

    const transactionData: TransactionRequest = {
      description: values.description.trim(),
      amount: convertDisplayToCents(values.amount),
      occurredAt: formatDateForApi(values.occurredAt!),
      categoryId: values.categoryId,
      fromAccountId: values.fromAccountId,
      toAccountId: values.categoryType === 'Transfer' ? values.toAccountId : undefined,
      vendorId,
    };

    await updateTransactionMutation.mutateAsync({
      id: editingTransaction.id,
      data: transactionData,
    });

    closeEditModal();
    setEditingTransaction(null);
  };

  // Handle delete transaction
  const handleDelete = async (id: string) => {
    // eslint-disable-next-line no-alert
    if (window.confirm(t('transactions.container.confirmDelete'))) {
      await deleteTransactionMutation.mutateAsync(id);
    }
  };

  // Get period display name
  const periodName = useMemo(() => {
    if (!selectedPeriod?.startDate) {
      return t('transactions.container.thisPeriod');
    }
    const start = new Date(selectedPeriod.endDate);
    return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedPeriod, t]);

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
        title={t('transactions.container.title')}
        subtitle={t('transactions.container.subtitle')}
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
        onClose={() => {
          closeEditModal();
          setEditingTransaction(null);
        }}
        title={t('transactions.container.editTitle')}
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
          body: {
            padding: '24px',
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
          <EditTransactionForm
            transaction={editingTransaction}
            accounts={accounts}
            categories={categories}
            vendors={vendors}
            onSave={handleSaveEdit}
            onCancel={() => {
              closeEditModal();
              setEditingTransaction(null);
            }}
            isPending={updateTransactionMutation.isPending}
          />
        )}
      </Modal>
    </Box>
  );
}
