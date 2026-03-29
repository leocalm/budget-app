import { ActionIcon, Menu, Text } from '@mantine/core';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { CYCLE_LABELS } from './subscriptionUtils';
import classes from './Subscriptions.module.css';

type SubscriptionResponse = components['schemas']['SubscriptionResponse'];

interface SubscriptionRowProps {
  subscription: SubscriptionResponse;
  categoryIcon?: string;
  categoryColor?: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onCancel: (sub: SubscriptionResponse) => void;
  onDelete: (id: string) => void;
}

export function SubscriptionRow({
  subscription,
  categoryIcon,
  categoryColor,
  onView,
  onEdit,
  onCancel,
  onDelete,
}: SubscriptionRowProps) {
  const isCancelled = subscription.status === 'cancelled';
  const cycleLabel = CYCLE_LABELS[subscription.billingCycle] ?? '';

  const nextDate = new Date(`${subscription.nextChargeDate}T00:00:00`).toLocaleDateString(
    undefined,
    { month: 'short', day: 'numeric' }
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(`${subscription.nextChargeDate}T00:00:00`);
  const daysUntil = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const timeLabel =
    daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;

  return (
    <div
      className={isCancelled ? classes.subRowCancelled : classes.subRow}
      data-testid={`subscription-row-${subscription.id}`}
      onClick={() => onView(subscription.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView(subscription.id);
        }
      }}
    >
      <div
        className={classes.subIcon}
        style={{ backgroundColor: categoryColor ? `${categoryColor}26` : 'var(--v2-elevated)' }}
      >
        {categoryIcon ?? '🔄'}
      </div>

      <div className={classes.subInfo}>
        <Text fz="sm" fw={600} truncate>
          {subscription.name}
        </Text>
        <Text fz="xs" c="dimmed">
          {isCancelled ? 'Cancelled' : `Next: ${nextDate}`}
        </Text>
      </div>

      <div className={classes.subAmount}>
        <Text fz="sm" fw={600} ff="var(--mantine-font-family-monospace)">
          <CurrencyValue cents={subscription.billingAmount} />
          <Text span fz="xs" c="dimmed">
            {cycleLabel}
          </Text>
        </Text>
      </div>

      {!isCancelled && (
        <div className={classes.subDate}>
          <Text fz="xs" c="dimmed" ff="var(--mantine-font-family-monospace)">
            {timeLabel}
          </Text>
        </div>
      )}

      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={classes.kebabCell}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              aria-label={`Actions for ${subscription.name}`}
            >
              <Text fz="lg" lh={1}>
                ⋮
              </Text>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => onEdit(subscription.id)}>Edit</Menu.Item>
            {!isCancelled && (
              <Menu.Item color="orange" onClick={() => onCancel(subscription)}>
                Cancel
              </Menu.Item>
            )}
            <Menu.Item color="red" onClick={() => onDelete(subscription.id)}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
}
