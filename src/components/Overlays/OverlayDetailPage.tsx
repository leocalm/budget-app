import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import {
  useDeleteOverlay,
  useExcludeOverlayTransaction,
  useIncludeOverlayTransaction,
  useOverlay,
  useOverlayTransactions,
} from '@/hooks/useOverlays';
import { useVendors } from '@/hooks/useVendors';
import { formatCurrencyValue } from '@/utils/currency';
import { OverlayFormModal } from './OverlayFormModal';
import { OverlayTransactionsTable } from './OverlayTransactionsTable';
import classes from './OverlayDetailPage.module.css';

export function OverlayDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const overlayId = id ?? null;

  const { selectedPeriodId } = useBudgetPeriodSelection();
  const { data: categories = [] } = useCategories(selectedPeriodId);
  const { data: vendors = [] } = useVendors(selectedPeriodId);
  const { data: accounts = [] } = useAccounts(selectedPeriodId);

  const { data: overlay, isLoading: isLoadingOverlay } = useOverlay(overlayId);
  const { data: transactions = [], isLoading: isLoadingTransactions } =
    useOverlayTransactions(overlayId);

  const includeMutation = useIncludeOverlayTransaction();
  const excludeMutation = useExcludeOverlayTransaction();
  const deleteMutation = useDeleteOverlay();

  const [pendingTransactionId, setPendingTransactionId] = useState<string | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const now = dayjs().startOf('day');
  const isPast = useMemo(() => {
    if (!overlay) {
      return false;
    }

    return dayjs(overlay.endDate).startOf('day').isBefore(now);
  }, [overlay, now]);

  const spentAmount = overlay?.spentAmount ?? 0;
  const totalCapAmount = overlay?.totalCapAmount ?? null;
  const progressValue =
    totalCapAmount && totalCapAmount > 0
      ? Math.min(100, Math.round((spentAmount / totalCapAmount) * 100))
      : 0;

  const remainingDays = overlay
    ? Math.max(dayjs(overlay.endDate).startOf('day').diff(now, 'day') + 1, 0)
    : 0;

  const handleInclude = async (transactionId: string) => {
    if (!overlayId || !transactionId) {
      return;
    }

    setPendingTransactionId(transactionId);

    try {
      await includeMutation.mutateAsync({ overlayId, transactionId });
      notifications.show({
        color: 'green',
        title: t('common.success'),
        message: t('overlays.detail.notifications.included'),
      });
    } catch (error) {
      notifications.show({
        color: 'red',
        title: t('common.error'),
        message:
          error instanceof Error ? error.message : t('overlays.detail.notifications.actionFailed'),
      });
    } finally {
      setPendingTransactionId(null);
    }
  };

  const handleExclude = async (transactionId: string) => {
    if (!overlayId || !transactionId) {
      return;
    }

    setPendingTransactionId(transactionId);

    try {
      await excludeMutation.mutateAsync({ overlayId, transactionId });
      notifications.show({
        color: 'green',
        title: t('common.success'),
        message: t('overlays.detail.notifications.excluded'),
      });
    } catch (error) {
      notifications.show({
        color: 'red',
        title: t('common.error'),
        message:
          error instanceof Error ? error.message : t('overlays.detail.notifications.actionFailed'),
      });
    } finally {
      setPendingTransactionId(null);
    }
  };

  const handleDelete = async () => {
    if (!overlayId) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(overlayId);
      notifications.show({
        color: 'green',
        title: t('common.success'),
        message: t('overlays.deletedSuccess'),
      });
      navigate('/overlays');
    } catch (error) {
      notifications.show({
        color: 'red',
        title: t('common.error'),
        message: error instanceof Error ? error.message : t('overlays.deleteFailed'),
      });
    }
  };

  if (isLoadingOverlay || isLoadingTransactions) {
    return (
      <div className={classes.loadingState}>
        <Loader size="sm" />
      </div>
    );
  }

  if (!overlay) {
    return (
      <Stack gap="sm">
        <Text>{t('overlays.detail.notFound')}</Text>
        <Button variant="light" onClick={() => navigate('/overlays')}>
          {t('overlays.detail.backToList')}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" className={classes.pageRoot}>
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            className={classes.backButton}
            onClick={() => navigate('/overlays')}
          >
            {t('overlays.detail.backToList')}
          </Button>

          <Group gap="xs" wrap="nowrap">
            <Title order={1} className={classes.title}>
              {overlay.icon?.trim() ? `${overlay.icon.trim()} ` : ''}
              {overlay.name}
            </Title>
            <Badge variant="light" color={isPast ? 'gray' : 'green'}>
              {isPast ? t('overlays.status.past') : t('overlays.status.active')}
            </Badge>
            <Badge variant="outline" color="gray">
              {t(`overlays.modes.${overlay.inclusionMode}`)}
            </Badge>
          </Group>

          <Text c="dimmed">
            {dayjs(overlay.startDate).format('MMM D, YYYY')} -{' '}
            {dayjs(overlay.endDate).format('MMM D, YYYY')} •{' '}
            {t('overlays.detail.daysRemaining', { count: remainingDays })}
          </Text>
        </Stack>

        <Group gap="xs">
          <Button
            variant="light"
            leftSection={<IconEdit size={16} />}
            onClick={() => setEditModalOpen(true)}
            disabled={isPast}
          >
            {t('overlays.actions.edit')}
          </Button>
          <Button
            variant="light"
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={() => setDeleteConfirmOpen(true)}
          >
            {t('overlays.actions.delete')}
          </Button>
        </Group>
      </Group>

      <Paper withBorder radius="lg" p="lg">
        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={700}>{t('overlays.detail.spendSummary')}</Text>
            {totalCapAmount ? (
              <Text fw={700} className={classes.moneyValue}>
                €{formatCurrencyValue(spentAmount)} / €{formatCurrencyValue(totalCapAmount)}
              </Text>
            ) : (
              <Text c="dimmed">{t('overlays.detail.noCap')}</Text>
            )}
          </Group>

          {totalCapAmount && (
            <>
              <Progress
                value={progressValue}
                color={spentAmount > totalCapAmount ? 'red' : 'cyan'}
                radius="xl"
                size="sm"
              />
              <Text size="sm" c={spentAmount > totalCapAmount ? 'red' : 'dimmed'}>
                {spentAmount > totalCapAmount
                  ? t('overlays.detail.overBy', {
                      amount: `€${formatCurrencyValue(spentAmount - totalCapAmount)}`,
                    })
                  : t('overlays.detail.remaining', {
                      amount: `€${formatCurrencyValue(totalCapAmount - spentAmount)}`,
                    })}
              </Text>
            </>
          )}
        </Stack>
      </Paper>

      <Paper withBorder radius="lg" p="lg">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={3}>{t('overlays.detail.transactions.title')}</Title>
            <Badge variant="light" color="gray">
              {t('overlays.detail.transactions.count', { count: transactions.length })}
            </Badge>
          </Group>

          {transactions.length === 0 ? (
            <Text c="dimmed">{t('overlays.detail.transactions.empty')}</Text>
          ) : (
            <OverlayTransactionsTable
              transactions={transactions}
              pendingTransactionId={pendingTransactionId}
              onInclude={handleInclude}
              onExclude={handleExclude}
              readOnly={isPast}
            />
          )}
        </Stack>
      </Paper>

      {isEditModalOpen && (
        <OverlayFormModal
          opened={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          overlay={overlay}
          categories={categories}
          vendors={vendors}
          accounts={accounts}
        />
      )}

      <Modal
        opened={isDeleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t('overlays.actions.delete')}
        centered
      >
        <Stack gap="md">
          <Text>{t('overlays.confirmDelete', { name: overlay.name })}</Text>

          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setDeleteConfirmOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button color="red" onClick={handleDelete} loading={deleteMutation.isPending}>
              {t('overlays.actions.delete')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
