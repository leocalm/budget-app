# Desktop Transaction Card List Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the desktop transactions table (`TransactionsLedger`) with a modern card-based list layout, matching the feel of banking apps like Apple Wallet or Notion list views.

**Architecture:** New `DesktopTransactionsList` component replaces `TransactionsLedger` in `TransactionsPageView`. Each transaction renders as a horizontal card row with category icon, description, metadata, and amount. Edit/delete actions appear on hover. Date grouping and batch mode are preserved.

**Tech Stack:** React, Mantine v8 (Paper, Group, Stack, ActionIcon, Text, ScrollArea, Button), `@tabler/icons-react`, `getIcon` from `@/utils/IconMap`, `CurrencyValue` from `@/components/Utils/CurrencyValue`.

---

### Task 1: Create DesktopTransactionsList component

**Files:**
- Create: `src/components/Transactions/DesktopTransactionsList.tsx`

**Step 1: Create the component file with the full implementation**

The component accepts the same props as `TransactionsLedger` (see `TransactionsLedgerProps` in `TransactionsLedger.tsx`).

```tsx
import React, { useMemo, useState } from 'react';
import { IconArrowRight, IconPencil, IconRepeat, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Button, Group, Paper, ScrollArea, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { TransactionRequest, TransactionResponse } from '@/types/transaction';
import { Vendor } from '@/types/vendor';
import { formatDisplayDate } from '@/utils/date';
import { getIcon } from '@/utils/IconMap';
import { BatchEntryRow } from './BatchEntryRow';

interface DesktopTransactionsListProps {
  transactions: TransactionResponse[];
  batchMode: boolean;
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  vendors: Vendor[];
  onSaveBatch: (payload: TransactionRequest) => Promise<void>;
  onEdit: (transaction: TransactionResponse) => void;
  onDelete: (id: string) => Promise<void>;
  isFetchingMore?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
}

function groupByDate(
  transactions: TransactionResponse[]
): Array<{ date: string; items: TransactionResponse[] }> {
  const map = new Map<string, TransactionResponse[]>();
  for (const tx of transactions) {
    const d = tx.occurredAt.slice(0, 10);
    if (!map.has(d)) {
      map.set(d, []);
    }
    map.get(d)!.push(tx);
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

export const DesktopTransactionsList = ({
  transactions,
  batchMode,
  accounts,
  categories,
  vendors,
  onSaveBatch,
  onEdit,
  onDelete,
  isFetchingMore,
  hasNextPage,
  onLoadMore,
}: DesktopTransactionsListProps) => {
  const { t } = useTranslation();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const groups = useMemo(() => groupByDate(transactions), [transactions]);

  const handleDelete = async (id: string) => {
    await onDelete(id);
    setConfirmDeleteId(null);
  };

  return (
    <Paper radius="md" style={{ overflow: 'hidden' }}>
      <ScrollArea h="calc(100vh - 280px)" scrollbars="y">
        {/* Batch entry row - rendered as a minimal table to keep BatchEntryRow working */}
        {batchMode && (
          <Paper p="md" mb="xs" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
            <table style={{ width: '100%' }}>
              <tbody>
                <BatchEntryRow
                  accounts={accounts}
                  categories={categories}
                  vendors={vendors}
                  onSave={onSaveBatch}
                />
              </tbody>
            </table>
          </Paper>
        )}

        <Stack gap={0}>
          {groups.map(({ date, items }, groupIndex) => (
            <React.Fragment key={date}>
              {/* Date group header */}
              <Text
                size="sm"
                fw={600}
                c="dimmed"
                px="md"
                py="xs"
                style={{
                  ...(groupIndex > 0
                    ? { borderTop: '1px solid var(--mantine-color-default-border)' }
                    : {}),
                }}
              >
                {formatDisplayDate(date)}
              </Text>

              {/* Transaction rows */}
              {items.map((tx) => {
                if (confirmDeleteId === tx.id) {
                  return (
                    <Group
                      key={tx.id}
                      justify="space-between"
                      px="md"
                      py="sm"
                      style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
                    >
                      <Text size="sm">{t('transactions.ledger.confirmDelete')}</Text>
                      <Group gap="xs">
                        <Button size="xs" variant="subtle" onClick={() => setConfirmDeleteId(null)}>
                          {t('common.cancel')}
                        </Button>
                        <Button
                          size="xs"
                          variant="subtle"
                          color="red"
                          onClick={() => void handleDelete(tx.id)}
                        >
                          {t('common.confirm')}
                        </Button>
                      </Group>
                    </Group>
                  );
                }

                const isTransfer = tx.category.categoryType === 'Transfer';
                const isIncoming = tx.category.categoryType === 'Incoming';
                const amountColor = isIncoming ? 'teal' : undefined;
                const amountPrefix = isIncoming ? '+' : '-';

                const categoryColor = tx.category.color
                  ? tx.category.color.startsWith('#')
                    ? tx.category.color
                    : `var(--mantine-color-${tx.category.color}-5)`
                  : undefined;

                return (
                  <Group
                    key={tx.id}
                    px="md"
                    py="sm"
                    gap="md"
                    wrap="nowrap"
                    justify="space-between"
                    className="transaction-card-row"
                    style={{
                      borderBottom: '1px solid var(--mantine-color-default-border)',
                      cursor: 'pointer',
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--mantine-color-default-hover)';
                      const actions = e.currentTarget.querySelector('[data-actions]') as HTMLElement;
                      if (actions) actions.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '';
                      const actions = e.currentTarget.querySelector('[data-actions]') as HTMLElement;
                      if (actions) actions.style.opacity = '0';
                    }}
                    onClick={() => onEdit(tx)}
                  >
                    {/* Left: icon */}
                    <ActionIcon
                      variant="light"
                      color={isTransfer ? 'blue' : categoryColor}
                      size="lg"
                      radius="md"
                      style={{ flexShrink: 0 }}
                    >
                      {isTransfer ? <IconRepeat size={20} /> : getIcon(tx.category.icon, 20)}
                    </ActionIcon>

                    {/* Middle: description + metadata */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={600} truncate>
                        {tx.description || '—'}
                      </Text>
                      <Text size="xs" c="dimmed" truncate>
                        {isTransfer ? (
                          <>
                            {tx.fromAccount.name} <IconArrowRight size={10} style={{ verticalAlign: 'middle' }} /> {tx.toAccount?.name ?? ''}
                          </>
                        ) : (
                          <>
                            {tx.category.name}
                            {tx.fromAccount?.name ? ` · ${tx.fromAccount.name}` : ''}
                            {tx.vendor?.name ? ` · ${tx.vendor.name}` : ''}
                          </>
                        )}
                      </Text>
                    </div>

                    {/* Right: amount */}
                    <Text
                      size="sm"
                      fw={600}
                      c={amountColor}
                      style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {amountPrefix}
                      <CurrencyValue cents={Math.abs(tx.amount)} />
                    </Text>

                    {/* Far right: hover actions */}
                    <Group
                      gap={4}
                      data-actions
                      style={{ opacity: 0, transition: 'opacity 150ms ease', flexShrink: 0 }}
                    >
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(tx);
                        }}
                        aria-label={t('common.edit')}
                      >
                        <IconPencil size={14} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(tx.id);
                        }}
                        aria-label={t('common.delete')}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>
                );
              })}
            </React.Fragment>
          ))}
        </Stack>

        {hasNextPage && (
          <Group justify="center" py="md">
            <Button variant="subtle" size="sm" loading={isFetchingMore} onClick={onLoadMore}>
              {t('common.loadMore')}
            </Button>
          </Group>
        )}
      </ScrollArea>
    </Paper>
  );
};
```

