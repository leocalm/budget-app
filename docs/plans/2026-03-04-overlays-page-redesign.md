# Overlays Page Visual Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign `OverlayCard` and `OverlaysPage` to match the design language of the recently redesigned `PeriodsPage`, including section containers, page padding, header row, card accent lines, and a structured 3-zone card layout.

**Architecture:** In-place refactor of 4 files — two TSX components and two CSS modules. No API, schema, hook, or behavioral changes. All mutations and callback props remain untouched.

**Tech Stack:** React 19, TypeScript, Mantine v8 (`Card`, `Progress`, `Paper`, `Group`, `Stack`, `Text`, `Badge`), CSS Modules, react-i18next, dayjs.

**Branch:** `feat/overlays-page-redesign` (already created)

---

### Task 1: Add missing i18n key `overlays.card.of`

The progress zone needs `overlays.card.of` (e.g. "of €800") in both locale files.

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/pt.json`

**Step 1: Add to `en.json`**

In `src/locales/en.json`, inside `"overlays" > "card"`, after the `"remaining"` line, add:

```json
"of": "of {{cap}}",
```

The `card` block should look like:

```json
"card": {
  "duration_one": "{{count}} day",
  "duration_other": "{{count}} days",
  "daysRemaining_one": "{{count}} day left",
  "daysRemaining_other": "{{count}} days left",
  "startsIn_one": "Starts in {{count}} day",
  "startsIn_other": "Starts in {{count}} days",
  "endedAgo_one": "Ended {{count}} day ago",
  "endedAgo_other": "Ended {{count}} days ago",
  "of": "of {{cap}}",
  "remaining": "{{amount}} remaining",
  "overBy": "{{amount}} over cap",
  "transactions_one": "{{count}} transaction",
  "transactions_other": "{{count}} transactions",
  "categoryCaps_one": "{{count}} category cap",
  "categoryCaps_other": "{{count}} category caps"
},
```

**Step 2: Add to `pt.json`**

Find the `overlays.card` block in `src/locales/pt.json` and add the same key with Portuguese translation:

```json
"of": "de {{cap}}",
```

**Step 3: Run typecheck**

```bash
yarn typecheck
```

Expected: no errors.

**Step 4: Commit**

```bash
git add src/locales/en.json src/locales/pt.json
git commit -m "feat(overlays): add i18n key for progress cap label"
```

---

### Task 2: Redesign `OverlayCard.module.css`

Replace the entire file with the new styles that add the `::before` accent line, `.past` opacity, `.footer` border, and update the `.active` gradient to purple/cyan.

**Files:**
- Modify: `src/components/Overlays/OverlayCard.module.css`

**Step 1: Replace file contents**

```css
.card {
  border-color: var(--border-subtle);
  background: var(--bg-card);
  position: relative;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, rgb(180, 122, 255), rgb(0, 212, 255));
  border-radius: 4px 4px 0 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  border-color: var(--border-medium);
  box-shadow: var(--shadow-sm);
}

.card:hover::before {
  opacity: 1;
}

.active {
  border-color: rgb(180, 122, 255, 0.35);
  background: linear-gradient(135deg, rgb(180, 122, 255, 0.08) 0%, rgb(0, 212, 255, 0.08) 100%);
}

.active::before {
  opacity: 1;
}

.overspent {
  border-color: rgb(255, 107, 157, 0.42);
}

.overspent::before {
  background: linear-gradient(90deg, rgb(255, 107, 157), rgb(255, 169, 64));
  opacity: 1;
}

.past {
  opacity: 0.7;
}

.mainInfo {
  min-width: 0;
  flex: 1;
}

.icon {
  font-size: 20px;
  line-height: 1;
}

