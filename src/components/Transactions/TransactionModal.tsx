import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@mantine/core';
import { QuickAddTransaction } from './Form/QuickAddTransaction';
import { EditTransactionForm, type EditFormValues } from './Form/EditTransactionForm';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { TransactionResponse } from '@/types/transaction';
import { Vendor } from '@/types/vendor';

interface TransactionModalProps {
  opened: boolean;
  onClose: () => void;
  // If provided → edit mode; if null → add mode
  transaction?: TransactionResponse | null;
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  vendors: Vendor[];
  onSave?: (data: EditFormValues) => Promise<void>;
  isSavePending?: boolean;
}

export const TransactionModal = ({
  opened,
  onClose,
  transaction,
  accounts,
  categories,
  vendors,
  onSave,
  isSavePending = false,
}: TransactionModalProps) => {
  const { t } = useTranslation();
  const isEdit = transaction != null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? t('transactions.modal.editTitle') : t('transactions.modal.addTitle')}
      size="lg"
      centered
    >
      {isEdit && onSave ? (
        <EditTransactionForm
          transaction={transaction}
          accounts={accounts}
          categories={categories}
          vendors={vendors}
          onSave={async (data) => {
            await onSave(data);
            onClose();
          }}
          onCancel={onClose}
          isPending={isSavePending}
        />
      ) : (
        <QuickAddTransaction onSuccess={onClose} />
      )}
    </Modal>
  );
};
