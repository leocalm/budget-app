# Period Management Page Visual Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the `/periods` page and related period modals to match the approved wireframes while preserving all existing behavior and logic.

**Architecture:** Keep the current route, hooks, and mutation handlers untouched, and refactor only presentational structure/styles in `PeriodsPage`, `PeriodCard`, and modal markup/CSS. Preserve current event handlers and validation paths exactly, with UI-level test updates to protect against regressions.

**Tech Stack:** React 19, TypeScript, Mantine v8, CSS Modules, Vitest + Testing Library, react-i18next.

---

### Task 1: Lock visual-only regression expectations for page sections

**Files:**
- Modify: `src/components/Periods/PeriodsPage.test.tsx`
- Test: `src/components/Periods/PeriodsPage.test.tsx`

**Step 1: Write the failing test**

Add tests that assert the redesigned section hierarchy renders:
```tsx
it('renders redesigned sections with current/schedule/upcoming/past structure', () => {
  // Arrange mocked periods + schedule
  render(<PeriodsPage />);

  expect(screen.getByRole('heading', { name: /Periods/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Create Period/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Edit Schedule/i })).toBeInTheDocument();
  expect(screen.getByText(/Current Period/i)).toBeInTheDocument();
  expect(screen.getByText(/Schedule/i)).toBeInTheDocument();
  expect(screen.getByText(/Upcoming Periods/i)).toBeInTheDocument();
  expect(screen.getByText(/Past Periods/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `yarn vitest src/components/Periods/PeriodsPage.test.tsx`
Expected: FAIL for missing/changed structure assertions.

**Step 3: Commit test-only change**

```bash
git add src/components/Periods/PeriodsPage.test.tsx
git commit -m "test(periods): capture redesigned periods page section hierarchy"
```

### Task 2: Refactor periods page layout to wireframe hierarchy (behavior unchanged)

**Files:**
- Modify: `src/components/Periods/PeriodsPage.tsx`
- Modify: `src/components/Periods/PeriodsPage.module.css`
- Test: `src/components/Periods/PeriodsPage.test.tsx`

**Step 1: Write minimal implementation**

Restructure JSX into wireframe visual blocks while keeping handlers and hook logic intact:
```tsx
<Stack className={classes.pageRoot}>
  <Group justify="space-between" className={classes.headerRow}>{/* title + actions */}</Group>

  {isEmpty ? (
    <Paper className={classes.emptyState}>{/* empty CTAs */}</Paper>
  ) : (
    <>
      <section className={classes.currentSection}>{/* current card */}</section>
      <section className={classes.scheduleSection}>{/* schedule card */}</section>
      <section className={classes.upcomingSection}>{/* compact upcoming list */}</section>
      <section className={classes.pastSection}>{/* collapsible past list */}</section>
    </>
  )}