**Step 2: Commit**

```bash
git add src/components/Transactions/DesktopTransactionsList.tsx
git commit -m "feat(transactions): add DesktopTransactionsList card-based component"
```

---

### Task 2: Wire up DesktopTransactionsList in TransactionsPageView

**Files:**
- Modify: `src/components/Transactions/TransactionsPageView.tsx`

**Step 1: Replace TransactionsLedger import and usage**

In `TransactionsPageView.tsx`:
1. Replace import of `TransactionsLedger` with `DesktopTransactionsList`
2. Replace the `<TransactionsLedger ... />` JSX with `<DesktopTransactionsList ... />` (same props)

Change the import line:
```tsx
// Before:
import { TransactionsLedger } from './TransactionsLedger';
// After:
import { DesktopTransactionsList } from './DesktopTransactionsList';
```

Change the JSX (around line 258):
```tsx
// Before:
<TransactionsLedger
  transactions={transactions ?? []}
  ...
/>
// After:
<DesktopTransactionsList
  transactions={transactions ?? []}
  ...
/>
```

All props remain identical — the interface is the same.

**Step 2: Run typecheck**

Run: `yarn typecheck`
Expected: No errors

**Step 3: Visually verify in browser**

Navigate to `http://localhost:5173/transactions` and confirm:
- Card-based rows display correctly
- Date group headers appear
- Hover reveals edit/delete actions
- Amount colors are correct (teal for incoming)
- Category icons render with correct colors
- Transfers show arrow between accounts
- Load more button works