.name {
  font-size: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.metaRow {
  overflow: hidden;
}

.metaRow :global(.mantine-Text-root) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.amount {
  font-family: var(--mantine-font-family-monospace);
  font-size: 20px;
  font-weight: 700;
}

.footer {
  border-top: 1px solid var(--border-subtle);
  padding-top: 10px;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .name {
    max-width: 180px;
  }
}
```

**Step 2: Run lint**

```bash
yarn stylelint
```

Expected: passes.

---

### Task 3: Redesign `OverlayCard.tsx`

Restructure into 3 zones: header, progress (conditional), footer. Switch `Paper` → `Card`. Add `IconClock`. Replace `IconTrendingUp`. Reformat progress zone into separate amount row + bar + label. Move badges to footer.

**Files:**
- Modify: `src/components/Overlays/OverlayCard.tsx`

**Step 1: Replace file contents**

```tsx
import dayjs from 'dayjs';
import {
  IconCalendarEvent,
  IconClock,
  IconEdit,
  IconEye,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Badge, Card, Group, Progress, Stack, Text } from '@mantine/core';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { Overlay } from '@/types/overlay';
import { formatCurrency } from '@/utils/currency';
import classes from './OverlayCard.module.css';

export type OverlayCardStatus = 'active' | 'upcoming' | 'past';

interface OverlayCardProps {
  overlay: Overlay;
  status: OverlayCardStatus;
  onEdit?: (overlay: Overlay) => void;
  onDelete?: (overlay: Overlay) => void;
  onView?: (overlay: Overlay) => void;
}

const getStatusColor = (status: OverlayCardStatus): string => {
  if (status === 'active') {
    return 'green';
  }

  if (status === 'upcoming') {
    return 'cyan';
  }

  return 'gray';
};

export function OverlayCard({ overlay, status, onEdit, onDelete, onView }: OverlayCardProps) {
  const { t, i18n } = useTranslation();
  const globalCurrency = useDisplayCurrency();
  const now = dayjs().startOf('day');
  const start = dayjs(overlay.startDate).startOf('day');
  const end = dayjs(overlay.endDate).startOf('day');

  const format = (cents: number) => formatCurrency(cents, globalCurrency, i18n.language);

  const icon = overlay.icon?.trim() || '🎯';
  const durationDays = Math.max(end.diff(start, 'day') + 1, 1);
  const spentAmount = overlay.spentAmount ?? 0;
  const totalCapAmount = overlay.totalCapAmount ?? null;
  const transactionCount = overlay.transactionCount ?? 0;

  const spentPercentage =
    totalCapAmount && totalCapAmount > 0 ? Math.round((spentAmount / totalCapAmount) * 100) : 0;
  const progressValue = Math.min(100, Math.max(0, spentPercentage));
  const isOverCap = Boolean(totalCapAmount && spentAmount > totalCapAmount);

  const timingLabel =
    status === 'active'
      ? t('overlays.card.daysRemaining', { count: Math.max(end.diff(now, 'day') + 1, 0) })
      : status === 'upcoming'
        ? t('overlays.card.startsIn', { count: Math.max(start.diff(now, 'day'), 0) })
        : t('overlays.card.endedAgo', { count: Math.max(now.diff(end, 'day'), 0) });

  const inclusionModeLabel = t(`overlays.modes.${overlay.inclusionMode}`);

  return (
    <Card
      withBorder
      radius="lg"
      className={`${classes.card} ${status === 'active' ? classes.active : ''} ${isOverCap ? classes.overspent : ''} ${status === 'past' ? classes.past : ''}`}
    >
      {/* Zone 1: Header */}
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md" mb="sm">
        <Stack gap={4} className={classes.mainInfo}>
          <Group gap="xs" wrap="nowrap">
            <Text className={classes.icon} aria-hidden="true">
              {icon}
            </Text>
            <Text fw={700} className={classes.name}>
              {overlay.name}
            </Text>
          </Group>

          <Group gap="xs" c="dimmed" className={classes.metaRow}>
            <IconCalendarEvent size={14} />
            <Text size="sm">
              {dayjs(overlay.startDate).format('MMM D')} – {dayjs(overlay.endDate).format('MMM D')}{' '}
              · {t('overlays.card.duration', { count: durationDays })}
            </Text>
          </Group>
        </Stack>

        <Group gap={6} wrap="nowrap">
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => onView?.(overlay)}
            aria-label={t('overlays.actions.view')}
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => onEdit?.(overlay)}
            aria-label={t('overlays.actions.edit')}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => onDelete?.(overlay)}
            aria-label={t('overlays.actions.delete')}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>

      {/* Zone 2: Progress (only when totalCapAmount exists) */}
      {totalCapAmount !== null && (
        <Stack gap={4} mb="sm">
          <Group justify="space-between" align="baseline">
            <Text className={classes.amount}>{format(spentAmount)}</Text>
            <Text size="xs" c="dimmed">
              {t('overlays.card.of', { cap: format(totalCapAmount) })}
            </Text>
          </Group>
          <Progress value={progressValue} color={isOverCap ? 'red' : 'violet'} size="sm" radius="xl" />
          <Text size="xs" c={isOverCap ? 'red' : 'dimmed'}>
            {isOverCap
              ? t('overlays.card.overBy', { amount: format(spentAmount - totalCapAmount) })
              : t('overlays.card.remaining', { amount: format(totalCapAmount - spentAmount) })}
          </Text>
        </Stack>
      )}

      {/* Zone 3: Footer */}
      <Group className={classes.footer} justify="space-between" align="center">
        <Group gap={6}>
          <IconClock size={14} />
          <Text size="sm" c="dimmed">
            {timingLabel}
          </Text>
        </Group>
        <Group gap="xs">
          <Badge variant="light" color={getStatusColor(status)} size="sm">
            {t(`overlays.status.${status}`)}
          </Badge>
          <Badge variant="light" size="sm">
            {t('overlays.card.transactions', { count: transactionCount })}
          </Badge>
          <Badge variant="outline" color="gray" size="sm">
            {inclusionModeLabel}
          </Badge>
        </Group>
      </Group>
    </Card>
  );
}
```

**Step 2: Run tests and typecheck**

```bash
yarn typecheck && yarn vitest run src/components/Overlays
```

Expected: all pass.

**Step 3: Commit**

```bash
git add src/components/Overlays/OverlayCard.tsx src/components/Overlays/OverlayCard.module.css
git commit -m "feat(overlays): redesign OverlayCard with accent line, progress zone, footer meta row"
```

---

### Task 4: Redesign `OverlaysPage.module.css`

Replace the entire file with the PeriodsPage-aligned CSS: page padding, header row, section containers, active section gradient.

**Files:**
- Modify: `src/components/Overlays/OverlaysPage.module.css`

**Step 1: Replace file contents**

```css
.pageRoot {
  margin: 0 auto;
  max-width: 1080px;
  padding: 24px;
  position: relative;
}

