# Transactions Page Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the global Transactions page to support batch entry mode, a redesigned filter bar (server-side), a date-grouped ledger, and a shared add/edit modal — backed by new backend filter query params.

**Architecture:** Backend gains filter params (`account_id`, `category_id`, `direction`, `vendor_id`, `date_from`, `date_to`) on the list endpoint and DB layer. Frontend replaces `TransactionsTableView` and related components with `TransactionsPageView`, `TransactionsLedger`, `BatchEntryRow`, `TransactionModal`, and a new `TransactionFilters` — all wired through the existing container. Unused components are deleted.

**Tech Stack:** Rust/Rocket (backend), React 19, Mantine v8, React Query (infinite), TypeScript, Vitest

---

## Task 1: Backend — `TransactionFilters` struct + DB layer

**Files:**
- Modify: `piggy-pulse-api/src/models/pagination.rs`
- Modify: `piggy-pulse-api/src/database/transaction.rs`

**Context:**
The current `list_transactions` and `get_transactions_for_period` methods take only `CursorParams`. We add an optional `TransactionFilters` struct and thread it through both DB methods.

**Step 1: Add `TransactionFilters` to pagination.rs**

Add after the `CursorPaginatedResponse` impl block:

```rust
/// Optional filter parameters for transaction queries.
#[derive(Debug, Clone, Default, Deserialize, Serialize, JsonSchema)]
#[serde(crate = "rocket::serde")]
pub struct TransactionFilters {
    pub account_ids: Vec<Uuid>,
    pub category_ids: Vec<Uuid>,
    pub direction: Option<String>,   // "Incoming" | "Outgoing" | "Transfer"
    pub vendor_ids: Vec<Uuid>,
    pub date_from: Option<NaiveDate>,
    pub date_to: Option<NaiveDate>,
}

impl TransactionFilters {
    pub fn is_empty(&self) -> bool {
        self.account_ids.is_empty()
            && self.category_ids.is_empty()
            && self.direction.is_none()
            && self.vendor_ids.is_empty()
            && self.date_from.is_none()
            && self.date_to.is_none()
    }
}
```

Add import at top of pagination.rs:
```rust
use chrono::NaiveDate;
use uuid::Uuid;
```

**Step 2: Write unit tests for `TransactionFilters::is_empty`**

```rust
#[test]
fn test_transaction_filters_is_empty_default() {
    let f = TransactionFilters::default();
    assert!(f.is_empty());
}

#[test]
fn test_transaction_filters_is_empty_with_direction() {
    let f = TransactionFilters { direction: Some("Incoming".to_string()), ..Default::default() };
    assert!(!f.is_empty());
}
```

**Step 3: Run tests**

```bash
cd piggy-pulse-api && cargo test models::pagination
```
Expected: all pass.

**Step 4: Update `build_transaction_query` in database/transaction.rs to accept filter clauses**

Replace the current `build_transaction_query` function signature and body:

```rust
fn build_transaction_query(from_clause: &str, base_where: &str, extra_where: &str, order_by: &str) -> String {
    let mut query = format!("SELECT {} FROM {} {}", TRANSACTION_SELECT_FIELDS, from_clause, TRANSACTION_JOINS);

    let clauses: Vec<&str> = [base_where, extra_where]
        .iter()
        .filter(|s| !s.is_empty())
        .copied()
        .collect();

    if !clauses.is_empty() {
        query.push_str("WHERE ");
        query.push_str(&clauses.join(" AND "));
    }

    if !order_by.is_empty() {
        query.push_str(" ORDER BY ");
        query.push_str(order_by);
    }

    query
}
```

Update all existing call sites of `build_transaction_query` to pass an empty string `""` as the new `extra_where` argument (third arg).

**Step 5: Add `build_filter_clause` helper**

Add after `build_transaction_query`:

```rust
/// Builds additional WHERE fragments and collects bind values for TransactionFilters.
/// Returns (sql_fragment, bind_offset) where bind_offset is the next free $N placeholder.
/// Callers must bind the returned values in the order they appear in the returned Vec.
fn build_filter_clause(filters: &TransactionFilters, start_offset: usize) -> (String, Vec<FilterBindValue>) {
    let mut parts = Vec::new();
    let mut binds: Vec<FilterBindValue> = Vec::new();
    let mut n = start_offset;

    if !filters.account_ids.is_empty() {
        parts.push(format!("t.from_account_id = ANY(${})", n));
        binds.push(FilterBindValue::UuidArray(filters.account_ids.clone()));
        n += 1;
    }
    if !filters.category_ids.is_empty() {
        parts.push(format!("t.category_id = ANY(${})", n));
        binds.push(FilterBindValue::UuidArray(filters.category_ids.clone()));
        n += 1;
    }
    if let Some(ref dir) = filters.direction {
        parts.push(format!("c.category_type::text = ${}", n));
        binds.push(FilterBindValue::Text(dir.clone()));
        n += 1;
    }
    if !filters.vendor_ids.is_empty() {
        parts.push(format!("t.vendor_id = ANY(${})", n));
        binds.push(FilterBindValue::UuidArray(filters.vendor_ids.clone()));
        n += 1;
    }
    if let Some(date_from) = filters.date_from {
        parts.push(format!("t.occurred_at >= ${}", n));
        binds.push(FilterBindValue::Date(date_from));
        n += 1;
    }
    if let Some(date_to) = filters.date_to {
        parts.push(format!("t.occurred_at <= ${}", n));
        binds.push(FilterBindValue::Date(date_to));
        n += 1;
    }
    let _ = n; // suppress unused warning

    (parts.join(" AND "), binds)
}

#[derive(Debug)]
enum FilterBindValue {
    UuidArray(Vec<Uuid>),
    Text(String),
    Date(NaiveDate),
}
```

**Step 6: Update `list_transactions` to accept filters**

Replace `list_transactions` signature:
```rust
pub async fn list_transactions(&self, params: &CursorParams, filters: &TransactionFilters, user_id: &Uuid) -> Result<Vec<Transaction>, AppError>
```

In the method body, build the filter clause and append. Because `sqlx` doesn't support dynamic bind lists easily, use a macro-free approach: build the SQL string with `build_filter_clause`, then use `sqlx::query_as` with manual binding via a helper.

The simplest correct approach: construct the query string dynamically and use `query_as`. For the filter binds use a boxed query approach:

