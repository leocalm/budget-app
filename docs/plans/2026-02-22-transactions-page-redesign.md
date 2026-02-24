# Transactions Page Redesign
_Date: 2026-02-22_

## Scope

Redesign the global Transactions page only. The `AccountTransactions` component used on individual account pages is not touched.

---

## Component Map

### New components (under `piggy-pulse-app/src/components/Transactions/`)

| Component | Responsibility |
|---|---|
| `TransactionsPageView.tsx` | Top-level view replacing `TransactionsTableView`. Owns batch mode state and filter state. |
| `PageHeader.tsx` | Title + "Add" button + "Enter Transactions" / "Done" batch toggle. |
| `TransactionFilters.tsx` | Full redesign. Direction segmented control, Account/Category/Vendor MultiSelect, Date range pickers, "Clear all". Drives server-side query params. |
| `TransactionsLedger.tsx` | Date-grouped table. In batch mode, `BatchEntryRow` is pinned above the first group. |
| `BatchEntryRow.tsx` | Keyboard-optimized inline entry row. Sticky date + account. Transfer mode triggered by Transfer category. |
| `TransactionModal.tsx` | Shared modal for add and edit. Wraps `QuickAddTransaction` form logic. |

### Components to delete

- `TransactionsTableView.tsx` + story
- `TransactionFilters.tsx` (old) — replaced
- `TransactionList.tsx` + story
- `TransactionRow.tsx` + story
- `TransactionGroup.tsx`
- `TransactionsSection.tsx` + story
- `MobileTransactionCard.tsx`, `MobileTransactionCardWithActions.tsx` + stories

### Components retained unchanged

- `TransactionsTableContainer.tsx` — data layer (gains `updateTransaction` callback + filter state/callback)
- `Form/` — `QuickAddTransaction`, `TransactionFormFields`, `TransactionFormContext` reused
- `Stats/`, `AccountBadge`, `CategoryBadge`

---

## Data Flow

### State in `TransactionsPageView`

```
batchMode: boolean
filters: {
  accountIds: string[]
  categoryIds: string[]
  direction: 'all' | 'Incoming' | 'Outgoing' | 'Transfer'
  vendorIds: string[]
  dateFrom: string | null
  dateTo: string | null
}
modalState: { open: boolean, transaction: TransactionResponse | null }
```

### Infinite query

- `fetchTransactionsPage` gains a `filters` param serialized into query string
- Infinite query hook includes `filters` in the query key — filter change resets to page 1
- Filter state flows: `TransactionsPageView` → `TransactionsTableContainer` via callback or lifted state

### Container changes

- Add `useUpdateTransaction` hook, pass `updateTransaction` down
- Accept `filters` + `onFiltersChange` props (or lift filter state into container)

---

## Backend Changes (`piggy-pulse-api`)

### New query params on `GET /api/v1/transactions/`

| Param | Type | Notes |
|---|---|---|
| `account_id` | UUID (repeatable) | Filters by `from_account_id` |
| `category_id` | UUID (repeatable) | |
| `direction` | `Incoming` \| `Outgoing` \| `Transfer` | |
| `vendor_id` | UUID (repeatable) | |
| `date_from` | `YYYY-MM-DD` | |
| `date_to` | `YYYY-MM-DD` | |

### DB layer

- New `TransactionFilters` struct alongside `CursorParams`
- `build_transaction_query` updated to accept dynamic WHERE fragments
- `list_transactions` and `get_transactions_for_period` gain optional `TransactionFilters` argument
- Rocket route `list_all_transactions` gains new query params and passes filters through

---

## Batch Entry Mode

- Desktop only
- "Enter Transactions" / "Done" toggle in page header
- `BatchEntryRow` pinned above first date group
- Field order: Date | Notes | Category | Account | Vendor | Amount | Save
- Keyboard: Tab navigates, Enter on last field saves, Esc clears (preserves sticky date + account)
- After save: category + vendor reset, focus returns to Category
- Transfer mode: selecting a Transfer category hides Vendor, shows To Account

---

## Transaction Modal

- Single modal for add (empty) and edit (pre-filled)
- Opened by "Add" button or row pencil icon
- Reuses `QuickAddTransaction` form logic
- Titles: "Add Transaction" / "Edit Transaction"
- Esc or backdrop click closes

---

## Delete

- Neutral inline confirmation row (no red styling, no modal)
- "Confirm" and "Cancel" text buttons

---

## Mobile

- Card list grouped by date with date headers
- FAB opens `TransactionModal` as bottom drawer
- No batch mode
- Filters behind a "Filter" button → bottom sheet

---

## Ledger Display Rules

- Date descending, grouped by date
- Columns (global view): Date | Notes | Category | Account | Vendor | Amount | Actions
- Transfers: arrow indicator in Account column; no vendor shown
- Amount: always positive input; display with `+` (Incoming) or `−` (Outgoing); no dramatic red styling