</Stack>
```
Do not change: period grouping, mutations, modal state, gap resolution behavior, toasts.

**Step 2: Update CSS modules for wireframe look**

Add/adjust classes for:
- header actions alignment
- emphasized current card border/background
- compact list rows for upcoming/past
- empty panel with dual CTAs
- responsive stacking for mobile

**Step 3: Run tests to verify**

Run: `yarn vitest src/components/Periods/PeriodsPage.test.tsx`
Expected: PASS.

**Step 4: Commit**

```bash
git add src/components/Periods/PeriodsPage.tsx src/components/Periods/PeriodsPage.module.css src/components/Periods/PeriodsPage.test.tsx
git commit -m "feat(periods): apply wireframe layout to periods page"
```

### Task 3: Restyle period cards into compact row/card variants without logic changes

**Files:**
- Modify: `src/components/Periods/PeriodCard.tsx`
- Modify: `src/components/Periods/PeriodsPage.module.css`
- Test: `src/components/Periods/PeriodsPage.test.tsx`

**Step 1: Write/adjust failing test for card affordances**

Add assertions for retained actions and new visual labels:
```tsx
expect(screen.getAllByRole('button', { name: /View/i }).length).toBeGreaterThan(0);
expect(screen.getByText(/Auto-generated/i)).toBeInTheDocument();
```

**Step 2: Run test to verify it fails**

Run: `yarn vitest src/components/Periods/PeriodsPage.test.tsx`
Expected: FAIL on label/action mismatch.

**Step 3: Write minimal implementation**

Adjust `PeriodCard` markup/classes for wireframe row density and labels while preserving callbacks:
```tsx
<ActionIcon onClick={() => onEdit(period)} disabled={isLocked} />
<ActionIcon onClick={() => onDelete(period)} disabled={isLocked} />
```
No behavior changes in computed status/meta.

**Step 4: Run test to verify it passes**

Run: `yarn vitest src/components/Periods/PeriodsPage.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/Periods/PeriodCard.tsx src/components/Periods/PeriodsPage.module.css src/components/Periods/PeriodsPage.test.tsx
git commit -m "style(periods): align period cards with redesigned visual hierarchy"
```

### Task 4: Restyle create/edit period modal presentation only

**Files:**
- Modify: `src/components/Periods/PeriodFormModal.tsx`
- Modify: `src/components/Periods/PeriodFormModal.module.css`
- Test: `src/components/Periods/PeriodFormModal.test.tsx`

**Step 1: Write the failing test**

Add test assertions for wireframe-facing UI text/layout cues while keeping existing behavior checks:
```tsx
expect(screen.getByRole('heading', { name: /Create Period/i })).toBeInTheDocument();
expect(screen.getByText(/period boundaries are structural/i)).toBeInTheDocument();
```

**Step 2: Run test to verify it fails**

Run: `yarn vitest src/components/Periods/PeriodFormModal.test.tsx`
Expected: FAIL on missing helper copy/structure.

**Step 3: Write minimal implementation**

Reorder visible fields/layout and helper note to match wireframe, but keep full existing field logic and validation paths.

**Step 4: Run test to verify it passes**

Run: `yarn vitest src/components/Periods/PeriodFormModal.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/Periods/PeriodFormModal.tsx src/components/Periods/PeriodFormModal.module.css src/components/Periods/PeriodFormModal.test.tsx
git commit -m "style(periods): restyle period form modal to match wireframe"
```

### Task 5: Restyle schedule modal presentation only

**Files:**
- Modify: `src/components/Periods/ScheduleSettingsModal.tsx`
- Modify: `src/components/Periods/ScheduleSettingsModal.module.css`
- Test: `src/components/Periods/ScheduleSettingsModal.test.tsx`

**Step 1: Write the failing test**

Add assertions for layout/copy hierarchy (mode/start day/duration/generate ahead/weekend rule/name pattern and policy note).

**Step 2: Run test to verify it fails**

Run: `yarn vitest src/components/Periods/ScheduleSettingsModal.test.tsx`
Expected: FAIL on missing/relocated visual sections.

**Step 3: Write minimal implementation**

Update modal structure/styling only; keep save/update/disable logic, mode semantics, and payload generation unchanged.

**Step 4: Run test to verify it passes**

Run: `yarn vitest src/components/Periods/ScheduleSettingsModal.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/Periods/ScheduleSettingsModal.tsx src/components/Periods/ScheduleSettingsModal.module.css src/components/Periods/ScheduleSettingsModal.test.tsx
git commit -m "style(periods): restyle schedule settings modal"
```

### Task 6: Full verification and documentation touch-up

**Files:**
- Modify (if needed): `src/locales/en.json`
- Modify (if needed): `src/locales/pt.json`
- Verify: `src/components/Periods/*`

**Step 1: Add only required translation keys**

If any new wireframe-aligned labels were introduced, add mirrored keys in both locales.

**Step 2: Run targeted quality checks**

Run:
- `yarn vitest src/components/Periods/PeriodsPage.test.tsx src/components/Periods/PeriodFormModal.test.tsx src/components/Periods/ScheduleSettingsModal.test.tsx`
- `yarn typecheck`
- `yarn lint`

Expected: PASS.

**Step 3: Run full suite gate**

Run: `yarn test`
Expected: PASS.

**Step 4: Commit final polish**

```bash
git add src/components/Periods src/locales/en.json src/locales/pt.json
git commit -m "chore(periods): finalize visual redesign verification"
```
