/**
 * CategoriesManagement - The management view for categories
 * Shows Incoming, Outgoing, and Archived sections with parent/child hierarchy
 */
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Button,
  Collapse,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconChevronRight, IconPlus, IconSearch } from '@tabler/icons-react';
import { CategoryManagementRow, CategoriesManagementListResponse } from '@/types/category';
import styles from './Categories.module.css';

interface CategoryManagementSectionProps {
  title: string;
  categories: CategoryManagementRow[];
  isArchived?: boolean;
  defaultCollapsed?: boolean;
  onEdit: (category: CategoryManagementRow) => void;
  onArchive: (category: CategoryManagementRow) => void;
  onRestore: (category: CategoryManagementRow) => void;
  onDelete: (category: CategoryManagementRow) => void;
  onAddSubcategory: (parent: CategoryManagementRow) => void;
  searchQuery: string;
}

function CategoryManagementSection({
  title,
  categories,
  isArchived = false,
  defaultCollapsed = false,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  onAddSubcategory,
  searchQuery,
}: CategoryManagementSectionProps) {
  const { t } = useTranslation();
  const [collapsed, { toggle }] = useDisclosure(defaultCollapsed);

  // Filter and organize categories with hierarchy
  const { parents, childrenByParent } = useMemo(() => {
    const filtered = searchQuery
      ? categories.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : categories;

    const parents = filtered.filter((c) => !c.parentId);
    const childrenByParent: Record<string, CategoryManagementRow[]> = {};

    filtered.forEach((c) => {
      if (c.parentId) {
        if (!childrenByParent[c.parentId]) {
          childrenByParent[c.parentId] = [];
        }
        childrenByParent[c.parentId].push(c);
      }
    });

    // Sort alphabetically
    parents.sort((a, b) => a.name.localeCompare(b.name));
    Object.values(childrenByParent).forEach((children) => {
      children.sort((a, b) => a.name.localeCompare(b.name));
    });

    return { parents, childrenByParent };
  }, [categories, searchQuery]);

  if (parents.length === 0 && !isArchived) {
    return null;
  }

  return (
    <Paper withBorder radius="lg" className={isArchived ? styles.archivedShell : styles.group}>
      {isArchived ? (
        <>
          <button
            type="button"
            className={styles.archivedHeader}
            onClick={toggle}
            aria-expanded={!collapsed}
          >
            <Group gap="xs">
              {collapsed ? (
                <IconChevronRight size={14} stroke={1.5} />
              ) : (
                <IconChevronDown size={14} stroke={1.5} />
              )}
              <span>
                {title} ({categories.length})
              </span>
            </Group>
          </button>
          <Collapse in={!collapsed}>
            <div className={styles.archivedContent}>
              {parents.map((parent) => (
                <CategoryRow
                  key={parent.id}
                  category={parent}
                  isArchived
                  onEdit={onEdit}
                  onArchive={onArchive}
                  onRestore={onRestore}
                  onDelete={onDelete}
                  onAddSubcategory={onAddSubcategory}
                />
              ))}
            </div>
          </Collapse>
        </>
      ) : (
        <>
          <div className={styles.groupHeader}>
            <Text className={styles.groupTitle}>{title}</Text>
          </div>
          <Stack gap={0}>
            {parents.map((parent) => (
              <div key={parent.id}>
                <CategoryRow
                  category={parent}
                  onEdit={onEdit}
                  onArchive={onArchive}
                  onRestore={onRestore}
                  onDelete={onDelete}
                  onAddSubcategory={onAddSubcategory}
                />
                {childrenByParent[parent.id]?.map((child) => (
                  <CategoryRow
                    key={child.id}
                    category={child}
                    isChild
                    onEdit={onEdit}
                    onArchive={onArchive}
                    onRestore={onRestore}
                    onDelete={onDelete}
                    onAddSubcategory={onAddSubcategory}
                  />
                ))}
              </div>
            ))}
          </Stack>
        </>
      )}
    </Paper>
  );
}

interface CategoryRowProps {
  category: CategoryManagementRow;
  isChild?: boolean;
  isArchived?: boolean;
  onEdit: (category: CategoryManagementRow) => void;
  onArchive: (category: CategoryManagementRow) => void;
  onRestore: (category: CategoryManagementRow) => void;
  onDelete: (category: CategoryManagementRow) => void;
  onAddSubcategory: (parent: CategoryManagementRow) => void;
}

