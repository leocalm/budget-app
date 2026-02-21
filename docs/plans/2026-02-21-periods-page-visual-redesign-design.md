# Period Management Page Visual Redesign (Design)

Date: 2026-02-21
Scope: `piggy-pulse-app` `/periods`
Status: Approved

## 1. Objective

Implement the new period management page visuals from the provided wireframes while preserving all existing functionality and behavior.

This is a visual redesign only:
- Keep all current logic, data flows, validations, and API interactions intact.
- Keep modal functionality untouched, including full existing fields and semantics.
- Apply redesign to both desktop and mobile.

## 2. Constraints and Decisions

Confirmed decisions:
- Keep current capabilities and behavior parity.
- Redesign applies to desktop and mobile now.
- Do not include state-toggle chips (`Default/Empty/Loading/Error`) in production UI.
- Keep current modal logic because it is more complete.

Non-goals:
- No API or schema changes.
- No feature removals.
- No behavior simplification.

## 3. Approach

Chosen approach: in-place refactor of existing periods components.

Rationale:
- Lowest regression risk.
- Reuses existing tested hooks and mutation paths.
- Fastest route to wireframe alignment.

Alternatives considered:
- New V2 page and swap route later.
- Controller/presentation split first, then rebuild UI.

## 4. Architecture and Component Boundaries

Route remains unchanged:
- `src/Router.tsx` keeps `/periods` pointing to the same feature entry.

Data/mutation layer remains unchanged:
- `useBudgetPeriods`
- `useBudgetPeriodSchedule`
- `useBudgetPeriodGaps`
- `useCreateBudgetPeriod`
- `useUpdateBudgetPeriod`
- `useDeleteBudgetPeriod`
- `useCreateBudgetPeriodSchedule`
- `useUpdateBudgetPeriodSchedule`
- `useDeleteBudgetPeriodSchedule`

UI composition in `PeriodsPage` will be reorganized to match wireframe hierarchy:
- Header: page title/subtitle + primary actions (`Create Period`, `Edit Schedule`).
- Current period block: emphasized card with existing data/actions.
- Schedule block: configured/not-configured state card.
- Upcoming periods block: compact rows/list.
- Past periods block: collapsible list, default collapsed.
- Empty state block: no-periods message with two CTAs.
- Gap alert block: retained with existing functionality.

## 5. Behavioral Mapping (No Behavior Changes)

All existing behavior must remain intact:
- Grouping and sorting (current/upcoming/past) remains unchanged.
- Gap detection and resolution flows remain unchanged.
- Schedule enable/edit/disable flows remain unchanged.
- Create/edit/delete period flows remain unchanged.
- Existing routing targets and mutation side effects remain unchanged.

State handling remains equivalent:
- Loading state remains supported.
- Error handling remains supported.
- Empty state gets new visual treatment only.

## 6. Modal Strategy

`PeriodFormModal` and `ScheduleSettingsModal` keep full existing logic.

Allowed changes:
- Visual styling and layout arrangement.
- Typographic hierarchy and spacing.
- CTA placement and emphasis.

Disallowed changes:
- Field set changes that alter behavior.
- Validation rule changes.
- Submission payload changes.
- Mode semantics changes.

## 7. Responsive Design

Desktop and mobile both receive the new visual hierarchy.

Responsive expectations:
- Action area stacks cleanly on mobile.
- Cards and list rows preserve readability and tap targets.
- Past-period collapse control remains clear on smaller screens.

## 8. Testing Strategy

Update tests to reflect visual structure while preserving behavior assertions:
- `src/components/Periods/PeriodsPage.test.tsx`
- `src/components/Periods/PeriodFormModal.test.tsx` (only where visual structure assertions are impacted)
- `src/components/Periods/ScheduleSettingsModal.test.tsx` (only where visual structure assertions are impacted)

Test intent:
- Confirm required sections render in expected states.
- Confirm existing critical behavior still works (no functional regression).
- Confirm mobile/desktop render pathways are intact where already covered.

## 9. Delivery Notes

Implementation will prioritize minimal-diff logic changes:
- Prefer CSS/module and JSX structure changes.
- Keep hook calls and handlers stable.
- Avoid unnecessary refactors during visual pass.
