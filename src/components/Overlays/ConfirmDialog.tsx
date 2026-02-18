import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Drawer, Group, Modal, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import classes from './overlayPrimitives.module.css';

interface ConfirmDialogProps {
  opened: boolean;
  title: string;
  impact: string;
  safeActionLabel: string;
  actionLabel: string;
  onClose: () => void;
  onAction: () => void;
  actionColor?: string;
  actionLoading?: boolean;
  blockClose?: boolean;
  children?: ReactNode;
}

export function ConfirmDialog({
  opened,
  title,
  impact,
  safeActionLabel,
  actionLabel,
  onClose,
  onAction,
  actionColor = 'red',
  actionLoading = false,
  blockClose = true,
  children,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 48em)');

  const content = (
    <Stack gap="md">
      <Text>{impact}</Text>
      {children}
      <Group justify="flex-end">
        <Button variant="filled" onClick={onClose} disabled={actionLoading}>
          {safeActionLabel}
        </Button>
        <Button color={actionColor} variant="subtle" onClick={onAction} loading={actionLoading}>
          {actionLabel}
        </Button>
      </Group>
    </Stack>
  );

  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        position="bottom"
        size="88vh"
        closeOnEscape={!blockClose}
        closeOnClickOutside={!blockClose}
        withCloseButton={false}
        trapFocus
        returnFocus
        title={
          <div className={classes.drawerHeader}>
            <div className={classes.drawerHandle} aria-hidden="true" />
            <Text className={classes.drawerTitle}>{title}</Text>
          </div>
        }
        styles={{ body: { maxHeight: 'calc(88vh - 84px)', overflowY: 'auto' } }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      size={620}
      closeOnEscape={!blockClose}
      closeOnClickOutside={!blockClose}
      withCloseButton={!blockClose}
      trapFocus
      returnFocus
      aria-label={t('common.confirmDialogLabel', 'Confirmation dialog')}
    >
      {content}
    </Modal>
  );
}
