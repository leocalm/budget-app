/**
 * CategoryConfirmDialogs - Confirmation dialogs for archive/restore/delete actions
 */
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/Overlays/ConfirmDialog';
import { CategoryManagementRow } from '@/types/category';

interface ArchiveConfirmDialogProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  category: CategoryManagementRow | null;
  isLoading?: boolean;
}

export function ArchiveConfirmDialog({
  opened,
  onClose,
  onConfirm,
  category,
  isLoading = false,
}: ArchiveConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmDialog
      opened={opened}
      title={t('categories.confirm.archive.title')}
      impact={t('categories.confirm.archive.impact', { name: category?.name })}
      safeActionLabel={t('common.cancel')}
      actionLabel={t('categories.confirm.archive.action')}
      onClose={onClose}
      onAction={onConfirm}
      actionColor="gray"
      actionLoading={isLoading}
    >
      <p>{t('categories.confirm.archive.note')}</p>
    </ConfirmDialog>
  );
}

interface ArchiveBlockedDialogProps {
  opened: boolean;
  onClose: () => void;
  category: CategoryManagementRow | null;
}

export function ArchiveBlockedDialog({ opened, onClose, category }: ArchiveBlockedDialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmDialog
      opened={opened}
      title={t('categories.confirm.archiveBlocked.title')}
      impact={t('categories.confirm.archiveBlocked.impact', {
        name: category?.name,
        count: category?.activeChildrenCount ?? 0,
      })}
      safeActionLabel={t('common.cancel')}
      actionLabel={t('categories.confirm.archiveBlocked.ok')}
      onClose={onClose}
      onAction={onClose}
      blockClose={false}
    >
      <p>{t('categories.confirm.archiveBlocked.hint')}</p>
    </ConfirmDialog>
  );
}

interface DeleteConfirmDialogProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  category: CategoryManagementRow | null;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  opened,
  onClose,
  onConfirm,
  category,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmDialog
      opened={opened}
      title={t('categories.confirm.delete.title')}
      impact={t('categories.confirm.delete.impact', { name: category?.name })}
      safeActionLabel={t('common.cancel')}
      actionLabel={t('categories.confirm.delete.action')}
      onClose={onClose}
      onAction={onConfirm}
      actionColor="red"
      actionLoading={isLoading}
    >
      <p>{t('categories.confirm.delete.note')}</p>
    </ConfirmDialog>
  );
}

interface RestoreConfirmDialogProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  category: CategoryManagementRow | null;
  isLoading?: boolean;
}

export function RestoreConfirmDialog({
  opened,
  onClose,
  onConfirm,
  category,
  isLoading = false,
}: RestoreConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmDialog
      opened={opened}
      title={t('categories.confirm.restore.title')}
      impact={t('categories.confirm.restore.impact', { name: category?.name })}
      safeActionLabel={t('common.cancel')}
      actionLabel={t('categories.confirm.restore.action')}
      onClose={onClose}
      onAction={onConfirm}
      actionColor="blue"
      actionLoading={isLoading}
    />
  );
}
