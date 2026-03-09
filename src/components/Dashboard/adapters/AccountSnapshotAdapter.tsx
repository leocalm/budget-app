import { useAccounts } from '@/hooks/useAccounts';
import { AccountSnapshotCard } from '../AccountSnapshotCard';
import type { CardProps } from '../cardRegistry';

export function AccountSnapshotAdapter({ selectedPeriodId, entityId }: CardProps) {
  const { data: accounts, isLoading } = useAccounts(selectedPeriodId);

  const account = accounts?.find((a) => a.id === entityId);

  return <AccountSnapshotCard account={account} isLoading={isLoading} />;
}