.headerRow {
  align-items: flex-start;
}

.loadingState {
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 280px;
}

.section {
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  background: var(--bg-card);
  padding: 20px;
}

.activeSection {
  background: linear-gradient(180deg, rgb(180, 122, 255, 0.05), transparent 45%);
  border-color: rgb(180, 122, 255, 0.3);
}

.emptyState {
  border-style: dashed;
  border-color: var(--border-medium);
}

.emptyIcon {
  color: var(--text-secondary);
}

.fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 40;
  box-shadow: var(--shadow-md);
}

@media (max-width: 768px) {
  .pageRoot {
    padding: 12px;
  }

  .headerRow {
    align-items: stretch;
    flex-direction: column;
  }

  .section {
    padding: 14px;
  }

  .fab {
    right: 16px;
    bottom: 96px;
  }
}
```

**Step 2: Run lint**

```bash
yarn stylelint
```

Expected: passes.

---

### Task 5: Redesign `OverlaysPage.tsx`

Update the JSX to use the new layout: header row with inline create button, `Paper` section containers with styled headings, and updated loading state.

**Files:**
- Modify: `src/components/Overlays/OverlaysPage.tsx`

**Step 1: Replace the return value (lines 122–265 approx) with the new JSX**

The imports change: remove `Loader`, `Title`; add nothing new (all Mantine components already imported, or swap as needed).

New import line for Mantine:

```tsx
import { Badge, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
```

New loading state (replace the current `if (isLoading)` block):

```tsx
if (isLoading) {
  return (
    <div className={classes.loadingState}>
      <Loader size="sm" />
    </div>
  );
}
```

Wait — `Loader` stays. Keep `Loader` in the Mantine import. The only removal is the `Loader` in the loading block stays the same; only its container changes to use `classes.loadingState` (which now has `min-height: 280px`). No import change needed.

New return JSX:

```tsx
return (
  <Stack gap="xl" className={classes.pageRoot}>
    {/* Header */}
    <Group justify="space-between" align="flex-start" className={classes.headerRow}>
      <Stack gap={4}>
        <Title order={1}>{t('overlays.page.title')}</Title>
        <Text c="dimmed">{t('overlays.page.description')}</Text>
      </Stack>
      <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
        {t('overlays.createOverlay')}
      </Button>
    </Group>

    {overlays.length === 0 ? (
      <Paper withBorder radius="lg" p="xl" className={classes.emptyState}>
        <Stack align="center" gap="sm">
          <IconTargetArrow size={36} className={classes.emptyIcon} />
          <Title order={3}>{t('overlays.empty.title')}</Title>
          <Text c="dimmed" ta="center" maw={560}>
            {t('overlays.empty.description')}
          </Text>
        </Stack>
      </Paper>
    ) : (
      <>
        {/* Active section */}
        <Paper
          withBorder
          radius="lg"
          p="lg"
          className={`${classes.section} ${classes.activeSection}`}
        >
          <Group justify="space-between" align="center" mb="md">
            <Text fw={600} tt="uppercase" size="xs" c="dimmed">
              {t('overlays.sections.active')}
            </Text>
            <Badge variant="light" color="violet" size="sm">
              {groupedOverlays.active.length}
            </Badge>
          </Group>

          <Stack gap="md">
            {groupedOverlays.active.length > 0 ? (
              groupedOverlays.active.map((overlay) => (
                <OverlayCard
                  key={overlay.id}
                  overlay={overlay}
                  status="active"
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onView={showDetailNotReady}
                />
              ))
            ) : (
              <Text c="dimmed" size="sm">
                {t('overlays.empty.active')}
              </Text>
            )}
          </Stack>
        </Paper>

        {/* Upcoming section */}
        <Paper withBorder radius="lg" p="lg" className={classes.section}>
          <Group justify="space-between" align="center" mb="md">
            <Text fw={600} tt="uppercase" size="xs" c="dimmed">
              {t('overlays.sections.upcoming')}
            </Text>
            <Badge variant="light" color="cyan" size="sm">
              {groupedOverlays.upcoming.length}
            </Badge>
          </Group>

          <Stack gap="md">
            {groupedOverlays.upcoming.length > 0 ? (
              groupedOverlays.upcoming.map((overlay) => (
                <OverlayCard
                  key={overlay.id}
                  overlay={overlay}
                  status="upcoming"
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onView={showDetailNotReady}
                />
              ))
            ) : (
              <Text c="dimmed" size="sm">
                {t('overlays.empty.upcoming')}
              </Text>
            )}
          </Stack>
        </Paper>

        {/* Past section */}
        <Paper withBorder radius="lg" p="lg" className={classes.section}>
          <Group justify="space-between" align="center" mb={isPastOpen ? 'md' : 0}>
            <Text fw={600} tt="uppercase" size="xs" c="dimmed">
              {t('overlays.sections.past')}
            </Text>
            <Group gap="xs">
              <Badge variant="light" color="gray" size="sm">
                {groupedOverlays.past.length}
              </Badge>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={() => setIsPastOpen((current) => !current)}
                aria-label={t('overlays.actions.togglePast')}
              >
                {isPastOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              </ActionIcon>
            </Group>
          </Group>

          {isPastOpen && (
            <Stack gap="md">
              {groupedOverlays.past.length > 0 ? (
                groupedOverlays.past.map((overlay) => (
                  <OverlayCard
                    key={overlay.id}
                    overlay={overlay}
                    status="past"
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    onView={showDetailNotReady}
                  />
                ))
              ) : (
                <Text c="dimmed" size="sm">
                  {t('overlays.empty.past')}
                </Text>
              )}
            </Stack>
          )}
        </Paper>
      </>
    )}

    {/* FAB */}
    <Button
      className={classes.fab}
      radius="xl"
      size="lg"
      leftSection={<IconPlus size={16} />}
      onClick={openCreateModal}
    >
      {t('overlays.createOverlay')}
    </Button>

    <OverlayFormModal
      opened={isFormOpen}
      onClose={closeFormModal}
      overlay={editingOverlay}
      categories={categories}
      vendors={vendors}
      accounts={accounts}
    />

    <ConfirmDialog
      opened={Boolean(overlayPendingDelete)}
      onClose={() => setOverlayPendingDelete(null)}
      title={t('overlays.actions.delete')}
      impact={t('overlays.confirmDeleteImpact', {
        name: overlayPendingDelete?.name ?? '',
      })}
      safeActionLabel={t('common.cancel')}
      actionLabel={t('overlays.actions.delete')}
      onAction={confirmDelete}
      actionLoading={deleteOverlayMutation.isPending}
    />
  </Stack>
);
```

**Note on Mantine imports:** After the changes, `Loader` is still used (unchanged loading state), so keep it. Remove `Title` only if it becomes unused — but `Title order={1}` and `Title order={3}` are still used in the empty state. Keep `Title`. The full Mantine import line is:

```tsx
import { ActionIcon, Badge, Button, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core';
```

**Step 2: Run full test suite**

```bash
yarn typecheck && yarn vitest run src/components/Overlays
```

Expected: all tests pass. The existing tests check for text content (`'No overlays yet'`) and aria-labels (`'Delete overlay'`) — both are preserved in the new JSX.

**Step 3: Run full lint**

```bash
yarn prettier && yarn lint
```

Expected: passes. If prettier flags anything, run `yarn prettier:write` first.

**Step 4: Commit**

```bash
git add src/components/Overlays/OverlaysPage.tsx src/components/Overlays/OverlaysPage.module.css
git commit -m "feat(overlays): redesign OverlaysPage layout with section containers and header row"
```

---

### Task 6: Final verification and PR

**Step 1: Run the full test suite**

```bash
yarn test
```

Expected: typecheck, prettier, lint, vitest all pass. Build succeeds.

**Step 2: Visual smoke test (optional but recommended)**

```bash
yarn storybook
```

Navigate to `OverlayCard` stories and verify: accent line visible on active cards, gradient background, progress zone visible when cap exists, footer meta row with badges.

**Step 3: Push and open draft PR**

```bash
git push -u origin feat/overlays-page-redesign
gh pr create \
  --title "feat(overlays): redesign overlays page to match new design language" \
  --body "$(cat <<'EOF'
## Summary

- Redesigns `OverlayCard` with 3-zone layout: header (icon/name/dates + actions), progress zone (amount + bar + remaining label, conditional on cap), and footer meta row (timing label + badges)
- Adds CSS `::before` accent gradient line on cards (purple→cyan for active, pink→orange for overspent)
- Past cards rendered at 70% opacity
- Redesigns `OverlaysPage` with PeriodsPage-aligned layout: `padding: 24px`, header row with inline create button, bordered section containers, active section with purple/cyan gradient background, uppercase section labels

## Test plan

- [ ] Run `yarn test` — all checks pass
- [ ] Visually verify active overlay card shows gradient accent line and purple/cyan background
- [ ] Verify progress zone appears only when overlay has a total cap
- [ ] Verify past cards are slightly dimmed
- [ ] Verify page header shows create button aligned right on desktop
- [ ] Verify responsive layout stacks header on mobile
- [ ] Verify past section collapse toggle still works
EOF
)" \
  --draft
```
