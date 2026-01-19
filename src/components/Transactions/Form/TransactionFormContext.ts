import { createFormContext } from '@mantine/form';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { Vendor } from '@/types/vendor';

export type TransactionFormValues = {
  description: string;
  amount: number;
  occurredAt: string;

  fromAccountName: string | null;
  toAccountName: string | null;
  categoryName: string | null;
  vendorName: string;

  fromAccount?: AccountResponse;
  toAccount?: AccountResponse;
  category?: CategoryResponse;
  vendor?: Vendor;
};

export const [TransactionFormProvider, useTransactionFormContext, useTransactionForm] =
  createFormContext<TransactionFormValues>();
