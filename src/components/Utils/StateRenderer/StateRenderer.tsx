import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Anchor, Button, Group, Skeleton, Stack, Text } from '@mantine/core';
import { resolveState } from './resolveState';
import classes from './StateRenderer.module.css';

type StateRendererVariant = 'page' | 'card';

export interface LockAction {
  label: string;
  to?: string;
  onClick?: () => void;
}

export interface EmptyAction {
  label: string;
  onClick: () => void;
}

export interface StateRendererProps {
  variant?: StateRendererVariant;
  isLocked?: boolean;
  lockStatusLabel?: string;
  lockMessage?: string;
  lockAction?: LockAction;
  hasError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  isLoading?: boolean;
  loadingSkeleton?: ReactNode;
  isEmpty?: boolean;
  emptyItemsLabel?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: EmptyAction;
  children: ReactNode;
  'data-testid'?: string;
}

function DefaultLoadingSkeleton() {
  return (
    <Stack gap="sm" w="100%">
      <Skeleton height={20} radius="sm" className={classes.skeletonLine} />
      <Skeleton height={20} radius="sm" className={classes.skeletonLine} />
      <Skeleton height={20} radius="sm" width="70%" />
      <Skeleton height={36} radius="sm" width={120} mt="md" />
    </Stack>
  );
}

export function StateRenderer({
  variant = 'card',
  isLocked = false,
  lockStatusLabel,
  lockMessage,
  lockAction,
  hasError = false,
  errorMessage,
  onRetry,
  isLoading = false,
  loadingSkeleton,
  isEmpty = false,
  emptyItemsLabel,
  emptyTitle,
  emptyMessage,
  emptyAction,
  children,
  'data-testid': testId,
}: StateRendererProps) {
  const { t } = useTranslation();
  const state = resolveState({ isLocked, hasError, isLoading, isEmpty });

  if (state === 'active') {
    return <>{children}</>;
  }

  const surfaceClasses = [
    classes.surface,
    variant === 'page' ? classes.page : classes.card,
    classes.centered,
    state === 'locked' ? classes.locked : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  if (state === 'locked') {
    return (
      <Stack gap="xs" className={surfaceClasses} data-testid={testId}>
        <Text className={classes.statusLabel}>
          {lockStatusLabel || t('states.locked.status.notConfigured')}
        </Text>
        <Text className={classes.message}>
          {lockMessage || t('states.locked.message.periodRequired')}
        </Text>
        {lockAction?.to ? (
          <Anchor component={Link} to={lockAction.to} underline="always">
            {lockAction.label}
          </Anchor>
        ) : lockAction?.onClick ? (
          <Anchor component="button" type="button" onClick={lockAction.onClick} underline="always">
            {lockAction.label}
          </Anchor>
        ) : null}
      </Stack>
    );
  }

  if (state === 'error') {
    return (
      <Stack gap="xs" className={surfaceClasses} data-testid={testId}>
        <Text className={classes.message} lineClamp={1}>
          {errorMessage || t('states.error.loadFailed.message')}
        </Text>
        {onRetry ? (
          <Button
            size="compact-sm"
            variant="subtle"
            onClick={onRetry}
            className={classes.retryButton}
          >
            {t('states.error.retry')}
          </Button>
        ) : null}
      </Stack>
    );
  }

  if (state === 'loading') {
    return (
      <Group className={surfaceClasses} data-testid={testId}>
        {loadingSkeleton || <DefaultLoadingSkeleton />}
      </Group>
    );
  }

  return (
    <Stack gap="xs" className={surfaceClasses} data-testid={testId}>
      <Text className={classes.title}>
        {emptyTitle ||
          t('states.contract.emptyTitle', {
            items: emptyItemsLabel || t('states.contract.items.data'),
          })}
      </Text>
      {emptyMessage ? <Text className={classes.message}>{emptyMessage}</Text> : null}
      {emptyAction ? (
        <Button size="sm" onClick={emptyAction.onClick} mt="sm">
          {emptyAction.label}
        </Button>
      ) : null}
    </Stack>
  );
}