```rust
pub async fn list_transactions(&self, params: &CursorParams, filters: &TransactionFilters, user_id: &Uuid) -> Result<Vec<Transaction>, AppError> {
    let (filter_sql, filter_binds) = build_filter_clause(filters, 2); // $1 = user_id

    let rows = if let Some(cursor) = params.cursor {
        // cursor path: user_id=$1, cursor=$2, then filter binds, then limit
        let (filter_sql_c, filter_binds_c) = build_filter_clause(filters, 3); // $1=user_id, $2=cursor
        let base = build_transaction_query(
            "transaction t",
            "t.user_id = $1 AND (t.occurred_at, t.created_at, t.id) < (SELECT occurred_at, created_at, id FROM transaction WHERE id = $2)",
            &filter_sql_c,
            "t.occurred_at DESC, t.created_at DESC, t.id DESC",
        );
        let limit_n = 3 + filter_binds_c.len();
        let full_query = format!("{} LIMIT ${}", base, limit_n);
        let mut q = sqlx::query_as::<_, TransactionRow>(&full_query)
            .bind(user_id)
            .bind(cursor);
        for bind in &filter_binds_c {
            q = bind_filter_value(q, bind);
        }
        q.bind(params.fetch_limit()).fetch_all(&self.pool).await?
    } else {
        let base = build_transaction_query(
            "transaction t",
            "t.user_id = $1",
            &filter_sql,
            "t.occurred_at DESC, t.created_at DESC, t.id DESC",
        );
        let limit_n = 2 + filter_binds.len();
        let full_query = format!("{} LIMIT ${}", base, limit_n);
        let mut q = sqlx::query_as::<_, TransactionRow>(&full_query).bind(user_id);
        for bind in &filter_binds {
            q = bind_filter_value(q, bind);
        }
        q.bind(params.fetch_limit()).fetch_all(&self.pool).await?
    };

    Ok(rows.into_iter().map(Transaction::from).collect())
}
```

Add `bind_filter_value` helper (note: sqlx query type must be carried through; use a type alias):

```rust
fn bind_filter_value<'q>(
    q: sqlx::query::QueryAs<'q, sqlx::Postgres, TransactionRow, sqlx::postgres::PgArguments>,
    bind: &'q FilterBindValue,
) -> sqlx::query::QueryAs<'q, sqlx::Postgres, TransactionRow, sqlx::postgres::PgArguments> {
    match bind {
        FilterBindValue::UuidArray(ids) => q.bind(ids),
        FilterBindValue::Text(s) => q.bind(s),
        FilterBindValue::Date(d) => q.bind(d),
    }
}
```

**Step 7: Update `get_transactions_for_period` identically**

Same pattern: add `filters: &TransactionFilters` parameter, build filter clause starting after the last fixed bind position, append to WHERE.

**Step 8: Run backend tests + clippy**

```bash
cd piggy-pulse-api && cargo test && cargo clippy --workspace --all-targets -- -D warnings
```
Expected: all pass.

**Step 9: Commit**

```bash
cd piggy-pulse-api
git add src/models/pagination.rs src/database/transaction.rs
git commit -m "feat(api): add TransactionFilters struct and thread filters through DB layer"
```

---

## Task 2: Backend — Route update

**Files:**
- Modify: `piggy-pulse-api/src/routes/transaction.rs`

**Step 1: Add filter query params to `list_all_transactions`**

Replace the route signature:

```rust
#[get("/?<period_id>&<cursor>&<limit>&<account_id>&<category_id>&<direction>&<vendor_id>&<date_from>&<date_to>")]
pub async fn list_all_transactions(
    pool: &State<PgPool>,
    _rate_limit: RateLimit,
    current_user: CurrentUser,
    period_id: Option<String>,
    cursor: Option<String>,
    limit: Option<i64>,
    account_id: Vec<String>,
    category_id: Vec<String>,
    direction: Option<String>,
    vendor_id: Vec<String>,
    date_from: Option<String>,
    date_to: Option<String>,
) -> Result<Json<CursorPaginatedResponse<TransactionResponse>>, AppError>
```

Add import:
```rust
use crate::models::pagination::TransactionFilters;
use chrono::NaiveDate;
```

Build filters before the branch:
```rust
let filters = {
    let account_ids = account_id.iter()
        .map(|s| Uuid::parse_str(s).map_err(|e| AppError::uuid("Invalid account_id", e)))
        .collect::<Result<Vec<_>, _>>()?;
    let category_ids = category_id.iter()
        .map(|s| Uuid::parse_str(s).map_err(|e| AppError::uuid("Invalid category_id", e)))
        .collect::<Result<Vec<_>, _>>()?;
    let vendor_ids = vendor_id.iter()
        .map(|s| Uuid::parse_str(s).map_err(|e| AppError::uuid("Invalid vendor_id", e)))
        .collect::<Result<Vec<_>, _>>()?;
    let date_from = date_from.as_deref()
        .map(|s| NaiveDate::parse_from_str(s, "%Y-%m-%d")
            .map_err(|_| AppError::BadRequest("Invalid date_from format, expected YYYY-MM-DD".to_string())))
        .transpose()?;
    let date_to = date_to.as_deref()
        .map(|s| NaiveDate::parse_from_str(s, "%Y-%m-%d")
            .map_err(|_| AppError::BadRequest("Invalid date_to format, expected YYYY-MM-DD".to_string())))
        .transpose()?;
    TransactionFilters { account_ids, category_ids, direction, vendor_ids, date_from, date_to }
};
```

Pass `&filters` to `repo.get_transactions_for_period` and `repo.list_transactions`.

**Step 2: Run clippy + tests**

```bash
cd piggy-pulse-api && cargo clippy --workspace --all-targets -- -D warnings && cargo test
```

**Step 3: Commit**

```bash
git add src/routes/transaction.rs
git commit -m "feat(api): expose filter query params on GET /transactions"
```

---

## Task 3: Frontend — API layer filter support

**Files:**
- Modify: `piggy-pulse-app/src/api/transaction.ts`
- Modify: `piggy-pulse-app/src/hooks/queryKeys.ts`

**Context:**
`fetchTransactionsPage` currently accepts `{ selectedPeriodId, cursor, pageSize }`. We add a `filters` param and serialize it into query string. `queryKeys.transactionsInfinite` must include filters so React Query re-fetches when filters change.

**Step 1: Define `TransactionFilterParams` type in `transaction.ts`**

Add before `FetchTransactionsPageParams`:

```typescript
export interface TransactionFilterParams {
  accountIds?: string[];
  categoryIds?: string[];
  direction?: 'Incoming' | 'Outgoing' | 'Transfer' | 'all';
  vendorIds?: string[];
  dateFrom?: string | null;
  dateTo?: string | null;
}
```

**Step 2: Update `FetchTransactionsPageParams`**

