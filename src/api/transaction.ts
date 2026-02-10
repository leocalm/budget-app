import {
  Transaction,
  TransactionRequest,
  TransactionResponse,
  TransactionsPage,
} from '@/types/transaction';
import { apiDelete, apiGet, apiGetRaw, apiPost, apiPut } from './client';

export async function fetchTransactions(
  selectedPeriodId: string | null
): Promise<TransactionResponse[]> {
  const query = selectedPeriodId ? `?period_id=${selectedPeriodId}` : '';
  return apiGet<TransactionResponse[]>(`/api/transactions${query}`);
}

function toOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function parseTransactionsPageResponse(response: unknown): TransactionsPage {
  if (Array.isArray(response)) {
    return { transactions: response as TransactionResponse[], nextCursor: null };
  }

  if (!response || typeof response !== 'object') {
    return { transactions: [], nextCursor: null };
  }

  const payload = response as Record<string, unknown>;
  const pagination =
    payload.pagination && typeof payload.pagination === 'object'
      ? (payload.pagination as Record<string, unknown>)
      : undefined;

  const nextCursor =
    toOptionalString(payload.nextCursor) ??
    toOptionalString(payload.cursor) ??
    toOptionalString(pagination?.nextCursor) ??
    toOptionalString(pagination?.cursor) ??
    null;

  const topLevelTransactions =
    (Array.isArray(payload.transactions) && (payload.transactions as TransactionResponse[])) ||
    (Array.isArray(payload.items) && (payload.items as TransactionResponse[])) ||
    null;

  if (topLevelTransactions) {
    return { transactions: topLevelTransactions, nextCursor };
  }

  const dataPayload =
    payload.data && typeof payload.data === 'object'
      ? (payload.data as Record<string, unknown>)
      : undefined;

  if (Array.isArray(dataPayload)) {
    return { transactions: dataPayload as TransactionResponse[], nextCursor };
  }

  if (dataPayload) {
    const nestedTransactions =
      (Array.isArray(dataPayload.transactions) &&
        (dataPayload.transactions as TransactionResponse[])) ||
      (Array.isArray(dataPayload.items) && (dataPayload.items as TransactionResponse[])) ||
      null;

    if (nestedTransactions) {
      return {
        transactions: nestedTransactions,
        nextCursor: toOptionalString(dataPayload.nextCursor) ?? nextCursor,
      };
    }
  }

  return { transactions: [], nextCursor };
}

export interface FetchTransactionsPageParams {
  selectedPeriodId: string | null;
  cursor?: string | null;
  pageSize?: number;
}

export async function fetchTransactionsPage({
  selectedPeriodId,
  cursor,
  pageSize = 50,
}: FetchTransactionsPageParams): Promise<TransactionsPage> {
  const searchParams = new URLSearchParams();
  if (selectedPeriodId) {
    searchParams.set('period_id', selectedPeriodId);
  }
  searchParams.set('page_size', String(pageSize));
  if (cursor) {
    searchParams.set('cursor', cursor);
  }

  const query = searchParams.toString();
  const response = await apiGetRaw<unknown>(`/api/transactions?${query}`);
  return parseTransactionsPageResponse(response);
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

export async function updateTransaction(
  id: string,
  requestPayload: TransactionRequest
): Promise<TransactionResponse> {
  return apiPut<TransactionResponse, TransactionRequest>(`/api/transactions/${id}`, requestPayload);
}