function CategoryRow({
  category,
  isChild = false,
  isArchived = false,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  onAddSubcategory,
}: CategoryRowProps) {
  const { t } = useTranslation();
  const canDelete = category.globalTransactionCount === 0 && category.activeChildrenCount === 0;
  const canArchive = category.activeChildrenCount === 0;
  const canAddSubcategory = !isChild && !isArchived;

  return (
    <div className={`${styles.managementRow} ${isChild ? styles.childRow : ''}`}>
      <div className={styles.identity}>
        <div className={styles.categoryIcon}>{category.icon || '📁'}</div>
        <div className={styles.nameWrap}>
          <Text className={styles.categoryName}>{category.name}</Text>
          {category.description && (
            <Text className={styles.categoryDescription} title={category.description}>
              {category.description}
            </Text>
          )}
        </div>
      </div>

      <div className={styles.meta}>
        {isArchived && (
          <Badge variant="light" size="sm" className={styles.typeChip}>
            {t('categories.management.typeLabel', { type: category.categoryType })}
          </Badge>
        )}
        {!isArchived && !isChild && (
          <Badge variant="light" size="sm" className={styles.typeChip}>
            {category.categoryType}
          </Badge>
        )}
        <Text className={styles.txCount}>
          {t('categories.management.transactionCount', { count: category.globalTransactionCount })}
        </Text>
        <Text className={styles.status}>
          {isArchived
            ? t('categories.management.status.archived')
            : t('categories.management.status.active')}
        </Text>
      </div>

      <div className={styles.actions}>
        <Button
          variant="subtle"
          size="compact-sm"
          onClick={() => onEdit(category)}
          className={styles.actionBtn}
        >
          {t('categories.management.actions.edit')}
        </Button>
        {isArchived ? (
          <Button
            variant="subtle"
            size="compact-sm"
            onClick={() => onRestore(category)}
            className={styles.actionBtn}
          >
            {t('categories.management.actions.restore')}
          </Button>
        ) : (
          <Button
            variant="subtle"
            size="compact-sm"
            onClick={() => onArchive(category)}
            disabled={!canArchive}
            className={styles.actionBtn}
          >
            {t('categories.management.actions.archive')}
          </Button>
        )}
        {canDelete && (
          <Button
            variant="subtle"
            size="compact-sm"
            color="red"
            onClick={() => onDelete(category)}
            className={styles.actionBtn}
          >
            {t('categories.management.actions.delete')}
          </Button>
        )}
        {canAddSubcategory && (
          <Button
            variant="light"
            size="compact-sm"
            leftSection={<IconPlus size={14} />}
            onClick={() => onAddSubcategory(category)}
            className={styles.subcategoryBtn}
          >
            {t('categories.management.actions.subcategory')}
          </Button>
        )}
      </div>
    </div>
  );
}

function ManagementSkeleton() {
  return (
    <Stack gap="md">
      <Skeleton height={120} radius="md" />
      <Skeleton height={200} radius="md" />
      <Skeleton height={100} radius="md" />
    </Stack>
  );
}

interface CategoriesManagementProps {
  data: CategoriesManagementListResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onEdit: (category: CategoryManagementRow) => void;
  onArchive: (category: CategoryManagementRow) => void;
  onRestore: (category: CategoryManagementRow) => void;
  onDelete: (category: CategoryManagementRow) => void;
  onAddSubcategory: (parent: CategoryManagementRow) => void;
}

export function CategoriesManagement({
  data,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  onAddSubcategory,
}: CategoriesManagementProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return <ManagementSkeleton />;
  }

  if (isError) {
    return (
      <Paper withBorder radius="lg" p="xl" className={styles.errorState}>
        <Text size="lg" fw={600} mb="sm">
          {t('categories.management.error.title')}
        </Text>
        <Text c="dimmed" mb="md">
          {t('categories.management.error.message')}
        </Text>
        <Button variant="light" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      </Paper>
    );
  }

  const isEmpty =
    !data ||
    (data.incoming.length === 0 && data.outgoing.length === 0 && data.archived.length === 0);

  if (isEmpty) {
    return (
      <Paper withBorder radius="lg" p="xl" className={styles.emptyState}>
        <Text size="lg" fw={600} mb="sm">
          {t('categories.management.empty.title')}
        </Text>
        <Text c="dimmed" mb="md">
          {t('categories.management.empty.message')}
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <TextInput
        placeholder={t('categories.management.search')}
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        className={styles.searchInput}
      />

      <CategoryManagementSection
        title={t('categories.management.sections.incoming')}
        categories={data?.incoming ?? []}
        onEdit={onEdit}
        onArchive={onArchive}
        onRestore={onRestore}
        onDelete={onDelete}
        onAddSubcategory={onAddSubcategory}
        searchQuery={searchQuery}
      />

      <CategoryManagementSection
        title={t('categories.management.sections.outgoing')}
        categories={data?.outgoing ?? []}
        onEdit={onEdit}
        onArchive={onArchive}
        onRestore={onRestore}
        onDelete={onDelete}
        onAddSubcategory={onAddSubcategory}
        searchQuery={searchQuery}
      />

      {(data?.archived?.length ?? 0) > 0 && (
        <CategoryManagementSection
          title={t('categories.management.sections.archived')}
          categories={data?.archived ?? []}
          isArchived
          defaultCollapsed
          onEdit={onEdit}
          onArchive={onArchive}
          onRestore={onRestore}
          onDelete={onDelete}
          onAddSubcategory={onAddSubcategory}
          searchQuery={searchQuery}
        />
      )}
    </Stack>
  );
}

export type { CategoryManagementRow };