```typescript
export interface FetchTransactionsPageParams {
  selectedPeriodId: string | null;
  cursor?: string | null;
  pageSize?: number;
  filters?: TransactionFilterParams;
}
```

**Step 3: Update `fetchTransactionsPage` to serialize filters**

In the function body, after setting `page_size`, add:

```typescript
const { filters } = params;
if (filters) {
  if (filters.accountIds?.length) {
    filters.accountIds.forEach((id) => searchParams.append('account_id', id));
  }
  if (filters.categoryIds?.length) {
    filters.categoryIds.forEach((id) => searchParams.append('category_id', id));
  }
  if (filters.direction && filters.direction !== 'all') {
    searchParams.set('direction', filters.direction);
  }
  if (filters.vendorIds?.length) {
    filters.vendorIds.forEach((id) => searchParams.append('vendor_id', id));
  }
  if (filters.dateFrom) searchParams.set('date_from', filters.dateFrom);
  if (filters.dateTo) searchParams.set('date_to', filters.dateTo);
}
```

**Step 4: Update `queryKeys.transactionsInfinite` to include filters**

```typescript
transactionsInfinite: (periodId?: string | null, pageSize = 50, filters?: TransactionFilterParams) =>
  ['transactions', periodId, 'infinite', pageSize, filters] as const,
```

Add import at top of `queryKeys.ts`:
```typescript
import type { TransactionFilterParams } from '@/api/transaction';
```

**Step 5: Write tests for filter serialization in `transaction.ts`**

Create `piggy-pulse-app/src/api/transaction.test.ts`:

```typescript
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fetchTransactionsPage } from './transaction';
import * as client from './client';

vi.mock('./client', () => ({ apiGetRaw: vi.fn() }));
const mockApiGetRaw = vi.mocked(client.apiGetRaw);

describe('fetchTransactionsPage filter serialization', () => {
  beforeEach(() => {
    mockApiGetRaw.mockResolvedValue({ transactions: [], nextCursor: null });
  });

  it('appends account_id params', async () => {
    await fetchTransactionsPage({
      selectedPeriodId: null,
      filters: { accountIds: ['abc', 'def'] },
    });
    const url = mockApiGetRaw.mock.calls[0][0] as string;
    expect(url).toContain('account_id=abc');
    expect(url).toContain('account_id=def');
  });

  it('omits direction=all', async () => {
    await fetchTransactionsPage({
      selectedPeriodId: null,
      filters: { direction: 'all' },
    });
    const url = mockApiGetRaw.mock.calls[0][0] as string;
    expect(url).not.toContain('direction');
  });

  it('includes direction when not all', async () => {
    await fetchTransactionsPage({
      selectedPeriodId: null,
      filters: { direction: 'Outgoing' },
    });
    const url = mockApiGetRaw.mock.calls[0][0] as string;
    expect(url).toContain('direction=Outgoing');
  });
});
```

**Step 6: Run tests**

```bash
cd piggy-pulse-app && yarn vitest run src/api/transaction.test.ts
```
Expected: 3 passing.

**Step 7: Commit**

```bash
git add src/api/transaction.ts src/hooks/queryKeys.ts src/api/transaction.test.ts
git commit -m "feat(app): add filter params to fetchTransactionsPage and queryKeys"
```

---

## Task 4: Frontend — `useInfiniteTransactions` filter support

**Files:**
- Modify: `piggy-pulse-app/src/hooks/useTransactions.ts`
- Modify: `piggy-pulse-app/src/hooks/useTransactions.test.tsx`

**Step 1: Update `useInfiniteTransactions` signature**

```typescript
export const useInfiniteTransactions = (
  selectedPeriodId: string | null,
  filters?: TransactionFilterParams
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.transactionsInfinite(selectedPeriodId, TRANSACTIONS_PAGE_SIZE, filters),
    queryFn: ({ pageParam }) =>
      fetchTransactionsPage({
        selectedPeriodId,
        cursor: pageParam,
        pageSize: TRANSACTIONS_PAGE_SIZE,
        filters,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: selectedPeriodId !== null,
  });
};
```

Add import at top:
```typescript
import type { TransactionFilterParams } from '@/api/transaction';
```

**Step 2: Update invalidation in mutation hooks**

The `useDeleteTransaction`, `useCreateTransaction`, `useCreateTransactionFromRequest`, `useUpdateTransaction` hooks call `queryClient.invalidateQueries` with `queryKeys.transactionsInfinite(selectedPeriodId, TRANSACTIONS_PAGE_SIZE)`. Since filters are now part of the key, invalidate the root prefix instead so all filter variants are cleared:

Replace the transactionsInfinite invalidation in each mutation's `onSuccess`:
```typescript
queryClient.invalidateQueries({
  queryKey: ['transactions', selectedPeriodId, 'infinite'],
});
```

**Step 3: Add test for filter-aware query key**

In `useTransactions.test.tsx`, add:

```typescript
it('uses filter in the query key so different filters fetch independently', async () => {
  const { wrapper } = createWrapper();
  mockFetchTransactionsPage.mockResolvedValue({ transactions: [], nextCursor: null });

  const filters: TransactionFilterParams = { direction: 'Outgoing' };
  const { result } = renderHook(
    () => useInfiniteTransactions('period-1', filters),
    { wrapper }
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(mockFetchTransactionsPage).toHaveBeenCalledWith(
    expect.objectContaining({ filters })
  );
});
```

**Step 4: Run tests**

```bash
cd piggy-pulse-app && yarn vitest run src/hooks/useTransactions.test.tsx
```
Expected: all pass.

**Step 5: Commit**

```bash
git add src/hooks/useTransactions.ts src/hooks/useTransactions.test.tsx
git commit -m "feat(app): thread filters through useInfiniteTransactions hook"
```

---

## Task 5: Frontend — `TransactionModal` (shared add/edit modal)

**Files:**
- Create: `piggy-pulse-app/src/components/Transactions/TransactionModal.tsx`

**Context:**
Replaces the drawer in `TransactionsTableView`. Wraps `QuickAddTransaction` (add mode) and `EditTransactionForm` (edit mode) in a Mantine `Modal`. Edit mode is triggered by passing a `transaction` prop.

**Step 1: Create `TransactionModal.tsx`**

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@mantine/core';
import { QuickAddTransaction } from './Form/QuickAddTransaction';
import { EditTransactionForm, type EditFormValues } from './Form/EditTransactionForm';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { TransactionResponse } from '@/types/transaction';
import { Vendor } from '@/types/vendor';

