import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { Vendor } from '@/types/vendor';

export const TRANSACTION_TYPES = ['Incoming', 'Outgoing', 'Transfer'] as const;

export interface TransactionResponse {
  id: string;
  description: string;
  amount: number;
  occurredAt: string;
  category: CategoryResponse;
  fromAccount: AccountResponse;
  toAccount: AccountResponse | null;
  vendor: Vendor | null;
}

export interface Transaction {
  description: string;
  amount: number;
  occurredAt: string;
  category: CategoryResponse | undefined;
  fromAccount: AccountResponse | undefined;
  toAccount: AccountResponse | undefined;
  vendor: Vendor | undefined;
}

export interface TransactionRequest {
  description: string;
  amount: number;
  occurredAt: string;
  categoryId: string;
  fromAccountId: string;
  toAccountId: string | undefined;
  vendorId: string | undefined;
}

export interface TransactionsPage {
  transactions: TransactionResponse[];
  nextCursor: string | null;
}
