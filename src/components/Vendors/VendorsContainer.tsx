import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Collapse,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import {
  useArchivedVendors,
  useArchiveVendor,
  useDeleteVendor,
  useInfiniteVendors,
  useRestoreVendor,
} from '@/hooks/useVendors';
import { VendorWithStats } from '@/types/vendor';
import { VendorCard } from './VendorCard';
import { VendorDeleteModal } from './VendorDeleteModal';
import { VendorFormModal } from './VendorFormModal';

export function VendorsContainer() {
  const { t } = useTranslation();
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const {
    data: paginatedData,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteVendors(selectedPeriodId);
  const deleteMutation = useDeleteVendor();
  const archiveMutation = useArchiveVendor();
  const restoreMutation = useRestoreVendor();
  const { data: archivedVendors = [] } = useArchivedVendors();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorWithStats | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<{
    transactionCount: number;
    vendorId: string;
  } | null>(null);

  // Flatten paginated data into a single array
  const allVendors = useMemo(() => {
    if (!paginatedData) {
      return [];
    }
    return paginatedData.pages.flatMap((page) => page.items);
  }, [paginatedData]);

  // Filter vendors by search term
  const processedVendors = useMemo(() => {
    if (!allVendors) {
      return [];
    }

    return allVendors.filter((v) => v.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allVendors, searchTerm]);

  const handleAdd = () => {
    setSelectedVendor(null);
    setFormModalOpen(true);
  };

  const handleEdit = (vendor: VendorWithStats) => {
    setSelectedVendor(vendor);
    setFormModalOpen(true);
  };

  const handleArchive = async (id: string) => {
    await archiveMutation.mutateAsync(id);
  };

  const handleRestore = async (id: string) => {
    await restoreMutation.mutateAsync(id);
  };

  const handleDelete = (id: string) => {
    setVendorToDelete(id);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!vendorToDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(vendorToDelete);
      setDeleteModalOpen(false);
      setVendorToDelete(null);
      setDeleteError(null);
    } catch (error: any) {
      // Handle 409 conflict error
      if (error.status === 409 || error.response?.status === 409) {
        const errorData = error.response?.data || error;
        setDeleteError({
          transactionCount: errorData.transactionCount || 0,
          vendorId: vendorToDelete,
        });
      } else {
        // Other errors - close modal and show generic error
        setDeleteModalOpen(false);
        setVendorToDelete(null);
      }
    }
  };

  const handleViewTransactions = (vendorId: string) => {
    navigate(`/transactions?vendor=${vendorId}`);
  };

  const handleCloseFormModal = () => {
    setFormModalOpen(false);
    setSelectedVendor(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setVendorToDelete(null);
    setDeleteError(null);
  };

  const hasNoSearchResults = searchTerm && processedVendors.length === 0;

  return (
    <Box maw={1400} mx="auto" p="xl">
      {/* Header */}
      <Group justify="space-between" align="flex-start" mb="md">
        <Box>
          <Title order={2}>{t('vendors.title')}</Title>
          <Text c="dimmed" size="sm">
            {t('vendors.subtitle')}
          </Text>
        </Box>
        <Button onClick={handleAdd}>{t('vendors.addVendor')}</Button>
      </Group>

      {/* Search */}
      <TextInput
        mb="md"
        placeholder={t('vendors.searchPlaceholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.currentTarget.value)}
      />

      {/* States */}
      {isError && (
        <Paper withBorder p="xl" radius="md" mb="md">
          <Title order={4} mb="xs">
            {t('vendors.error.title')}
          </Title>
          <Text c="dimmed" mb="md">
            {t('vendors.error.message')}
          </Text>
          <Button variant="default" onClick={() => refetch()}>
            {t('vendors.error.retry')}
          </Button>
        </Paper>
      )}

      {isLoading && (
        <Stack gap="xs">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} h={52} radius="md" />
          ))}
        </Stack>
      )}

      {!isLoading && !isError && processedVendors.length === 0 && !hasNoSearchResults && (
        <Paper withBorder p="xl" radius="md" mb="md">
          <Title order={4} mb="xs">
            {t('vendors.empty.title')}
          </Title>
          <Text c="dimmed" mb="md">
            {t('vendors.empty.message')}
          </Text>
          <Button onClick={handleAdd}>{t('vendors.addVendor')}</Button>
        </Paper>
      )}

      {hasNoSearchResults && (
        <Text c="dimmed" ta="center" py="xl">
          {t('vendors.noSearchResults')}
        </Text>
      )}

      {/* Active vendors list */}
      {processedVendors.length > 0 && (
        <Paper withBorder radius="md" mb="md" style={{ overflow: 'hidden' }}>
          <Text
            size="xs"
            fw={700}
            tt="uppercase"
            c="dimmed"
            px="md"
            py="sm"
            style={{
              borderBottom: '1px solid var(--mantine-color-default-border)',
              letterSpacing: '0.08em',
            }}
          >
            {t('vendors.activeSection', { count: processedVendors.length })}
          </Text>
          <Stack gap={0}>
            {processedVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onRestore={handleRestore}
                onViewTransactions={handleViewTransactions}
              />
            ))}
          </Stack>
          {hasNextPage && (
            <Box p="sm" ta="center">
              <Button
                variant="subtle"
                size="xs"
                onClick={() => fetchNextPage()}
                loading={isFetchingNextPage}
              >
                {t('vendors.loadMore')}
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Archived vendors collapsible */}
      {archivedVendors.length > 0 && (
        <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
          <UnstyledButton
            w="100%"
            px="md"
            py="sm"
            onClick={() => setArchivedOpen((o) => !o)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.08em' }}>
              {t('vendors.archivedSection', { count: archivedVendors.length })}
            </Text>
            <Text size="xs" c="dimmed">
              {archivedOpen ? '▾' : '▸'}
            </Text>
          </UnstyledButton>
          <Collapse in={archivedOpen}>
            <Box style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }} />
            <Stack gap={0}>
              {archivedVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                  onViewTransactions={handleViewTransactions}
                />
              ))}
            </Stack>
          </Collapse>
        </Paper>
      )}

      {/* Modals */}
      <VendorFormModal
        opened={formModalOpen}
        onClose={handleCloseFormModal}
        vendor={selectedVendor}
      />
      <VendorDeleteModal
        opened={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        vendorId={vendorToDelete}
        error={deleteError}
        isDeleting={deleteMutation.isPending}
      />
    </Box>
  );
}