interface TransactionModalProps {
  opened: boolean;
  onClose: () => void;
  // If provided → edit mode; if null → add mode
  transaction?: TransactionResponse | null;
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  vendors: Vendor[];
  onSave?: (data: EditFormValues) => Promise<void>;
  isSavePending?: boolean;
}

export const TransactionModal = ({
  opened,
  onClose,
  transaction,
  accounts,
  categories,
  vendors,
  onSave,
  isSavePending = false,
}: TransactionModalProps) => {
  const { t } = useTranslation();
  const isEdit = transaction != null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? t('transactions.modal.editTitle') : t('transactions.modal.addTitle')}
      size="lg"
      centered
    >
      {isEdit && onSave ? (
        <EditTransactionForm
          transaction={transaction}
          accounts={accounts}
          categories={categories}
          vendors={vendors}
          onSave={async (data) => {
            await onSave(data);
            onClose();
          }}
          onCancel={onClose}
          isPending={isSavePending}
        />
      ) : (
        <QuickAddTransaction onSuccess={onClose} />
      )}
    </Modal>
  );
};
```

**Step 2: Add translation keys**

In `piggy-pulse-app/src/locales/en/translation.json`, find the `transactions` section and add:

```json
"modal": {
  "addTitle": "Add Transaction",
  "editTitle": "Edit Transaction"
}
```

**Step 3: Commit**

```bash
cd piggy-pulse-app
git add src/components/Transactions/TransactionModal.tsx src/locales/en/translation.json
git commit -m "feat(app): add TransactionModal for shared add/edit"
```

---

## Task 6: Frontend — `TransactionFilters` (redesigned)

**Files:**
- Create: `piggy-pulse-app/src/components/Transactions/TransactionFilters.tsx`

**Context:**
Replaces the old `Table/TransactionFilters.tsx`. Props drive server-side query params. Uses Mantine `SegmentedControl`, `MultiSelect`, `TextInput` (date). Has a "Clear" button.

**Step 1: Create `TransactionFilters.tsx`**

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, MultiSelect, SegmentedControl, Stack, Text, TextInput } from '@mantine/core';
import { IconFilter } from '@tabler/icons-react';
import type { TransactionFilterParams } from '@/api/transaction';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { Vendor } from '@/types/vendor';

interface TransactionFiltersProps {
  filters: TransactionFilterParams;
  onChange: (filters: TransactionFilterParams) => void;
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  vendors: Vendor[];
}

const DIRECTIONS = [
  { label: 'All', value: 'all' },
  { label: 'In', value: 'Incoming' },
  { label: 'Out', value: 'Outgoing' },
  { label: 'Transfer', value: 'Transfer' },
];

const isEmpty = (f: TransactionFilterParams) =>
  (!f.direction || f.direction === 'all') &&
  !f.accountIds?.length &&
  !f.categoryIds?.length &&
  !f.vendorIds?.length &&
  !f.dateFrom &&
  !f.dateTo;

export const TransactionFilters = ({
  filters,
  onChange,
  accounts,
  categories,
  vendors,
}: TransactionFiltersProps) => {
  const { t } = useTranslation();

  const set = (patch: Partial<TransactionFilterParams>) => onChange({ ...filters, ...patch });

  return (
    <Stack gap="sm">
      <Group align="flex-end" gap="md" wrap="wrap">
        <div>
          <Text size="xs" c="dimmed" mb={4}>{t('transactions.filters.direction')}</Text>
          <SegmentedControl
            size="xs"
            data={DIRECTIONS}
            value={filters.direction ?? 'all'}
            onChange={(val) => set({ direction: val as TransactionFilterParams['direction'] })}
          />
        </div>

        <MultiSelect
          label={t('transactions.filters.accounts')}
          data={accounts.map((a) => ({ value: a.id, label: a.name }))}
          value={filters.accountIds ?? []}
          onChange={(val) => set({ accountIds: val })}
          placeholder={t('transactions.filters.allAccounts')}
          searchable
          size="xs"
          w={200}
          clearable
        />

        <MultiSelect
          label={t('transactions.filters.categories')}
          data={categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
          value={filters.categoryIds ?? []}
          onChange={(val) => set({ categoryIds: val })}
          placeholder={t('transactions.filters.allCategories')}
          searchable
          size="xs"
          w={200}
          clearable
        />

        <MultiSelect
          label={t('transactions.filters.vendors')}
          data={vendors.map((v) => ({ value: v.id, label: v.name }))}
          value={filters.vendorIds ?? []}
          onChange={(val) => set({ vendorIds: val })}
          placeholder={t('transactions.filters.allVendors')}
          searchable
          size="xs"
          w={160}
          clearable
        />

        <TextInput
          label={t('transactions.filters.dateFrom')}
          placeholder="YYYY-MM-DD"
          size="xs"
          w={130}
          value={filters.dateFrom ?? ''}
          onChange={(e) => set({ dateFrom: e.currentTarget.value || null })}
        />

        <TextInput
          label={t('transactions.filters.dateTo')}
          placeholder="YYYY-MM-DD"
          size="xs"
          w={130}
          value={filters.dateTo ?? ''}
          onChange={(e) => set({ dateTo: e.currentTarget.value || null })}
        />

        {!isEmpty(filters) && (
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            leftSection={<IconFilter size={14} />}
            onClick={() => onChange({ direction: 'all' })}
            style={{ alignSelf: 'flex-end' }}
          >
            {t('transactions.filters.clearAll')}
          </Button>
        )}
      </Group>
    </Stack>
  );
};
```

**Step 2: Add translation keys**

In `translation.json`, update the `transactions.filters` section:

```json
"filters": {
  "direction": "Direction",
  "accounts": "Accounts",
  "categories": "Categories",
  "vendors": "Vendors",
  "dateFrom": "From",
  "dateTo": "To",
  "allAccounts": "All accounts",
  "allCategories": "All categories",
  "allVendors": "All vendors",
  "clearAll": "Clear filters"
}
```

**Step 3: Commit**

```bash
git add src/components/Transactions/TransactionFilters.tsx src/locales/en/translation.json
git commit -m "feat(app): add redesigned TransactionFilters component"
```

---

## Task 7: Frontend — `BatchEntryRow`

**Files:**
- Create: `piggy-pulse-app/src/components/Transactions/BatchEntryRow.tsx`

**Context:**
Pinned inline row at top of the ledger in batch mode. Uses `useTransactionForm` / `TransactionFormContext`. After save: clears category + vendor, preserves date + account, focuses category. Esc clears without losing sticky defaults. Transfer mode triggered by Transfer category.

**Step 1: Create `BatchEntryRow.tsx`**

