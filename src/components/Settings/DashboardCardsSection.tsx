import { useCallback, useState } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical, IconPlus, IconRestore, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CARD_REGISTRY } from '@/components/Dashboard/cardRegistry';
import {
  useAvailableCards,
  useCreateDashboardCard,
  useDashboardLayout,
  useDeleteDashboardCard,
  useReorderDashboardCards,
  useResetDashboardLayout,
  useUpdateDashboardCard,
} from '@/hooks/useDashboardLayout';
import { toast } from '@/lib/toast';
import type { DashboardCardConfig } from '@/types/dashboardLayout';

interface SortableCardItemProps {
  card: DashboardCardConfig;
  onToggle: (cardId: string, enabled: boolean) => void;
  onDelete: (cardId: string) => void;
  isDesktop: boolean;
}

function SortableCardItem({ card, onToggle, onDelete, isDesktop }: SortableCardItemProps) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const def = CARD_REGISTRY[card.cardType];
  const label = def ? t(def.labelKey) : card.cardType;
  const sizeLabel =
    card.size === 'full'
      ? t('settings.dashboardCards.sizeFull')
      : t('settings.dashboardCards.sizeHalf');

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      withBorder
      radius="sm"
      p="xs"
      bg={card.enabled ? undefined : 'var(--mantine-color-dark-7)'}
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            style={{ cursor: 'grab', touchAction: 'none' }}
            {...attributes}
            {...listeners}
          >
            <IconGripVertical size={16} />
          </ActionIcon>

          <Text size="sm" fw={500} truncate style={{ flex: 1, minWidth: 0 }}>
            {label}
          </Text>

          {isDesktop && (
            <Badge size="xs" variant="outline" color="gray">
              {sizeLabel}
            </Badge>
          )}
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Switch
            size="xs"
            checked={card.enabled}
            onChange={(e) => onToggle(card.id, e.currentTarget.checked)}
            aria-label={t('settings.dashboardCards.toggleAria', { card: label })}
          />
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={() => onDelete(card.id)}
            aria-label={t('settings.dashboardCards.deleteAria', { card: label })}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
}

interface DashboardCardsSectionProps {
  isDesktop: boolean;
}

export function DashboardCardsSection({ isDesktop }: DashboardCardsSectionProps) {
  const { t } = useTranslation();
  const { data: layout, isLoading } = useDashboardLayout();
  const { data: availableCards } = useAvailableCards();
  const updateCard = useUpdateDashboardCard();
  const reorderCards = useReorderDashboardCards();
  const createCard = useCreateDashboardCard();
  const deleteCard = useDeleteDashboardCard();
  const resetLayout = useResetDashboardLayout();

  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);
  const [resetModalOpened, { open: openResetModal, close: closeResetModal }] = useDisclosure(false);
  const [selectedCardType, setSelectedCardType] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sortedCards = layout ? [...layout].sort((a, b) => a.position - b.position) : [];

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !sortedCards.length) {
        return;
      }

      const oldIndex = sortedCards.findIndex((c) => c.id === active.id);
      const newIndex = sortedCards.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const reordered = [...sortedCards];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      const order = reordered.map((card, idx) => ({ id: card.id, position: idx }));
      reorderCards.mutate({ order });
    },
    [sortedCards, reorderCards]
  );

  const handleToggle = useCallback(
    (cardId: string, enabled: boolean) => {
      updateCard.mutate({ cardId, request: { enabled } });
    },
    [updateCard]
  );

  const handleDelete = useCallback(
    (cardId: string) => {
      deleteCard.mutate(cardId);
    },
    [deleteCard]
  );

  const handleAddCard = useCallback(() => {
    if (!selectedCardType) {
      return;
    }
    createCard.mutate(
      {
        cardType: selectedCardType,
        position: sortedCards.length,
      },
      {
        onSuccess: () => {
          closeAddModal();
          setSelectedCardType(null);
          toast.success({ message: t('settings.dashboardCards.notifications.addSuccess') });
        },
        onError: () => {
          toast.error({ message: t('settings.dashboardCards.notifications.addError') });
        },
      }
    );
  }, [selectedCardType, createCard, sortedCards.length, closeAddModal, t]);

  const handleReset = useCallback(() => {
    resetLayout.mutate(undefined, {
      onSuccess: () => {
        closeResetModal();
        toast.success({ message: t('settings.dashboardCards.notifications.resetSuccess') });
      },
      onError: () => {
        toast.error({ message: t('settings.dashboardCards.notifications.resetError') });
      },
    });
  }, [resetLayout, closeResetModal, t]);

  const addableCardOptions =
    availableCards?.globalCards
      .filter((gc) => !gc.alreadyAdded)
      .map((gc) => {
        const def = CARD_REGISTRY[gc.cardType];
        return {
          value: gc.cardType,
          label: def ? t(def.labelKey) : gc.cardType,
        };
      }) ?? [];

  return (
    <>
      <Paper id="dashboard-cards" withBorder radius="md" p="xl">
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <div>
              <Title
                order={4}
                mb={4}
                style={{ textTransform: isDesktop ? undefined : 'uppercase' }}
              >
                {t('settings.dashboardCards.title')}
              </Title>
              <Text c="dimmed" size="sm">
                {t('settings.dashboardCards.description')}
              </Text>
            </div>
            <Group gap="xs">
              <Button
                variant="light"
                size="sm"
                leftSection={<IconPlus size={16} />}
                onClick={openAddModal}
                disabled={addableCardOptions.length === 0}
              >
                {t('settings.dashboardCards.addButton')}
              </Button>
              <Button
                variant="subtle"
                size="sm"
                color="gray"
                leftSection={<IconRestore size={16} />}
                onClick={openResetModal}
              >
                {t('settings.dashboardCards.resetButton')}
              </Button>
            </Group>
          </Group>

          {isLoading ? (
            <Loader size="sm" />
          ) : sortedCards.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              {t('settings.dashboardCards.empty')}
            </Text>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedCards.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <Stack gap="xs">
                  {sortedCards.map((card) => (
                    <SortableCardItem
                      key={card.id}
                      card={card}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      isDesktop={isDesktop}
                    />
                  ))}
                </Stack>
              </SortableContext>
            </DndContext>
          )}
        </Stack>
      </Paper>

      {/* Add Card Modal */}
      <Modal
        opened={addModalOpened}
        onClose={closeAddModal}
        title={t('settings.dashboardCards.addModalTitle')}
        size="sm"
      >
        <Stack gap="md">
          <Select
            label={t('settings.dashboardCards.cardTypeLabel')}
            placeholder={t('settings.dashboardCards.cardTypePlaceholder')}
            data={addableCardOptions}
            value={selectedCardType}
            onChange={setSelectedCardType}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeAddModal}>
              {t('settings.dashboardCards.cancelButton')}
            </Button>
            <Button
              onClick={handleAddCard}
              disabled={!selectedCardType}
              loading={createCard.isPending}
            >
              {t('settings.dashboardCards.confirmAddButton')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        opened={resetModalOpened}
        onClose={closeResetModal}
        title={t('settings.dashboardCards.resetConfirmTitle')}
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">{t('settings.dashboardCards.resetConfirmMessage')}</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeResetModal}>
              {t('settings.dashboardCards.cancelButton')}
            </Button>
            <Button color="red" onClick={handleReset} loading={resetLayout.isPending}>
              {t('settings.dashboardCards.confirmResetButton')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
