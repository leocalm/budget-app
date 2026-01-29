import { TransactionsTable } from '@/components/Transactions';
import { TransactionResponse } from '@/types/transaction';

interface RecentTransactionsCardProps {
  data: TransactionResponse[];
}

export function RecentTransactionsCard({ data }: RecentTransactionsCardProps) {
  return (
    <TransactionsTable
      transactions={data}
      isError={false}
      isLoading={false}
      insertEnabled={false}
    />
  );
}
