import { Transaction, TransactionRequest, TransactionResponse } from '@/types/transaction';
import { apiDelete, apiGet, apiPost } from './client';

export async function fetchTransactions(
  selectedPeriodId: string | null
): Promise<TransactionResponse[]> {
  const query = selectedPeriodId ? `?period_id=${selectedPeriodId}` : '';
  return apiGet<TransactionResponse[]>(`/api/transactions${query}`);
}

export async function createTransaction(payload: Transaction): Promise<TransactionResponse> {
  const requestPayload: TransactionRequest = {
    description: payload.description,
    amount: payload.amount,
    occurredAt: payload.occurredAt,
    categoryId: payload.category ? payload.category.id : '',
    fromAccountId: payload.fromAccount ? payload.fromAccount.id : '',
    toAccountId: payload.toAccount?.id,
    vendorId: payload.vendor?.id,
  };

  return createTransactionFromRequest(requestPayload);
}

export async function createTransactionFromRequest(
  requestPayload: TransactionRequest
): Promise<TransactionResponse> {
  return apiPost<TransactionResponse, TransactionRequest>('/api/transactions', requestPayload);
}

export async function deleteTransaction(id: string): Promise<void> {
  return apiDelete(`/api/transactions/${id}`);
}
