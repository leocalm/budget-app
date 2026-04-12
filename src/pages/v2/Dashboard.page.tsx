import { useCallback, useMemo, useState } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Button, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  AccountCard,
  CashFlowCard,
  CurrentPeriodCard,
  FixedCategoriesCard,
  GettingStartedCard,
  NetPositionCard,
  RecentTransactionsCard,
  SpendingTrendCard,
  SubscriptionsCard,
  TopVendorsCard,
  VariableCategoriesCard,
} from '@/components/v2/Dashboard';
import { AddWidgetModal } from '@/components/v2/Dashboard/AddWidgetModal';
import customizeClasses from '@/components/v2/Dashboard/DashboardCustomize.module.css';
import {
  DEFAULT_WIDGET_ORDER,
  WIDGET_DEFINITIONS,
} from '@/components/v2/Dashboard/widgetDefinitions';
import { NoPeriodState } from '@/components/v2/NoPeriodState';
import { PageHint } from '@/components/v2/PageHint';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useAccounts } from '@/hooks/v2/useAccounts';
import { usePreferences, useUpdatePreferences } from '@/hooks/v2/useSettings';
import { toast } from '@/lib/toast';

const ACCOUNT_PREFIX = 'account:';

function isAccountItem(id: string): boolean {
  return id.startsWith(ACCOUNT_PREFIX);
}

function getAccountId(itemId: string): string {
  return itemId.slice(ACCOUNT_PREFIX.length);
}

function renderWidget(widgetId: string, periodId: string) {
  switch (widgetId) {
    case 'current_period':
      return <CurrentPeriodCard periodId={periodId} />;
    case 'net_position':
      return <NetPositionCard periodId={periodId} />;
    case 'cash_flow':
      return <CashFlowCard periodId={periodId} />;
    case 'recent_transactions':
      return <RecentTransactionsCard periodId={periodId} />;
    case 'spending_trend':
      return <SpendingTrendCard periodId={periodId} />;
    case 'top_vendors':
      return <TopVendorsCard periodId={periodId} />;
    case 'variable_categories':
      return <VariableCategoriesCard periodId={periodId} />;
    case 'fixed_categories':
      return <FixedCategoriesCard periodId={periodId} />;
    case 'subscriptions':
      return <SubscriptionsCard periodId={periodId} />;
    default:
      return null;
  }
}