```typescript
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionIcon,
  Autocomplete,
  Group,
  NumberInput,
  Select,
  Table,
  TextInput,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { TransactionRequest } from '@/types/transaction';
import { Vendor } from '@/types/vendor';
import { convertDisplayToCents } from '@/utils/currency';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { useCreateVendor, useVendors } from '@/hooks/useVendors';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { formatDateForApi } from '@/utils/date';
import { toast } from '@/lib/toast';

interface BatchEntryRowProps {
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  vendors: Vendor[];
  onSave: (payload: TransactionRequest) => Promise<void>;
}

interface BatchFormValues {
  occurredAt: string;
  description: string;
  categoryId: string;
  fromAccountId: string;
  toAccountId: string;
  vendorName: string;
  amount: number | '';
}

const today = () => new Date().toISOString().slice(0, 10);

export const BatchEntryRow = ({ accounts, categories, vendors, onSave }: BatchEntryRowProps) => {
  const { t } = useTranslation();
  const globalCurrency = useDisplayCurrency();
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const createVendorMutation = useCreateVendor();
  const categoryRef = useRef<HTMLInputElement>(null);

  const form = useForm<BatchFormValues>({
    initialValues: {
      occurredAt: today(),
      description: '',
      categoryId: '',
      fromAccountId: '',
      toAccountId: '',
      vendorName: '',
      amount: '',
    },
    validate: {
      occurredAt: (v) => (!v ? t('transactions.quickAddTransaction.error.occurredAt.required') : null),
      categoryId: (v) => (!v ? t('transactions.quickAddTransaction.error.category.required') : null),
      fromAccountId: (v) => (!v ? t('transactions.quickAddTransaction.error.fromAccount.required') : null),
      amount: (v) => (v === '' || Number(v) <= 0 ? t('transactions.quickAddTransaction.error.amount.greaterThanZero') : null),
      toAccountId: (v, vals) => {
        const cat = categories.find((c) => c.id === vals.categoryId);
        if (cat?.categoryType === 'Transfer' && !v) {
          return t('transactions.quickAddTransaction.error.toAccount.required');
        }
        return null;
      },
    },
  });

  const selectedCategory = categories.find((c) => c.id === form.values.categoryId);
  const isTransfer = selectedCategory?.categoryType === 'Transfer';

  const handleSubmit = form.onSubmit(async (values) => {
    let vendorId: string | undefined;
    if (!isTransfer && values.vendorName.trim()) {
      const existing = vendors.find((v) => v.name.toLowerCase() === values.vendorName.toLowerCase());
      if (existing) {
        vendorId = existing.id;
      } else {
        try {
          const created = await createVendorMutation.mutateAsync({ name: values.vendorName.trim() });
          vendorId = created.id;
        } catch {
          return;
        }
      }
    }

    const payload: TransactionRequest = {
      description: values.description,
      amount: convertDisplayToCents(Number(values.amount)),
      occurredAt: values.occurredAt,
      categoryId: values.categoryId,
      fromAccountId: values.fromAccountId,
      toAccountId: isTransfer ? values.toAccountId : undefined,
      vendorId,
    };

    try {
      await onSave(payload);
      // Reset: keep date + account, clear rest
      form.setValues((prev) => ({
        ...prev,
        description: '',
        categoryId: '',
        toAccountId: '',
        vendorName: '',
        amount: '',
      }));
      setTimeout(() => categoryRef.current?.focus(), 50);
    } catch {
      toast.error({ title: t('common.error'), message: t('transactions.batch.saveError'), nonCritical: true });
    }
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      const stickyDate = form.values.occurredAt;
      const stickyAccount = form.values.fromAccountId;
      form.reset();
      form.setValues((prev) => ({ ...prev, occurredAt: stickyDate, fromAccountId: stickyAccount }));
    }
  };

  return (
    <Table.Tr onKeyDown={handleKeyDown} style={{ background: 'var(--mantine-color-blue-light)' }}>
      <Table.Td>
        <TextInput
          size="xs"
          placeholder="YYYY-MM-DD"
          {...form.getInputProps('occurredAt')}
          w={110}
        />
      </Table.Td>
      <Table.Td>
        <TextInput
          size="xs"
          placeholder={t('transactions.batch.notesPlaceholder')}
          {...form.getInputProps('description')}
        />
      </Table.Td>
      <Table.Td>
        <Select
          ref={categoryRef}
          size="xs"
          placeholder={t('transactions.batch.categoryPlaceholder')}
          data={categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
          searchable
          {...form.getInputProps('categoryId')}
          w={160}
        />
      </Table.Td>
      <Table.Td>
        {isTransfer ? (
          <Group gap="xs" wrap="nowrap">
            <Select
              size="xs"
              placeholder={t('transactions.batch.fromAccount')}
              data={accounts.map((a) => ({ value: a.id, label: a.name }))}
              searchable
              {...form.getInputProps('fromAccountId')}
              w={130}
            />
            <Select
              size="xs"
              placeholder={t('transactions.batch.toAccount')}
              data={accounts
                .filter((a) => a.id !== form.values.fromAccountId)
                .map((a) => ({ value: a.id, label: a.name }))}
              searchable
              {...form.getInputProps('toAccountId')}
              w={130}
            />
          </Group>
        ) : (
          <Select
            size="xs"
            placeholder={t('transactions.batch.accountPlaceholder')}
            data={accounts.map((a) => ({ value: a.id, label: a.name }))}
            searchable
            {...form.getInputProps('fromAccountId')}
            w={160}
          />
        )}
      </Table.Td>
      <Table.Td>
        {!isTransfer && (
          <Autocomplete
            size="xs"
            placeholder={t('transactions.batch.vendorPlaceholder')}
            data={vendors.map((v) => v.name)}
            {...form.getInputProps('vendorName')}
            w={130}
          />
        )}
      </Table.Td>
      <Table.Td>
        <NumberInput
          size="xs"
          placeholder="0.00"
          decimalScale={globalCurrency.decimalPlaces}
          fixedDecimalScale
          hideControls
          leftSection={globalCurrency.symbol}
          {...form.getInputProps('amount')}
          w={100}
        />
      </Table.Td>
      <Table.Td>
        <ActionIcon
          size="sm"
          variant="filled"
          color="blue"
          onClick={() => void handleSubmit()}
          aria-label={t('transactions.batch.save')}
        >
          <IconCheck size={14} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
};
```

**Step 2: Add translation keys** in `translation.json`:

