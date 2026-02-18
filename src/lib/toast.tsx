import { ReactNode } from 'react';
import { Button, Group, Text } from '@mantine/core';
import { NotificationData, notifications } from '@mantine/notifications';
import { UI } from '@/constants';

export type ToastVariant = 'success' | 'info' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ShowToastOptions {
  title?: string;
  message: string;
  action?: ToastAction;
}

interface ShowErrorToastOptions extends ShowToastOptions {
  nonCritical?: boolean;
}

const getAutoClose = (variant: ToastVariant, nonCritical: boolean): number | false => {
  if (variant === 'success') {
    return UI.TOAST_SUCCESS_DURATION_MS;
  }

  if (variant === 'info') {
    return UI.TOAST_INFO_DURATION_MS;
  }

  return nonCritical ? UI.TOAST_ERROR_NON_CRITICAL_DURATION_MS : false;
};

const getColor = (variant: ToastVariant): string => {
  if (variant === 'success') {
    return 'blue';
  }

  if (variant === 'info') {
    return 'indigo';
  }

  return 'orange';
};

const getMessage = (message: string, action?: ToastAction): ReactNode => {
  if (!action) {
    return message;
  }

  return (
    <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
      <Text size="sm">{message}</Text>
      <Button
        variant="subtle"
        size="compact-sm"
        onClick={action.onClick}
        styles={{ root: { flexShrink: 0 } }}
      >
        {action.label}
      </Button>
    </Group>
  );
};

const show = (
  variant: ToastVariant,
  { title, message, action }: ShowToastOptions,
  nonCritical = false
): string => {
  const payload: NotificationData = {
    title,
    message: getMessage(message, action),
    autoClose: getAutoClose(variant, nonCritical),
    withCloseButton: true,
    color: getColor(variant),
  };

  return notifications.show(payload);
};

export const toast = {
  success: (options: ShowToastOptions): string => show('success', options),
  info: (options: ShowToastOptions): string => show('info', options),
  error: (options: ShowErrorToastOptions): string =>
    show('error', options, options.nonCritical ?? false),
};