**Step 4: Commit**

```bash
git add src/components/Transactions/TransactionsPageView.tsx
git commit -m "feat(transactions): switch desktop view to card-based list"
```

---

### Task 3: Visual polish and edge cases

**Files:**
- Modify: `src/components/Transactions/DesktopTransactionsList.tsx`

**Step 1: Test and fix batch mode**

Verify batch mode still works. The `BatchEntryRow` is a table row (`<tr>`) component, so wrapping it in a bare `<table><tbody>` should work. If it looks broken, adjust the wrapper styling.

**Step 2: Test delete confirmation flow**

Click delete on a transaction, confirm the inline confirmation appears, test both cancel and confirm paths.

**Step 3: Test empty state**

If no transactions exist, the list should gracefully show nothing (the parent `TransactionsPageView` handles the empty message for mobile, but desktop may need the same treatment). If needed, add:

```tsx
{groups.length === 0 && (
  <Text size="sm" c="dimmed" ta="center" py="xl">
    {t('states.empty.transactions.message')}
  </Text>
)}
```

**Step 4: Run full test suite**

Run: `yarn typecheck && yarn vitest`
Expected: All pass

**Step 5: Commit**

```bash
git add -u
git commit -m "fix(transactions): polish card list edge cases"
```

---

### Task 4: Clean up and open PR

**Files:**
- No new files

**Step 1: Run prettier**

Run: `yarn prettier:write`

**Step 2: Run full checks**

Run: `yarn typecheck && yarn lint && yarn vitest`
Expected: All pass

**Step 3: Push and open draft PR**

```bash
git push -u origin <branch-name>
gh pr create --draft --title "feat(transactions): replace desktop table with card-based list" --body "$(cat <<'EOF'
## Summary

- Replaces the desktop `TransactionsLedger` table with a new `DesktopTransactionsList` card-based layout
- Each transaction renders as a horizontal row with category icon, description, metadata dots, and right-aligned amount
- Edit/delete actions appear on hover
- Date grouping preserved with sticky headers
- Batch mode, infinite scroll, and delete confirmation all retained

## Test plan

- [ ] Navigate to /transactions on desktop — card rows render correctly
- [ ] Hover a row — edit/delete icons fade in
- [ ] Click edit — modal opens
- [ ] Click delete — inline confirmation appears
- [ ] Incoming transactions show teal color with + prefix
- [ ] Transfer transactions show arrow between accounts
- [ ] Batch mode toggle still works
- [ ] Load more button works for pagination
- [ ] Mobile view is unaffected (still uses MobileTransactionsList)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