```json
"batch": {
  "notesPlaceholder": "Notes",
  "categoryPlaceholder": "Category",
  "accountPlaceholder": "Account",
  "fromAccount": "From",
  "toAccount": "To",
  "vendorPlaceholder": "Vendor",
  "save": "Save",
  "saveError": "Failed to save transaction"
}
```

**Step 3: Commit**

```bash
git add src/components/Transactions/BatchEntryRow.tsx src/locales/en/translation.json
git commit -m "feat(app): add BatchEntryRow for batch entry mode"
```

---

## Task 8: Frontend — `TransactionsLedger`

**Files:**
- Create: `piggy-pulse-app/src/components/Transactions/TransactionsLedger.tsx`

**Context:**
Date-grouped table. Columns: Date | Notes | Category | Account | Vendor | Amount | Actions. In batch mode, `BatchEntryRow` is pinned before the first date group. Inline neutral delete confirmation. Edit opens `TransactionModal`.

**Step 1: Create `TransactionsLedger.tsx`**

```typescript
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  ScrollArea,
  Table,
  Text,
} from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { TransactionRequest, TransactionResponse } from '@/types/transaction';
import { Vendor } from '@/types/vendor';
import { convertCentsToDisplay } from '@/utils/currency';
import { BatchEntryRow } from './BatchEntryRow';

interface TransactionsLedgerProps {
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

function groupByDate(transactions: TransactionResponse[]): Array<{ date: string; items: TransactionResponse[] }> {
  const map = new Map<string, TransactionResponse[]>();
  for (const tx of transactions) {
    const d = tx.occurredAt.slice(0, 10);
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(tx);
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

function formatAmount(tx: TransactionResponse): string {
  const isIncoming = tx.category.categoryType === 'Incoming';
  const isTransfer = tx.category.categoryType === 'Transfer';
  const display = convertCentsToDisplay(tx.amount).toFixed(2);
  if (isTransfer) return display;
  return isIncoming ? `+${display}` : `−${display}`;
}

export const TransactionsLedger = ({
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
}: TransactionsLedgerProps) => {
  const { t } = useTranslation();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const groups = useMemo(() => groupByDate(transactions), [transactions]);

  const handleDelete = async (id: string) => {
    await onDelete(id);
    setConfirmDeleteId(null);
  };

  return (
    <ScrollArea offsetScrollbars h="calc(100vh - 280px)">
      <Table verticalSpacing="sm" highlightOnHover striped="even">
        <Table.Thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1, boxShadow: '0 1px 0 var(--mantine-color-default-border)' }}>
          <Table.Tr>
            <Table.Th w={110}>{t('transactions.list.date')}</Table.Th>
            <Table.Th>{t('transactions.list.notes')}</Table.Th>
            <Table.Th w={180}>{t('transactions.list.category')}</Table.Th>
            <Table.Th w={220}>{t('transactions.list.account')}</Table.Th>
            <Table.Th w={150}>{t('transactions.list.vendor')}</Table.Th>
            <Table.Th w={120} ta="right">{t('transactions.list.amount')}</Table.Th>
            <Table.Th w={80} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {batchMode && (
            <BatchEntryRow
              accounts={accounts}
              categories={categories}
              vendors={vendors}
              onSave={onSaveBatch}
            />
          )}

          {groups.map(({ date, items }) => (
            <React.Fragment key={date}>
              <Table.Tr>
                <Table.Td colSpan={7} style={{ background: 'var(--bg-elevated)', padding: '4px 16px' }}>
                  <Text size="xs" fw={600} c="dimmed">{date}</Text>
                </Table.Td>
              </Table.Tr>
              {items.map((tx) => {
                if (confirmDeleteId === tx.id) {
                  return (
                    <Table.Tr key={tx.id}>
                      <Table.Td colSpan={5}>
                        <Text size="sm">{t('transactions.ledger.confirmDelete')}</Text>
                      </Table.Td>
                      <Table.Td colSpan={2}>
                        <Group gap="xs" justify="flex-end">
                          <Button size="xs" variant="subtle" onClick={() => setConfirmDeleteId(null)}>
                            {t('common.cancel')}
                          </Button>
                          <Button size="xs" variant="subtle" onClick={() => void handleDelete(tx.id)}>
                            {t('common.confirm')}
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                }

                const isTransfer = tx.category.categoryType === 'Transfer';
                const amountColor = tx.category.categoryType === 'Incoming' ? 'teal' : undefined;

                return (
                  <Table.Tr key={tx.id}>
                    <Table.Td>
                      <Text size="sm">{tx.occurredAt.slice(0, 10)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{tx.description}</Text>
                    </Table.Td>
                    <Table.Td>
                      {isTransfer ? (
                        <Text size="sm" c="dimmed">→ {tx.toAccount?.name ?? ''}</Text>
                      ) : (
                        <Badge size="sm" variant="light" color={tx.category.color}>
                          {tx.category.icon} {tx.category.name}
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{tx.fromAccount.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">{tx.vendor?.name ?? ''}</Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm" c={amountColor} fw={500}>{formatAmount(tx)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} justify="flex-end">
                        <ActionIcon size="sm" variant="subtle" onClick={() => onEdit(tx)} aria-label={t('common.edit')}>
                          <IconPencil size={14} />
                        </ActionIcon>
                        <ActionIcon size="sm" variant="subtle" onClick={() => setConfirmDeleteId(tx.id)} aria-label={t('common.delete')}>
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </React.Fragment>
          ))}
        </Table.Tbody>
      </Table>

      {hasNextPage && (
        <Group justify="center" py="md">
          <Button variant="subtle" size="sm" loading={isFetchingMore} onClick={onLoadMore}>
            {t('common.loadMore')}
          </Button>
        </Group>
      )}
    </ScrollArea>
  );
};
```

**Step 2: Add translation keys**:

```json
"ledger": {
  "confirmDelete": "Delete this transaction?"
},
"list": {
  "notes": "Notes",
  "account": "Account",
  "vendor": "Vendor"
}
```

Also ensure `common.confirm`, `common.edit`, `common.delete`, `common.loadMore` exist in translation.json.

**Step 3: Commit**

```bash
git add src/components/Transactions/TransactionsLedger.tsx src/locales/en/translation.json
git commit -m "feat(app): add date-grouped TransactionsLedger with batch mode and delete confirmation"
```

---

## Task 9: Frontend — `TransactionsPageView` (top-level view)

**Files:**
- Create: `piggy-pulse-app/src/components/Transactions/TransactionsPageView.tsx`
- Modify: `piggy-pulse-app/src/components/Transactions/PageHeader.tsx`

