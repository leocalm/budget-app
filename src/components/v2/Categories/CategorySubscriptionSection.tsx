import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Menu,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { ConfirmDeleteModal } from '@/components/v2/ConfirmDeleteModal';
import { CancelSubscriptionModal, SubscriptionFormDrawer } from '@/components/v2/Subscriptions';
import { useDeleteSubscription, useSubscriptionsByCategory } from '@/hooks/v2/useSubscriptions';
import { toast } from '@/lib/toast';
import { CYCLE_LABELS } from '../Subscriptions/subscriptionUtils';

type SubscriptionResponse = components['schemas']['SubscriptionResponse'];

interface CategorySubscriptionSectionProps {
  categoryId: string;
}

export function CategorySubscriptionSection({ categoryId }: CategorySubscriptionSectionProps) {
  const { t } = useTranslation('v2');
  const { data: subscriptions, isLoading, isError } = useSubscriptionsByCategory(categoryId);
  const deleteMutation = useDeleteSubscription();

  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [editSubId, setEditSubId] = useState<string | null>(null);
  const [cancelOpened, { open: openCancel, close: closeCancel }] = useDisclosure(false);
  const [cancelSub, setCancelSub] = useState<SubscriptionResponse | null>(null);

  const [deleteConfirmOpened, { open: openDeleteConfirm, close: closeDeleteConfirm }] =
    useDisclosure(false);
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);
  const [deletePendingName, setDeletePendingName] = useState<string>('');

  // Issue 1: Only count truly active subs (not paused) in the monthly total
  const activeSubs = useMemo(
    () => (subscriptions ?? []).filter((s) => s.status === 'active'),
    [subscriptions]
  );

  const monthlyTotal = useMemo(() => {
    let raw = 0;
    for (const sub of activeSubs) {
      switch (sub.billingCycle) {
        case 'monthly':
          raw += sub.billingAmount;
          break;
        case 'quarterly':
          raw += sub.billingAmount / 3;
          break;
        case 'yearly':
          raw += sub.billingAmount / 12;
          break;
      }
    }
    return Math.round(raw);
  }, [activeSubs]);

  const handleEdit = (sub: SubscriptionResponse) => {
    setEditSubId(sub.id);
    openForm();
  };

  const handleCloseForm = () => {
    setEditSubId(null);
    closeForm();
  };

  const handleCancel = (sub: SubscriptionResponse) => {
    setCancelSub(sub);
    openCancel();
  };

  // Issue 2: Show confirm dialog before deleting
  const handleDeleteRequest = (sub: SubscriptionResponse) => {
    setDeletePendingId(sub.id);
    setDeletePendingName(sub.name);
    openDeleteConfirm();
  };

  const handleDeleteConfirm = async () => {
    if (!deletePendingId) {
      return;
    }
    closeDeleteConfirm();
    try {
      await deleteMutation.mutateAsync(deletePendingId);
      toast.success({ message: t('subscriptions.deleted') });
    } catch {
      toast.error({ message: t('subscriptions.deleteFailed') });
    } finally {
      setDeletePendingId(null);
      setDeletePendingName('');
    }
  };

  // Issue 5: Map status to translated label
  const statusLabel = (status: SubscriptionResponse['status']): string => {
    switch (status) {
      case 'active':
        return t('subscriptions.stats.active');
      case 'paused':
        return t('subscriptions.paused');
      case 'cancelled':
        return t('common.cancelled');
      default:
        return status;
    }
  };

  // Issue 5: Map billingCycle to translated suffix
  const cycleLabel = (cycle: SubscriptionResponse['billingCycle']): string =>
    t(`subscriptions.cycleSuffix.${cycle}`, { defaultValue: CYCLE_LABELS[cycle] });

  if (isLoading) {
    return (
      <Stack gap="xs">
        <Skeleton height={20} width={160} />
        {[1, 2].map((i) => (
          <Skeleton key={i} height={44} radius="md" />
        ))}
      </Stack>
    );
  }

  if (isError) {
    return (
      <Alert variant="light" color="gray">
        {t('subscriptions.loadError')}
      </Alert>
    );
  }

  const allSubs = subscriptions ?? [];

  return (
    <Stack gap="sm">
      {/* Monthly total summary */}
      {activeSubs.length > 0 && (
        <Group justify="space-between" align="center">
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            {t('categories.subscriptionSection.monthlyTotal')}
          </Text>
          <Text fz="sm" fw={700} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={monthlyTotal} />
            <Text span fz="xs" c="dimmed">
              {cycleLabel('monthly')}
            </Text>
          </Text>
        </Group>
      )}

      {/* Subscription list */}
      {allSubs.length === 0 ? (
        <Text fz="sm" c="dimmed" ta="center" py="md">
          {t('categories.subscriptionSection.empty')}
        </Text>
      ) : (
        allSubs.map((sub) => {
          const isCancelled = sub.status === 'cancelled';
          return (
            <Group
              key={sub.id}
              justify="space-between"
              align="center"
              px="sm"
              py="xs"
              style={{
                borderRadius: 'var(--mantine-radius-md)',
                border: '1px solid var(--v2-border)',
                background: 'var(--v2-card)',
                opacity: isCancelled ? 0.55 : 1,
              }}
            >
              {/* Name + cycle */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text fz="sm" fw={600} truncate>
                  {sub.name}
                </Text>
                {/* Issue 5: translated billing cycle */}
                <Text fz="xs" c="dimmed">
                  {cycleLabel(sub.billingCycle)}
                </Text>
              </div>

              {/* Amount */}
              <Text fz="sm" fw={600} ff="var(--mantine-font-family-monospace)" mr="xs">
                <CurrencyValue cents={sub.billingAmount} />
                <Text span fz="xs" c="dimmed">
                  {cycleLabel(sub.billingCycle)}
                </Text>
              </Text>

              {/* Status badge — Issue 5: translated status */}
              <Badge
                size="xs"
                variant="light"
                color={
                  sub.status === 'active' ? 'blue' : sub.status === 'paused' ? 'yellow' : 'gray'
                }
                mr="xs"
              >
                {statusLabel(sub.status)}
              </Badge>

              {/* Kebab menu */}
              {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
              <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <Menu position="bottom-end" withinPortal>
                  <Menu.Target>
                    {/* Issue 6: translated aria-label */}
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      aria-label={t('categories.subscriptionSection.actionsFor', {
                        name: sub.name,
                      })}
                    >
                      <Text fz="lg" lh={1}>
                        ⋮
                      </Text>
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item onClick={() => handleEdit(sub)}>{t('common.edit')}</Menu.Item>
                    {!isCancelled && (
                      <Menu.Item color="orange" onClick={() => handleCancel(sub)}>
                        {t('common.cancel')}
                      </Menu.Item>
                    )}
                    {/* Issue 2 & 3: open confirm dialog, disable while pending */}
                    <Menu.Item
                      color="red"
                      disabled={deleteMutation.isPending}
                      onClick={() => handleDeleteRequest(sub)}
                    >
                      {t('common.delete')}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </div>
            </Group>
          );
        })
      )}

      {/* Add Subscription button */}
      <Button variant="light" size="xs" onClick={openForm} style={{ alignSelf: 'flex-start' }}>
        {t('subscriptions.addSubscription')}
      </Button>

      <SubscriptionFormDrawer
        key={editSubId ?? 'category-section-create'}
        opened={formOpened}
        onClose={handleCloseForm}
        fixedCategoryId={categoryId}
        editSubscriptionId={editSubId}
      />

      {cancelSub && (
        <CancelSubscriptionModal
          opened={cancelOpened}
          onClose={closeCancel}
          subscription={cancelSub}
        />
      )}

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        opened={deleteConfirmOpened}
        onClose={closeDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        entityName={deletePendingName}
        loading={deleteMutation.isPending}
      />
    </Stack>
  );
}
