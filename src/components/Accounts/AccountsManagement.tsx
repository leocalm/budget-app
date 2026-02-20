import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Group, Loader, Modal, NumberInput, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { ConfirmDialog } from '@/components/Overlays/ConfirmDialog';
import {
  useAccountsManagement,
  useAdjustStartingBalance,
  useArchiveAccount,
  useDeleteAccount,
  useRestoreAccount,
} from '@/hooks/useAccounts';
import { toast } from '@/lib/toast';
import { AccountManagementResponse, AccountType } from '@/types/account';
import { convertCentsToDisplay, convertDisplayToCents, formatCurrency } from '@/utils/currency';
import { CreateAccountForm } from './CreateAccountForm';
import { EditAccountForm } from './EditAccountForm';
import styles from './Accounts.module.css';

type ConfirmAction = 'archive' | 'restore' | 'delete' | null;

interface AccountManagementRowProps {
  account: AccountManagementResponse;
  onEdit: (account: AccountManagementResponse) => void;
  onArchive: (account: AccountManagementResponse) => void;
  onRestore: (account: AccountManagementResponse) => void;
  onDelete: (account: AccountManagementResponse) => void;
}

function AccountManagementRow({
  account,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: AccountManagementRowProps) {
  const { t } = useTranslation();

  return (
    <Box className={`${styles.mgmtRow} ${account.isArchived ? styles.mgmtRowArchived : ''}`}>
      {/* Icon frame */}
      <Box className={styles.mgmtIconFrame}>
        <Box component="span" className={styles.mgmtIconEmoji}>
          {account.icon}
        </Box>
      </Box>

      {/* Name + meta */}
      <Box className={styles.mgmtAccountInfo}>
        <Text className={styles.mgmtAccountName}>{account.name}</Text>
        <Text className={styles.mgmtAccountMeta}>
          {t('accounts.management.columns.type')}:{' '}
          <strong>{t(`accounts.types.${account.accountType}`)}</strong>
          {' | '}
          {t('accounts.management.columns.currency')}: <strong>{account.currency.currency}</strong>
        </Text>
      </Box>

      {/* Starting balance */}
      <Box className={styles.mgmtBalanceColumn}>
        <Text component="span" className={styles.mgmtBalanceLabel}>
          {t('accounts.management.columns.startingBalance')}
        </Text>
        <Text component="span" className={styles.mgmtBalanceValue}>
          {formatCurrency(account.balance, account.currency)}
        </Text>
      </Box>

      {/* Status */}
      <Box className={styles.mgmtStatusColumn}>
        <Box
          component="span"
          className={`${styles.mgmtStatusDot} ${
            account.isArchived ? styles.mgmtStatusDotArchived : styles.mgmtStatusDotActive
          }`}
        />
        <Text size="sm">
          {account.isArchived
            ? t('accounts.management.status.archived')
            : t('accounts.management.status.active')}
        </Text>
      </Box>

      {/* Actions */}
      <Box className={styles.mgmtActionsColumn}>
        <Button size="xs" variant="default" onClick={() => onEdit(account)}>
          {t('accounts.management.actions.edit')}
        </Button>
        {account.isArchived ? (
          <Button size="xs" variant="default" onClick={() => onRestore(account)}>
            {t('accounts.management.actions.restore')}
          </Button>
        ) : (
          <Button size="xs" variant="default" onClick={() => onArchive(account)}>
            {t('accounts.management.actions.archive')}
          </Button>
        )}
        {account.canDelete && (
          <Button size="xs" variant="default" color="red" onClick={() => onDelete(account)}>
            {t('accounts.management.actions.delete')}
          </Button>
        )}
      </Box>
    </Box>
  );
}

interface AdjustBalanceModalProps {
  account: AccountManagementResponse | null;
  opened: boolean;
  onClose: () => void;
}

function AdjustBalanceModal({ account, opened, onClose }: AdjustBalanceModalProps) {
  const { t } = useTranslation();
  const adjustMutation = useAdjustStartingBalance();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      newBalance: account ? convertCentsToDisplay(account.balance) : 0,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!account) {
      return;
    }
    try {
      await adjustMutation.mutateAsync({
        id: account.id,
        payload: { newBalance: convertDisplayToCents(values.newBalance) },
      });
      toast.success({ message: t('accounts.success.balanceAdjusted') });
      onClose();
    } catch {
      toast.error({ message: t('accounts.errors.adjustBalanceFailed') });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('accounts.management.adjustBalanceModal.title')}
    >
      <form onSubmit={form.onSubmit((values) => void handleSubmit(values))}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t('accounts.management.adjustBalanceModal.description', { name: account?.name ?? '' })}
          </Text>
          <NumberInput
            label={t('accounts.management.adjustBalanceModal.newBalance')}
            decimalScale={2}
            fixedDecimalScale
            {...form.getInputProps('newBalance')}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={onClose}>
              {t('accounts.management.adjustBalanceModal.cancel')}
            </Button>
            <Button type="submit" loading={adjustMutation.isPending}>
              {t('accounts.management.adjustBalanceModal.confirm')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export function AccountsManagement() {
  const { t } = useTranslation();
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editAccount, setEditAccount] = useState<AccountManagementResponse | null>(null);
  const [adjustAccount, setAdjustAccount] = useState<AccountManagementResponse | null>(null);
  const [actionAccount, setActionAccount] = useState<AccountManagementResponse | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const { data: accounts = [], isLoading, isError } = useAccountsManagement();

  const archiveMutation = useArchiveAccount();
  const restoreMutation = useRestoreAccount();
  const deleteMutation = useDeleteAccount();

  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const archivedAccounts = accounts.filter((a) => a.isArchived);

  const typeOrder: AccountType[] = ['Checking', 'Savings', 'Allowance', 'CreditCard', 'Wallet'];

  const groupedActive = typeOrder
    .map((type) => ({
      type,
      accounts: activeAccounts.filter((a) => a.accountType === type),
    }))
    .filter((g) => g.accounts.length > 0);

  const openConfirm = (account: AccountManagementResponse, action: ConfirmAction) => {
    setActionAccount(account);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    setActionAccount(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!actionAccount || !confirmAction) {
      return;
    }

    try {
      if (confirmAction === 'archive') {
        await archiveMutation.mutateAsync(actionAccount.id);
        toast.success({ message: t('accounts.success.archived') });
      } else if (confirmAction === 'restore') {
        await restoreMutation.mutateAsync(actionAccount.id);
        toast.success({ message: t('accounts.success.restored') });
      } else if (confirmAction === 'delete') {
        await deleteMutation.mutateAsync(actionAccount.id);
        toast.success({ message: t('accounts.success.deleted') });
      }
      closeConfirm();
    } catch {
      if (confirmAction === 'archive') {
        toast.error({ message: t('accounts.errors.archiveFailed') });
      } else if (confirmAction === 'restore') {
        toast.error({ message: t('accounts.errors.restoreFailed') });
      } else {
        toast.error({ message: t('accounts.errors.deleteFailed') });
      }
    }
  };

  const confirmTitle =
    confirmAction === 'archive'
      ? t('accounts.management.archiveConfirm.title')
      : confirmAction === 'restore'
        ? t('accounts.management.restoreConfirm.title')
        : t('accounts.management.deleteConfirm.title');

  const confirmMessage =
    confirmAction === 'archive'
      ? t('accounts.management.archiveConfirm.message', { name: actionAccount?.name })
      : confirmAction === 'restore'
        ? t('accounts.management.restoreConfirm.message', { name: actionAccount?.name })
        : t('accounts.management.deleteConfirm.message', { name: actionAccount?.name });

  const confirmLabel =
    confirmAction === 'archive'
      ? t('accounts.management.archiveConfirm.confirm')
      : confirmAction === 'restore'
        ? t('accounts.management.restoreConfirm.confirm')
        : t('accounts.management.deleteConfirm.confirm');

  const confirmColor =
    confirmAction === 'delete' ? 'red' : confirmAction === 'restore' ? 'blue' : 'gray';

  if (isLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    );
  }

  if (isError) {
    return <Alert color="red">{t('common.error')}</Alert>;
  }

  return (
    <Stack gap="lg">
      {/* Header action */}
      <Group justify="flex-end">
        <Button onClick={openCreate} className={styles.addButton}>
          + {t('accounts.management.addAccount')}
        </Button>
      </Group>

      {/* Active accounts grouped by type */}
      {groupedActive.map(({ type, accounts: typeAccounts }) => (
        <Box key={type} className={styles.mgmtSection}>
          <Text className={styles.mgmtSectionHeader}>{t(`accounts.types.${type}`)}</Text>
          {typeAccounts.map((account) => (
            <AccountManagementRow
              key={account.id}
              account={account}
              onEdit={setEditAccount}
              onArchive={(a) => openConfirm(a, 'archive')}
              onRestore={(a) => openConfirm(a, 'restore')}
              onDelete={(a) => openConfirm(a, 'delete')}
            />
          ))}
        </Box>
      ))}

      {/* Archived section */}
      {archivedAccounts.length > 0 && (
        <Box className={styles.mgmtSection}>
          <Text className={styles.mgmtSectionHeader}>
            {t('accounts.management.archivedSection')}
          </Text>
          {archivedAccounts.map((account) => (
            <AccountManagementRow
              key={account.id}
              account={account}
              onEdit={setEditAccount}
              onArchive={(a) => openConfirm(a, 'archive')}
              onRestore={(a) => openConfirm(a, 'restore')}
              onDelete={(a) => openConfirm(a, 'delete')}
            />
          ))}
        </Box>
      )}

      {/* Create modal */}
      <Modal
        opened={createOpened}
        onClose={closeCreate}
        title={t('accounts.management.createModal.title')}
        size="lg"
      >
        <CreateAccountForm onAccountCreated={closeCreate} />
      </Modal>

      {/* Edit modal */}
      <Modal
        opened={editAccount !== null}
        onClose={() => setEditAccount(null)}
        title={t('accounts.management.editModal.title')}
        size="lg"
      >
        {editAccount && (
          <>
            <Text size="xs" c="dimmed" mb="md">
              {t('accounts.management.editModal.typeImmutable')}
            </Text>
            <EditAccountForm
              account={{
                ...editAccount,
                balancePerDay: [],
                balanceChangeThisPeriod: 0,
                transactionCount: editAccount.transactionCount,
              }}
              onUpdated={() => setEditAccount(null)}
            />
          </>
        )}
      </Modal>

      {/* Adjust balance modal */}
      <AdjustBalanceModal
        account={adjustAccount}
        opened={adjustAccount !== null}
        onClose={() => setAdjustAccount(null)}
      />

      {/* Confirm dialog */}
      <ConfirmDialog
        opened={confirmAction !== null}
        title={confirmTitle}
        impact={confirmMessage}
        safeActionLabel={t('common.cancel')}
        actionLabel={confirmLabel}
        onClose={closeConfirm}
        onAction={() => void handleConfirmAction()}
        actionColor={confirmColor}
        actionLoading={
          archiveMutation.isPending || restoreMutation.isPending || deleteMutation.isPending
        }
      />
    </Stack>
  );
}