**Context:**
Replaces `TransactionsTableView`. Owns `batchMode`, `filters`, and `modalState`. Renders `PageHeader`, `TransactionFilters`, `TransactionsLedger`, `TransactionModal`. Mobile path: card list + FAB + mobile filter button.

**Step 1: Check/update `PageHeader.tsx`**

Read `piggy-pulse-app/src/components/Transactions/PageHeader.tsx` and update to accept `batchMode: boolean`, `onToggleBatch: () => void`, `onAdd: () => void`.

**Step 2: Create `TransactionsPageView.tsx`**

```typescript
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Affix,
  ActionIcon,
  Box,
  Drawer,
  Stack,
  Transition,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { StateRenderer, TransactionListSkeleton } from '@/components/Utils';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { TransactionRequest, TransactionResponse } from '@/types/transaction';
import { Vendor, VendorInput } from '@/types/vendor';
import type { TransactionFilterParams } from '@/api/transaction';
import type { EditFormValues } from './Form/EditTransactionForm';
import { TransactionFilters } from './TransactionFilters';
import { TransactionsLedger } from './TransactionsLedger';
import { TransactionModal } from './TransactionModal';
import { MobileTransactionCard } from './List/MobileTransactionCard';
import { PageHeader } from './PageHeader';
import { formatDateForApi } from '@/utils/date';
import { convertDisplayToCents } from '@/utils/currency';
import { useCreateVendor } from '@/hooks/useVendors';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';

export interface TransactionsPageViewProps {
  transactions: TransactionResponse[] | undefined;
  isLocked: boolean;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  insertEnabled: boolean;
  accounts: AccountResponse[] | undefined;
  categories: CategoryResponse[] | undefined;
  vendors: Vendor[] | undefined;
  filters: TransactionFilterParams;
  onFiltersChange: (filters: TransactionFilterParams) => void;
  createTransaction: (payload: TransactionRequest) => Promise<unknown>;
  updateTransaction: (id: string, payload: TransactionRequest) => Promise<unknown>;
  deleteTransaction: (id: string) => Promise<unknown>;
  isFetchingMore?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
}

export const TransactionsPageView = ({
  transactions,
  isLocked,
  isLoading,
  isError,
  onRetry,
  insertEnabled,
  accounts = [],
  categories = [],
  vendors = [],
  filters,
  onFiltersChange,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  isFetchingMore,
  hasNextPage,
  onLoadMore,
}: TransactionsPageViewProps) => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const [batchMode, setBatchMode] = useState(false);
  const [modalState, setModalState] = useState<{ open: boolean; transaction: TransactionResponse | null }>({
    open: false,
    transaction: null,
  });
  const [mobileFilterDrawer, { open: openMobileFilter, close: closeMobileFilter }] = useDisclosure(false);

  const createVendorMutation = useCreateVendor();

  const openAdd = () => setModalState({ open: true, transaction: null });
  const openEdit = (tx: TransactionResponse) => setModalState({ open: true, transaction: tx });
  const closeModal = () => setModalState({ open: false, transaction: null });

  const handleSaveEdit = async (data: EditFormValues) => {
    let vendorId: string | undefined;
    if (data.categoryType !== 'Transfer' && data.vendorName?.trim()) {
      const existing = vendors.find((v) => v.name.toLowerCase() === data.vendorName.toLowerCase());
      if (existing) {
        vendorId = existing.id;
      } else {
        const created = await createVendorMutation.mutateAsync({ name: data.vendorName.trim() });
        vendorId = created.id;
      }
    }

    const payload: TransactionRequest = {
      description: data.description,
      amount: convertDisplayToCents(data.amount),
      occurredAt: formatDateForApi(data.occurredAt!),
      categoryId: data.categoryId,
      fromAccountId: data.fromAccountId,
      toAccountId: data.categoryType === 'Transfer' ? data.toAccountId : undefined,
      vendorId,
    };

    await updateTransaction(modalState.transaction!.id, payload);
  };

  return (
    <StateRenderer
      variant="page"
      isLocked={isLocked}
      lockMessage={t('states.locked.message.periodRequired')}
      lockAction={{ label: t('states.locked.configure'), to: '/periods' }}
      hasError={isError}
      errorMessage={t('transactions.tableView.error.load')}
      onRetry={onRetry}
      isLoading={isLoading}
      loadingSkeleton={<TransactionListSkeleton count={8} />}
      isEmpty={!transactions || transactions.length === 0}
      emptyItemsLabel={t('states.contract.items.transactions')}
      emptyMessage={t('states.empty.transactions.message')}
      emptyAction={
        insertEnabled && isMobile
          ? { label: t('states.empty.transactions.addTransaction'), onClick: openAdd }
          : undefined
      }
    >
      <Stack gap="md">
        <PageHeader
          batchMode={batchMode}
          onToggleBatch={() => setBatchMode((v) => !v)}
          onAdd={openAdd}
          insertEnabled={insertEnabled}
          onOpenMobileFilter={openMobileFilter}
        />

        {!isMobile && (
          <TransactionFilters
            filters={filters}
            onChange={onFiltersChange}
            accounts={accounts}
            categories={categories}
            vendors={vendors}
          />
        )}

        {isMobile ? (
          <>
            <Stack gap="xs">
              {transactions?.map((tx) => (
                <MobileTransactionCard key={tx.id} transaction={tx} />
              ))}
            </Stack>

            <Drawer
              opened={mobileFilterDrawer}
              onClose={closeMobileFilter}
              title={t('transactions.filters.title')}
              position="bottom"
              size="60%"
            >
              <TransactionFilters
                filters={filters}
                onChange={onFiltersChange}
                accounts={accounts}
                categories={categories}
                vendors={vendors}
              />
            </Drawer>

            <Affix position={{ bottom: 80, right: 20 }}>
              <Transition transition="slide-up" mounted={insertEnabled}>
                {(styles) => (
                  <ActionIcon color="blue" radius="xl" size={56} style={styles} onClick={openAdd} variant="filled">
                    <IconPlus size={24} />
                  </ActionIcon>
                )}
              </Transition>
            </Affix>
          </>
        ) : (
          <TransactionsLedger
            transactions={transactions ?? []}
            batchMode={batchMode}
            accounts={accounts}
            categories={categories}
            vendors={vendors}
            onSaveBatch={createTransaction}
            onEdit={openEdit}
            onDelete={deleteTransaction}
            isFetchingMore={isFetchingMore}
            hasNextPage={hasNextPage}
            onLoadMore={onLoadMore}
          />
        )}
      </Stack>

      <TransactionModal
        opened={modalState.open}
        onClose={closeModal}
        transaction={modalState.transaction}
        accounts={accounts}
        categories={categories}
        vendors={vendors}
        onSave={handleSaveEdit}
      />
    </StateRenderer>
  );
};
```

