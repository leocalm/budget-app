import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer, Modal, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ConfirmDialog } from './ConfirmDialog';
import classes from './overlayPrimitives.module.css';

interface FormOverlayProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode | ((requestClose: () => void) => ReactNode);
  isDirty?: boolean;
  closeBlocked?: boolean;
}

export function FormOverlay({
  opened,
  onClose,
  title,
  children,
  isDirty = false,
  closeBlocked = false,
}: FormOverlayProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 48em)');
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  const requestClose = () => {
    if (closeBlocked) {
      return;
    }

    if (isDirty) {
      setDiscardConfirmOpen(true);
      return;
    }

    onClose();
  };

  const handleDiscard = () => {
    setDiscardConfirmOpen(false);
    onClose();
  };

  const content = typeof children === 'function' ? children(requestClose) : children;

  return (
    <>
      {isMobile ? (
        <Drawer
          opened={opened}
          onClose={requestClose}
          position="bottom"
          size="88vh"
          withCloseButton={false}
          closeOnEscape={!closeBlocked}
          closeOnClickOutside={!closeBlocked}
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
      ) : (
        <Modal
          opened={opened}
          onClose={requestClose}
          title={title}
          centered
          size={620}
          closeOnEscape={!closeBlocked}
          closeOnClickOutside={!closeBlocked}
          withCloseButton={!closeBlocked}
          trapFocus
          returnFocus
        >
          {content}
        </Modal>
      )}

      <ConfirmDialog
        opened={discardConfirmOpen}
        title={t('common.unsavedChanges.title', 'Discard changes?')}
        impact={t('common.unsavedChanges.impact', "Your edits won't be saved.")}
        safeActionLabel={t('common.unsavedChanges.keepEditing', 'Keep editing')}
        actionLabel={t('common.unsavedChanges.discard', 'Discard')}
        onClose={() => setDiscardConfirmOpen(false)}
        onAction={handleDiscard}
      />
    </>
  );
}