export function DashboardV2Page() {
  const { t } = useTranslation('v2');
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const { data: accountsData } = useAccounts();
  const { data: prefsData } = usePreferences();
  const updatePrefs = useUpdatePreferences();

  const [isEditing, setIsEditing] = useState(false);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const accounts = accountsData?.data ?? [];
  const activeAccounts = accounts.filter((a) => a.status === 'active');
  const accountMap = useMemo(() => new Map(activeAccounts.map((a) => [a.id, a])), [activeAccounts]);

  // Build the full order: widgets + account items
  const layout = useMemo(() => {
    const prefs = prefsData?.dashboardLayout;
    const savedOrder = prefs?.widgetOrder ?? [];
    const hidden = new Set(prefs?.hiddenWidgets ?? []);

    // If no saved order, build default: default widgets + all active accounts
    let order: string[];
    if (savedOrder.length > 0) {
      order = savedOrder;
    } else {
      order = [...DEFAULT_WIDGET_ORDER, ...activeAccounts.map((a) => `${ACCOUNT_PREFIX}${a.id}`)];
    }

    // Filter: not hidden, must be a known widget or existing account
    const knownWidgetIds = new Set(WIDGET_DEFINITIONS.map((w) => w.id));
    const activeAccountIds = new Set(activeAccounts.map((a) => a.id));
    const activeItems = order.filter((id) => {
      if (hidden.has(id)) {
        return false;
      }
      if (isAccountItem(id)) {
        return activeAccountIds.has(getAccountId(id));
      }
      return knownWidgetIds.has(id);
    });
    return { order, hidden, activeItems };
  }, [prefsData, activeAccounts]);

  // Editable state
  const [editOrder, setEditOrder] = useState<string[]>([]);
  const [editHidden, setEditHidden] = useState<Set<string>>(new Set());

  const startEditing = () => {
    setEditOrder([...layout.activeItems]);
    setEditHidden(new Set(layout.hidden));
    setIsEditing(true);
  };

  const saveEditing = async () => {
    try {
      if (!prefsData) {
        toast.error({ message: 'Preferences not loaded yet. Please try again.' });
        return;
      }
      const accountIdsInOrder = editOrder.filter((id) => isAccountItem(id)).map(getAccountId);

      await updatePrefs.mutateAsync({
        ...prefsData,
        dashboardLayout: {
          widgetOrder: editOrder,
          hiddenWidgets: Array.from(editHidden),
          visibleAccountIds: accountIdsInOrder.length > 0 ? accountIdsInOrder : undefined,
        },
      });
      setIsEditing(false);
      toast.success({ message: 'Dashboard layout saved' });
    } catch {
      toast.error({ message: 'Failed to save layout' });
    }
  };

  const handleRemoveItem = useCallback((id: string) => {
    setEditOrder((prev) => prev.filter((w) => w !== id));
    setEditHidden((prev) => new Set([...prev, id]));
  }, []);

  const handleAddWidget = useCallback((id: string) => {
    setEditHidden((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setEditOrder((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const handleAddAccount = useCallback((accountId: string) => {
    const itemId = `${ACCOUNT_PREFIX}${accountId}`;
    setEditHidden((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
    setEditOrder((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setEditOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const visibleItems = isEditing ? editOrder : layout.activeItems;

  // For the add modal
  const activeItemIdSet = useMemo(() => new Set(visibleItems), [visibleItems]);
  const activeAccountIdSet = useMemo(
    () => new Set(visibleItems.filter(isAccountItem).map(getAccountId)),
    [visibleItems]
  );

  // Heroes always span full width. Non-hero items that would be alone
  // in their row (odd one out in a run between heroes) also go full-width.
  const fullWidthIds = useMemo(() => {
    const full = new Set<string>();

    // Split into runs of non-hero items separated by heroes
    const runs: string[][] = [[]];
    for (const id of visibleItems) {
      const def = WIDGET_DEFINITIONS.find((w) => w.id === id);
      const isHero = def?.isHero && !isAccountItem(id);
      if (isHero) {
        full.add(id);
        runs.push([]);
      } else {
        runs[runs.length - 1].push(id);
      }
    }

    // In each run, if odd count the last item spans full width
    for (const run of runs) {
      if (run.length % 2 === 1) {
        full.add(run[run.length - 1]);
      }
    }

    return full;
  }, [visibleItems]);

  if (!selectedPeriodId) {
    return <NoPeriodState pageTitle={t('dashboard.title')} />;
  }

  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title order={2} fw={700}>
            {t('dashboard.title')}
          </Title>
          <Text c="dimmed" fz="sm">
            {t('dashboard.subtitle')}
          </Text>
        </div>
        {isEditing ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="subtle" size="sm" onClick={() => setIsEditing(false)}>
              {t('dashboard.cancel')}
            </Button>
            <Button
              size="sm"
              onClick={saveEditing}
              loading={updatePrefs.isPending}
              disabled={!prefsData}
            >
              {t('dashboard.done')}
            </Button>
          </div>
        ) : (
          <Button variant="subtle" size="sm" onClick={startEditing}>
            {t('dashboard.customize')}
          </Button>
        )}
      </div>

      <PageHint hintId="dashboard" message={t('hints.dashboard')} />

      {/* Getting Started is independent of the widget system */}
      {!isEditing && <GettingStartedCard periodId={selectedPeriodId} />}

      {isEditing ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={editOrder} strategy={verticalListSortingStrategy}>
            <Stack gap="sm">
              {editOrder.map((id) => (
                <SortableItemPlaceholder
                  key={id}
                  id={id}
                  accountMap={accountMap}
                  onRemove={handleRemoveItem}
                />
              ))}
            </Stack>
          </SortableContext>

          <UnstyledButton
            className={customizeClasses.addWidgetButton}
            onClick={openModal}
            aria-label="Add widget"
          >
            <Text fz="sm" c="dimmed">
              {t('dashboard.addWidget')}
            </Text>
          </UnstyledButton>
        </DndContext>
      ) : visibleItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <Text fz="xl" fw={600} c="dimmed" mb="sm">
            {t('dashboard.emptyTitle', 'No widgets to show')}
          </Text>
          <Text fz="sm" c="dimmed" mb="lg">
            {t(
              'dashboard.emptyDescription',
              'Use the Customize button to add widgets to your dashboard.'
            )}
          </Text>
        </div>
      ) : (
        <div className={customizeClasses.dashboardGrid}>
          {visibleItems.map((id) => (
            <div
              key={id}
              className={customizeClasses.gridCell}
              style={fullWidthIds.has(id) ? { gridColumn: '1 / -1' } : undefined}
            >
              {isAccountItem(id) ? (
                <AccountCard accountId={getAccountId(id)} periodId={selectedPeriodId} />
              ) : (
                renderWidget(id, selectedPeriodId)
              )}
            </div>
          ))}
        </div>
      )}

      <AddWidgetModal
        opened={modalOpened}
        onClose={closeModal}
        activeWidgetIds={activeItemIdSet}
        accounts={activeAccounts}
        activeAccountIds={activeAccountIdSet}
        onAddWidget={handleAddWidget}
        onAddAccount={handleAddAccount}
      />
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Sortable placeholder — handles both widgets and account cards
// ---------------------------------------------------------------------------

function SortableItemPlaceholder({
  id,
  accountMap,
  onRemove,
}: {
  id: string;
  accountMap: Map<string, { name: string }>;
  onRemove: (id: string) => void;
}) {
  const { t } = useTranslation('v2');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  let emoji: string;
  let name: string;
  let desc: string;

  if (isAccountItem(id)) {
    const acct = accountMap.get(getAccountId(id));
    emoji = '🏦';
    name = acct?.name ?? t('common.account');
    desc = t('common.individualAccountCard');
  } else {
    const def = WIDGET_DEFINITIONS.find((w) => w.id === id);
    emoji = def?.emoji ?? '📦';
    name = def ? t(def.nameKey) : id;
    desc = def ? t(def.descKey) : '';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${customizeClasses.placeholderCard} ${isDragging ? customizeClasses.dragging : ''}`}
      {...attributes}
    >
      <span className={customizeClasses.dragHandle} {...listeners}>
        <Text fz="sm" c="dimmed" style={{ cursor: 'grab' }}>
          ⠿
        </Text>
      </span>
      <div className={customizeClasses.placeholderInfo}>
        <Text fz="sm" fw={600}>
          {emoji} {name}
        </Text>
        <Text fz="xs" c="dimmed">
          {desc}
        </Text>
      </div>
      <ActionIcon
        variant="subtle"
        color="gray"
        size="sm"
        onClick={() => onRemove(id)}
        aria-label={`Remove ${name}`}
      >
        <Text fz="sm">✕</Text>
      </ActionIcon>
    </div>
  );
}