**Step 3: Commit**

```bash
git add src/components/Transactions/TransactionsPageView.tsx src/components/Transactions/PageHeader.tsx
git commit -m "feat(app): add TransactionsPageView replacing TransactionsTableView"
```

---

## Task 10: Frontend — Wire up container and page

**Files:**
- Modify: `piggy-pulse-app/src/components/Transactions/TransactionsTableContainer.tsx`
- Modify: `piggy-pulse-app/src/pages/Transactions.page.tsx`

**Step 1: Update `TransactionsTableContainer`**

Replace the current `TransactionsTableView` import and usage with `TransactionsPageView`. Add:
- `useState` for `filters`
- `useInfiniteTransactions` instead of receiving `transactions` as prop
- `useUpdateTransaction` mutation
- Pass `filters`, `onFiltersChange`, `updateTransaction`, `hasNextPage`, `isFetchingMore`, `onLoadMore`

Key changes:
```typescript
// Remove props: transactions, isLoading, isError, onRetry
// Add internally:
const [filters, setFilters] = useState<TransactionFilterParams>({ direction: 'all' });
const {
  data: infiniteData,
  isLoading: txLoading,
  isError: txError,
  refetch,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteTransactions(selectedPeriodId, filters);

const transactions = useMemo(
  () => infiniteData?.pages.flatMap((p) => p.transactions) ?? undefined,
  [infiniteData]
);

const updateMutation = useUpdateTransaction(selectedPeriodId);
```

Pass to `TransactionsPageView`:
```typescript
transactions={transactions}
isLoading={combinedLoading}
isError={combinedError}
onRetry={() => void refetch()}
filters={filters}
onFiltersChange={setFilters}
updateTransaction={(id, payload) => updateMutation.mutateAsync({ id, data: payload })}
hasNextPage={hasNextPage}
isFetchingMore={isFetchingNextPage}
onLoadMore={() => void fetchNextPage()}
```

**Step 2: Update `TransactionsTableProps`**

Remove `transactions`, `isLoading`, `isError`, `onRetry` from the external props interface (these are now internal). Keep `isLocked` and `insertEnabled`.

**Step 3: Update `Transactions.page.tsx`**

The page no longer calls `useTransactions` — remove that. Just render `TransactionsTable` (which is `TransactionsTableContainer`) with `isLocked` and `insertEnabled`:

```typescript
export function TransactionsPage() {
  const { t } = useTranslation();
  const { selectedPeriodId } = useBudgetPeriodSelection();

  return (
    <BasicAppShell>
      <Stack gap="md" w="100%">
        <TransactionsTable
          isLocked={selectedPeriodId === null}
          insertEnabled
        />
      </Stack>
    </BasicAppShell>
  );
}
```

**Step 4: Commit**

```bash
git add src/components/Transactions/TransactionsTableContainer.tsx src/pages/Transactions.page.tsx
git commit -m "feat(app): wire TransactionsPageView into container and page"
```

---

## Task 11: Frontend — Delete unused components

**Files to delete:**
- `src/components/Transactions/Table/TransactionsTableView.tsx`
- `src/components/Transactions/Table/TransactionsTableView.story.tsx`
- `src/components/Transactions/Table/TransactionFilters.tsx` (old)
- `src/components/Transactions/Table/TransactionRow.tsx`
- `src/components/Transactions/Table/TransactionRow.story.tsx`
- `src/components/Transactions/Table/TransactionGroup.tsx`
- `src/components/Transactions/Table/TransactionsSection.tsx`
- `src/components/Transactions/Table/TransactionsSection.story.tsx`
- `src/components/Transactions/List/TransactionList.tsx`
- `src/components/Transactions/List/TransactionList.story.tsx`
- `src/components/Transactions/List/MobileTransactionCardWithActions.tsx`

**Step 1: Delete files**

```bash
cd piggy-pulse-app
rm src/components/Transactions/Table/TransactionsTableView.tsx
rm src/components/Transactions/Table/TransactionsTableView.story.tsx
rm src/components/Transactions/Table/TransactionFilters.tsx
rm src/components/Transactions/Table/TransactionRow.tsx
rm src/components/Transactions/Table/TransactionRow.story.tsx
rm src/components/Transactions/Table/TransactionGroup.tsx
rm src/components/Transactions/Table/TransactionsSection.tsx
rm src/components/Transactions/Table/TransactionsSection.story.tsx
rm src/components/Transactions/List/TransactionList.tsx
rm src/components/Transactions/List/TransactionList.story.tsx
rm src/components/Transactions/List/MobileTransactionCardWithActions.tsx
```

**Step 2: Update barrel exports**

Update `src/components/Transactions/Table/index.ts` and `src/components/Transactions/List/index.ts` — remove exports for deleted components.

Update `src/components/Transactions/index.ts` — remove `TransactionsTableView`, `TransactionRow`, `TransactionFilters` (old), `TransactionsSection`, `TransactionGroup`, `TransactionList`, `MobileTransactionCard` (if no longer exported from List).

**Step 3: Run TypeScript check**

```bash
cd piggy-pulse-app && yarn tsc --noEmit
```
Fix any remaining import errors.

**Step 4: Run tests**

```bash
cd piggy-pulse-app && yarn test
```

**Step 5: Commit**

```bash
git add -A
git commit -m "chore(app): remove unused transaction components after redesign"
```

---

## Task 12: Final verification

**Step 1: Run backend**

```bash
cd piggy-pulse-api && cargo test && cargo clippy --workspace --all-targets -- -D warnings && cargo fmt --check
```

**Step 2: Run frontend**

```bash
cd piggy-pulse-app && yarn test && yarn tsc --noEmit && yarn prettier:check
```

**Step 3: Smoke test in browser**

```bash
cd piggy-pulse-app && docker-compose up -d
```

Open http://localhost, log in as `demo@example.com / SuperSecurePassword2024xyz`, navigate to Transactions:
- [ ] Filters render, changing direction refetches
- [ ] "Add" opens modal, saves transaction
- [ ] Edit pencil opens modal pre-filled, saves changes
- [ ] "Enter Transactions" toggles batch row; Tab/Enter/Esc work
- [ ] Transfer category switches to From/To account fields
- [ ] Delete shows inline confirmation, no red styling
- [ ] Infinite scroll / "Load more" works

**Step 4: Final commit if needed**

```bash
git add -A && git commit -m "fix(app): post-redesign polish"
```
