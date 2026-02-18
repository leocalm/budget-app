import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Drawer, Group, Modal, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

interface VendorDeleteModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  vendorId?: string | null;
  error?: {
    transactionCount: number;
    vendorId: string;
  } | null;
  isDeleting: boolean;
}

export function VendorDeleteModal({
  opened,
  onClose,
  onConfirm,
  error,
  isDeleting,
}: VendorDeleteModalProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 48em)');
  const navigate = useNavigate();

  const handleViewTransactions = () => {
    if (error?.vendorId) {
      onClose();
      navigate(`/transactions?vendor=${error.vendorId}`);
    }
  };

  const content = (
    <Stack gap="md">
      {error ? (
        <>
          <Alert color="red" title={t('vendors.errors.cannotDelete')}>
            <Text size="sm" mb="sm">
              {t('vendors.errors.vendorInUse', { count: error.transactionCount })}
            </Text>
            <Button size="xs" variant="light" onClick={handleViewTransactions}>
              {t('vendors.viewTransactions')}
            </Button>
          </Alert>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              {t('vendors.delete.cancelButton')}
            </Button>
            <Button color="red" disabled>
              {t('vendors.delete.confirmButton')}
            </Button>
          </Group>
        </>
      ) : (
        <>
          <Text>{t('vendors.delete.confirmMessage')}</Text>

          <Group justify="flex-end" mt="md">
            <Button variant="filled" onClick={onClose} disabled={isDeleting}>
              {t('vendors.delete.cancelButton')}
            </Button>
            <Button color="red" variant="subtle" onClick={onConfirm} loading={isDeleting}>
              {t('vendors.delete.confirmButton')}
            </Button>
          </Group>
        </>
      )}
    </Stack>
  );

  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        position="bottom"
        title={t('vendors.deleteVendor')}
        size="auto"
        closeOnEscape={false}
        closeOnClickOutside={false}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('vendors.deleteVendor')}
      centered
      closeOnEscape={false}
      closeOnClickOutside={false}
    >
      {content}
    </Modal>
  );
}
