import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconPlus, IconTargetArrow } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Badge, Button, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useDeleteOverlay, useOverlays } from '@/hooks/useOverlays';
import { useVendors } from '@/hooks/useVendors';
import { toast } from '@/lib/toast';
import { Overlay } from '@/types/overlay';
import { ConfirmDialog } from './ConfirmDialog';
import { OverlayCard } from './OverlayCard';
import { OverlayFormModal } from './OverlayFormModal';
import classes from './OverlaysPage.module.css';

const sortByStartDateDesc = (left: Overlay, right: Overlay) =>
  dayjs(right.startDate).valueOf() - dayjs(left.startDate).valueOf();

export function OverlaysPage() {
  const { t } = useTranslation();
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const { data: overlays = [], isLoading } = useOverlays();
  const { data: categories = [] } = useCategories(selectedPeriodId);
  const { data: vendors = [] } = useVendors(selectedPeriodId);
  const { data: accounts = [] } = useAccounts(selectedPeriodId);
  const deleteOverlayMutation = useDeleteOverlay();

  const [isPastOpen, setIsPastOpen] = useState(false);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingOverlay, setEditingOverlay] = useState<Overlay | null>(null);
  const [overlayPendingDelete, setOverlayPendingDelete] = useState<Overlay | null>(null);

  const groupedOverlays = useMemo(() => {
    const now = dayjs().startOf('day');

    const active = overlays
      .filter((overlay) => {
        const start = dayjs(overlay.startDate).startOf('day');
        const end = dayjs(overlay.endDate).startOf('day');
        return (start.isBefore(now) || start.isSame(now)) && (end.isAfter(now) || end.isSame(now));
      })
      .sort(sortByStartDateDesc);

    const upcoming = overlays
      .filter((overlay) => dayjs(overlay.startDate).startOf('day').isAfter(now))
      .sort(sortByStartDateDesc);

    const past = overlays
      .filter((overlay) => dayjs(overlay.endDate).startOf('day').isBefore(now))
      .sort(sortByStartDateDesc);

    return {
      active,
      upcoming,
      past,
    };
  }, [overlays]);

  const openCreateModal = () => {
    setEditingOverlay(null);
    setFormOpen(true);
  };

  const openEditModal = (overlay: Overlay) => {
    setEditingOverlay(overlay);
    setFormOpen(true);
  };

  const closeFormModal = () => {
    setEditingOverlay(null);
    setFormOpen(false);
  };

  const handleDelete = (overlay: Overlay) => {
    setOverlayPendingDelete(overlay);
  };

  const confirmDelete = async () => {
    if (!overlayPendingDelete) {
      return;
    }

    try {
      await deleteOverlayMutation.mutateAsync(overlayPendingDelete.id);
      toast.success({
        title: t('common.success'),
        message: t('overlays.deletedSuccess'),
      });
      setOverlayPendingDelete(null);
    } catch (error) {
      toast.error({
        title: t('common.error'),
        message: error instanceof Error ? error.message : t('overlays.deleteFailed'),
        nonCritical: true,
        action: {
          label: t('common.retry'),
          onClick: () => {
            void confirmDelete();
          },
        },
      });
    }
  };

  const showDetailNotReady = () => {
    toast.info({
      title: t('common.info'),
      message: t('overlays.detailComingSoon'),
    });
  };

  if (isLoading) {
    return (
      <div className={classes.loadingState}>
        <Loader size="sm" />
      </div>
    );
  }

  return (
    <Stack gap="xl" className={classes.pageRoot}>
      <div>
        <Title order={1}>{t('overlays.page.title')}</Title>
        <Text c="dimmed">{t('overlays.page.description')}</Text>
      </div>

      {overlays.length === 0 ? (
        <Paper withBorder radius="lg" p="xl" className={classes.emptyState}>
          <Stack align="center" gap="sm">
            <IconTargetArrow size={36} className={classes.emptyIcon} />
            <Title order={3}>{t('overlays.empty.title')}</Title>
            <Text c="dimmed" ta="center" maw={560}>
              {t('overlays.empty.description')}
            </Text>
            <Button mt="sm" leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
              {t('overlays.createOverlay')}
            </Button>
          </Stack>
        </Paper>
      ) : (
        <>
          <section>
            <Group justify="space-between" align="center">
              <Title order={3}>{t('overlays.sections.active')}</Title>
              <Badge variant="light" color="green">
                {groupedOverlays.active.length}
              </Badge>
            </Group>

            <Stack gap="md" mt="md">
              {groupedOverlays.active.length > 0 ? (
                groupedOverlays.active.map((overlay) => (
                  <OverlayCard
                    key={overlay.id}
                    overlay={overlay}
                    status="active"
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    onView={showDetailNotReady}
                  />
                ))
              ) : (
                <Text c="dimmed">{t('overlays.empty.active')}</Text>
              )}
            </Stack>
          </section>

          <section>
            <Group justify="space-between" align="center">
              <Title order={3}>{t('overlays.sections.upcoming')}</Title>
              <Badge variant="light" color="cyan">
                {groupedOverlays.upcoming.length}
              </Badge>
            </Group>

            <Stack gap="md" mt="md">
              {groupedOverlays.upcoming.length > 0 ? (
                groupedOverlays.upcoming.map((overlay) => (
                  <OverlayCard
                    key={overlay.id}
                    overlay={overlay}
                    status="upcoming"
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    onView={showDetailNotReady}
                  />
                ))
              ) : (
                <Text c="dimmed">{t('overlays.empty.upcoming')}</Text>
              )}
            </Stack>
          </section>

          <section>
            <Group justify="space-between" align="center">
              <Title order={3}>{t('overlays.sections.past')}</Title>
              <Group gap="xs">
                <Badge variant="light" color="gray">
                  {groupedOverlays.past.length}
                </Badge>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => setIsPastOpen((current) => !current)}
                  aria-label={t('overlays.actions.togglePast')}
                >
                  {isPastOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                </ActionIcon>
              </Group>
            </Group>

            {isPastOpen && (
              <Stack gap="md" mt="md">
                {groupedOverlays.past.length > 0 ? (
                  groupedOverlays.past.map((overlay) => (
                    <OverlayCard
                      key={overlay.id}
                      overlay={overlay}
                      status="past"
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      onView={showDetailNotReady}
                    />
                  ))
                ) : (
                  <Text c="dimmed">{t('overlays.empty.past')}</Text>
                )}
              </Stack>
            )}
          </section>
        </>
      )}

      <Button
        className={classes.fab}
        radius="xl"
        size="lg"
        leftSection={<IconPlus size={16} />}
        onClick={openCreateModal}
      >
        {t('overlays.createOverlay')}
      </Button>

      <OverlayFormModal
        opened={isFormOpen}
        onClose={closeFormModal}
        overlay={editingOverlay}
        categories={categories}
        vendors={vendors}
        accounts={accounts}
      />

      <ConfirmDialog
        opened={Boolean(overlayPendingDelete)}
        onClose={() => setOverlayPendingDelete(null)}
        title={t('overlays.actions.delete')}
        impact={t('overlays.confirmDeleteImpact', {
          name: overlayPendingDelete?.name ?? '',
        })}
        safeActionLabel={t('common.cancel')}
        actionLabel={t('overlays.actions.delete')}
        onAction={confirmDelete}
        actionLoading={deleteOverlayMutation.isPending}
      />
    </Stack>
  );
}
