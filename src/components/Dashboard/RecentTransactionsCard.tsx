import { TransactionsTable } from '@/components/Transactions';
import { TransactionResponse } from '@/types/transaction';

interface RecentTransactionsCardProps {
  isLocked?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  data: TransactionResponse[];
}

export function RecentTransactionsCard({
  isLocked = false,
  isLoading = false,
  isError = false,
  onRetry = () => {},
  data,
}: RecentTransactionsCardProps) {
  return (
    <TransactionsTable
      transactions={data}
      isLocked={isLocked}
      isError={isError}
      isLoading={isLoading}
      onRetry={onRetry}
      insertEnabled={false}
    />
  );
}
