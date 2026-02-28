# PiggyPulse — PM Validation Findings

> Validation against `designs/v1` canonical specs.
> Each issue has a severity, status, and the page it belongs to.
>
> **Severity:** 🔴 High · 🟠 Medium · 🟡 Low
> **Status:** `open` · `in-progress` · `resolved` · `withdrawn`

---

## Dashboard

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| D-01 | Progress bar missing inside the Current Period card | 🔴 High | resolved |
| D-02 | Missing "Scope: All accounts" chip in topbar (left of period selector) | 🟠 Medium | open |
| D-03 | Card order swapped — live shows Net Position left / Budget Stability right; design is the reverse | 🟠 Medium | open |
| D-04 | Net Position card missing "Last updated Xh ago" line | 🟡 Low | open |
| D-05 | Hero amounts display trailing `.00` (e.g. `€884.00`) — design uses clean values (e.g. `€884`) | 🟠 Medium | resolved |
| D-06 | Edge case: no budget configured — Current Period card has no null state ("of €0.00" or empty) | 🟠 Medium | open |
| D-07 | Edge case: Budget Stability with only 2 closed periods — copy reads oddly, no minimum-data state | 🟡 Low | open |
| D-08 | Mobile bottom nav + period drawer — cannot verify via browser, needs real device testing | 🟠 Medium | resolved |

---

## Transactions

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| T-01 | **Desktop only** — Quick Add modal fields truncated to single letters (C, A, V), inline row too narrow to be usable. Mobile drawer works correctly with full-width stacked fields | 🔴 High | open |
| T-02 | Batch entry "Done" button renders raw i18n key `states.done` instead of "Done" | 🔴 High | resolved |
| T-03 | Date format is ISO (`2026-02-13`) — design uses readable short format (`Feb 15`) | 🔴 High | resolved |
| T-04 | Amount missing explicit +/− sign — spec requires all amounts show directional sign | 🔴 High | resolved |
| T-05 | Page subtitle present in live but absent in design | 🟠 Medium | resolved |
| T-06 | Scope dropdown missing from page header — design has inline "All accounts" scope selector next to title | 🟠 Medium | open |
| T-07 | Single-account table variant not implemented — Running Balance column never appears when filtered to one account | 🟠 Medium | open |
| T-08 | Direction filter tab (All / Incoming / Outgoing / Transfers) not in design; filter label names differ ("Accounts" vs "Account") | 🟠 Medium | resolved |
| T-09 | Batch entry row has checkmark icon instead of "Save" button | 🟠 Medium | resolved |
| T-10 | Batch entry "Done" button uses wrong style (primary filled vs secondary outline) | 🟠 Medium | resolved |
| T-11 | Allowance spending badge missing from transaction rows | 🟠 Medium | open |
| T-12 | Transfer rows missing directional arrow indicator (→ / ←) | 🟠 Medium | open |
| T-13 | ~~Delete uses icon only~~ — inline confirmation row IS implemented | 🟠 Medium | withdrawn |
| T-14 | Vendor filter missing "(optional)" hint label | 🟡 Low | open |
| T-15 | Column headers use Title Case — design uses ALL CAPS | 🟡 Low | resolved |
| T-16 | Mobile drawer has redundant double heading ("Add Transaction" + "⚡ Quick Add Transaction") | 🟡 Low | open |
| T-17 | Mobile: period selector not visible — needs real device verification | 🟡 Low | open |
| T-18 | Empty state: blank table body with no message, no illustration, no CTA — confirmed via interactive testing | 🔴 High | resolved |
| T-19 | Edge case: batch sticky defaults (Date + Account persist between saves) not verified | 🟠 Medium | open |
| T-20 | Edge case: transfer From ≠ To validation not verified | 🟠 Medium | open |
| T-21 | **Desktop only** — Quick Add modal: Category and Account dropdowns clip outside modal bounds, options barely visible (emoji only, no text) | 🔴 High | open |
| T-22 | **Desktop only** — Quick Add modal: Select components too small, labels truncated to single characters. Mobile stacked layout handles this correctly | 🔴 High | open |

---

## Accounts

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-01 | Net Position breakdown shows "Savings" instead of "Protected" — mismatches the account type name used everywhere else on the page | 🔴 High | open |
| A-02 | Trailing `.00` on all amounts throughout (e.g. `€75.00`, `€9,889.70`) — design uses clean values (`$4,520`, `$34,330`) | 🔴 High | resolved |
| A-03 | Liquid account card net change: verbose two-column row (`Net change this period … -€25.00`) vs design's compact inline (`+ $320 this period`) | 🟠 Medium | resolved |
| A-04 | Liquid account cards show Low/High labels + "Current is within range" sentence — not present in design; range was meant to be communicated visually via dot position only | 🟠 Medium | open |
| A-05 | "Updated: 2h ago" chip missing from topbar utility row — same gap as D-04 | 🟠 Medium | open |
| A-06 | ℹ tooltip icon added next to "NET POSITION" label — not in design | 🟠 Medium | open |
| A-07 | Allowance card uses "Net change this period" — design uses shorter "This Period", inconsistent with sibling rows in the same card | 🟠 Medium | open |
| A-08 | Allowance card: "Balance after next transfer" vs design's "Projected After Transfer" — different label for the same concept | 🟠 Medium | open |
| A-09 | Net Position bar is single colour — design suggests segmented by type (Liquid / Protected / Debt) based on breakdown labels | 🟡 Low | open |
| A-10 | "30-day closing balance range" vs design's "30d closing balance range" — minor copy inconsistency | 🟡 Low | open |
| A-11 | **Mobile only** — Period selector absent from topbar; period context is relevant to account data (net change, transfer projections) | 🟠 Medium | open |
| A-12 | **Mobile only** — Overview/Management tabs have tight spacing, sit too close to subtitle with no breathing room | 🟡 Low | open |
| A-13 | "Savings" mislabel (see A-01) confirmed on mobile as well — not mobile-exclusive but present on both | 🔴 High | open |
| A-14 | **Mobile only** — Slider track barely visible on dark background at 390px; only the dot is clearly readable, range context is lost | 🟠 Medium | open |

---

## Account Detail

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| AD-01 | Header account type label shows raw subtype (`CHECKING`) instead of human-readable type (`LIQUID ACCOUNT`) | 🔴 High | resolved |
| AD-02 | Header net change uses ISO date range (`2026-02-01 – 2026-03-01`) instead of readable (`May 1 – May 31`); missing "this period" label | 🔴 High | resolved |
| AD-03 | Context section: stability heading is `STABILITY` — design uses `STABILITY CONTEXT` | 🟠 Medium | open |
| AD-04 | Balance History chart has Y-axis + X-axis ISO date labels — design is clean and label-free | 🟠 Medium | resolved |
| AD-05 | Back navigation is a bare `←` arrow — no breadcrumb (`Accounts > Main Checking Account`) for orientation | 🟠 Medium | resolved |
| AD-06 | Transaction table date group headers use ISO format (`2026-02-27`) — design uses readable short format (`MAY 12`) | 🟠 Medium | resolved |
| AD-07 | Transaction table row date cells use ISO format (`2026-02-27`) — design uses `May 12` | 🟠 Medium | resolved |
| AD-08 | Inflow amounts not colour-highlighted — design shows inflows in accent colour to distinguish from outflows | 🟠 Medium | resolved |
| AD-09 | Allowance badge missing from applicable transaction rows — same gap as T-11 | 🟠 Medium | open |
| AD-M01 | **Mobile only** — Header balance + net change are centred instead of right-aligned, creating visual disconnect with left-aligned account name above | 🔴 High | open |
| AD-M02 | **Mobile only** — Transaction table not adapted for mobile: 5 columns at 390px causes date cell wrapping and severely cramped layout; needs card layout or column reduction | 🔴 High | open |
| AD-M03 | **Mobile only** — Chart X-axis ISO date labels overlap and become illegible at mobile width | 🟠 Medium | open |
| AD-M04 | **Mobile only** — Context section: excessive blank space between Category Impact and Stability after stacking vertically | 🟠 Medium | open |
| AD-M05 | **Mobile only** — No period selector in topbar; no way to switch periods for this account on mobile (same as A-11) | 🟠 Medium | open |
| AD-M06 | **Mobile only** — Balance History time-range toggle tabs (Period/30d/90d/1y) are tiny and cramped in top-right corner of chart card | 🟡 Low | open |

---

## Account Management

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| AM-01 | Page subtitle doesn't change on Management tab — shows Overview subtitle (`Balance-level structure…`) instead of `Define and manage your financial accounts` | 🔴 High | resolved |
| AM-02 | Account cards are tall vertical stacks — design uses compact single-row layout (icon+name left, balance+status middle, buttons right) for much better information density | 🟠 Medium | open |
| AM-03 | Starting Balance shows trailing `.00` throughout — systemic issue (see A-02) | 🟠 Medium | resolved |
| AM-04 | No ARCHIVED section present — design shows archived accounts grouped under a dedicated `ARCHIVED` section with greyed status and Edit-only button | 🟠 Medium | open |
| AM-05 | Delete button shown on accounts that have transactions — should only appear on zero-transaction accounts per entity lifecycle rules | 🟠 Medium | open |
| AM-06 | Edit drawer missing fields vs design: no Description field, no Currency field, no "Adjust Starting Balance" action, no locked-field explanatory text | 🔴 High | open |
| AM-07 | Edit drawer subtitle wrong — live shows `Account type cannot be changed after creation.` (one sentence); design shows `Name and description are editable. Type remains immutable.` (more informative) | 🟡 Low | open |
| AM-08 | Edit drawer uses inline drawer (slides from top) — design uses a centred modal dialog | 🟠 Medium | open |
| AM-M01 | **Mobile only** — Cards are ~200px tall each; can only see 2–3 accounts per screen; critically low density for a management list | 🔴 High | open |
| AM-M02 | **Mobile only** — `+ Add Account` button visually merges with the tab row, looks like part of the tab group; needs separation or FAB treatment | 🟠 Medium | open |
| AM-M03 | **Mobile only** — Edit modal Type field is an interactive dropdown despite being immutable after creation; should be disabled/greyed | 🟠 Medium | open |
| AM-M04 | New Account modal missing Currency selector — users cannot set currency on creation (affects desktop and mobile) | 🟠 Medium | open |
| AM-M05 | **Mobile only** — Archive action untested for confirmation dialog; accidental tap risk on mobile if no confirmation step | 🟡 Low | open |

---

## Categories Overview

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| C-01 | `Scope: All accounts` filter chip missing from topbar — no way to filter category view by account | 🔴 High | open |
| C-02 | Extra `Targets` tab present in live app — not in design; needs design spec or should be noted as ahead-of-spec | 🔴 High | open |
| C-03 | Summary card: trailing `.00` decimals and multiline wrap on desktop — design shows clean single-line summary | 🟠 Medium | resolved |
| C-04 | BUDGETED CATEGORIES subtitle is generic; design uses `Stability (last 3 closed periods)` which explains the stability dots | 🟠 Medium | open |
| C-05 | `Projected at current pace: $X` line missing from category rows — design shows forward projection, live only shows current actual | 🟠 Medium | open |
| C-06 | Column header `% Used` shown as `Used` (% prefix dropped); `Budget` vs `Budgeted` minor label difference | 🟠 Medium | open |
| C-07 | Trailing `.00` decimals throughout all amount values — systemic issue (see A-02) | 🟠 Medium | resolved |
| C-08 | Unbudgeted categories — when spending exists, design shows `Category $amount (X%)` format; live format unverified against this | 🟠 Medium | open |
| C-09 | Positive variance values have no leading `+` sign — design uses explicit `+$180`; live shows unsigned positive amounts | 🟡 Low | resolved |
| C-10 | Progress bar does not visually indicate overflow when category exceeds budget (>100%); bar just fills to max with no overflow treatment | 🟡 Low | open |
| C-M01 | **Mobile only** — Summary card stacks PERIOD → bar → SUMMARY vertically; relationship between bar and summary text is visually ambiguous | 🟠 Medium | open |
| C-M02 | **Mobile only** — Category stat rows (Budgeted/Actual/Variance/Used) have no visual separation from category name area above; zones blur together when stacked | 🟠 Medium | open |
| C-M03 | **Mobile only** — Three tabs (Overview/Management/Targets) cramped at mobile width; active tab indicator is very subtle and easy to miss | 🟠 Medium | open |
| C-M04 | **Mobile only** — No period selector in topbar; period shown in card but not changeable from this page on mobile (same as A-11) | 🟡 Low | open |
| C-M05 | **Mobile only** — Negative variance amounts hard to read at small size; no colour treatment to distinguish negative (over-budget) from positive | 🟡 Low | open |

---

## Vendors Management

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| V-01 | Section header shows count `(4)` instead of design's `(ALPHABETICAL)` sort label | 🔴 High | resolved |
| V-02 | Vendor description not shown in list rows — exists in Edit modal but not rendered in the list; loses key at-a-glance context | 🔴 High | resolved |
| V-03 | Transaction count uses full word (`1 transaction`) vs design's compact `1 tx`; also pluralisation bug: `0 transaction` should be `0 transactions` | 🟠 Medium | resolved |
| V-04 | `Add Vendor` button missing `+` prefix — design uses `+ Add Vendor`; inconsistent with other creation buttons | 🟠 Medium | resolved |
| V-05 | Add Vendor modal missing contextual subtitle: `Vendors are usually created from transaction entry. This page also allows direct creation.` | 🟠 Medium | resolved |
| V-06 | Add Vendor modal primary button labelled `Save Vendor` — design uses `Create`; same label as Edit modal blurs create vs edit distinction | 🟠 Medium | resolved |
| V-07 | Archived vendor rows show no `Archived` status label — design shows dimmed `Archived` text next to transaction count | 🟠 Medium | resolved |
| V-08 | Edit modal field labelled `Vendor Name` — design uses `Name`; redundant in context | 🟡 Low | resolved |
| V-M01 | **Mobile only** — Edit/Add modals render as bottom sheets with ~50% empty black space below the content; layout feels broken | 🔴 High | open |
| V-M02 | **Mobile only** — Discard changes confirmation fills entire viewport with just 2 lines of text + 2 buttons; should be a small overlay, not full-screen takeover | 🔴 High | open |
| V-M03 | **Mobile only** — Action buttons (Edit/Archive/Delete) stack below vendor name, increasing row height significantly; swipe-to-reveal or `⋯` overflow menu would be more appropriate | 🟠 Medium | open |
| V-M04 | **Mobile only** — `Add Vendor` button crowds the `Vendors` h1 on the same line; should be separate row or FAB | 🟠 Medium | open |
| V-M05 | **Mobile only** — Search bar has no clear (`×`) button; tap-to-clear is important on mobile where retyping is slow | 🟡 Low | open |

---

## Categories Management

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| CM-01 | Page subtitle ends with a trailing period (`Define and organize your budgeting structure.`) — design has no period | 🟡 Low | open |
| CM-02 | **Desktop only** — `+ Add Category` button renders as a bare `+` icon with no label — design shows full `+ Add Category` text label on desktop; mobile design also uses bare `+` so mobile is correct | 🔴 High | open |
| CM-03 | Category rows display a `TYPE: INCOME` / `TYPE: SPENDING` badge — this badge is not present in the design; the type is conveyed by the section heading (INCOMING / OUTGOING) alone | 🟠 Medium | resolved |
| CM-04 | Categories with no description show nothing in the description line — design always shows the description text; missing description is a data gap that should surface a placeholder or be omitted gracefully, but the card height collapses inconsistently with peers that do have descriptions | 🟡 Low | open |
| CM-05 | ~~Transaction count format~~ — design uses full word `34 transactions` which matches live; this is correct behaviour | 🟠 Medium | withdrawn |
| CM-06 | ~~`Active` status as plain text~~ — design also uses plain inline text for status; live matches; this is correct behaviour | 🟠 Medium | withdrawn |
| CM-07 | Edit modal field labelled `Category Name` — design uses simply `Name`; redundant in context (same pattern as V-08 for vendors) | 🟡 Low | open |
| CM-08 | Edit modal Type field is an **interactive dropdown** despite the category already having transactions — design specifies Type is immutable after creation and should be visually locked/greyed with explanatory text | 🔴 High | resolved |
| CM-09 | Edit modal renders a stray `0` between the Type field and the Icon field — appears to be a raw transaction count leaking into the form layout; no corresponding element in the design | 🔴 High | resolved |
| CM-10 | Create Category modal primary button labelled `Create Category` — design uses the shorter `Create`; inconsistent with the pattern set by the Edit modal's `Save` | 🟡 Low | open |
| CM-11 | Create/Edit modals open as a **bottom sheet** (slides up from bottom) on all viewport sizes — design specifies a **centred modal dialog**; same issue as AM-08 for accounts | 🟠 Medium | open |
| CM-12 | Edit modal missing the explanatory constraint notes present in the design: `Type cannot be changed after the first transaction exists.` and `Re-parenting is available only when transaction count is 0.` — users have no feedback on why fields are locked | 🟠 Medium | open |
| CM-13 | No empty state implemented for the Management tab — design shows a card with icon, `No categories defined yet.` heading, descriptive copy, and an `Add Category` CTA button when the list is empty | 🔴 High | resolved |
| CM-14 | Delete button appears on categories that have transactions (e.g. categories with 1+ transactions show Edit / Archive / Delete) — design only shows Delete on zero-transaction categories; Archive is the correct action once transactions exist | 🟠 Medium | open |
| CM-M01 | **Mobile only** — Create/Edit modals render as bottom sheets with large empty black space (~40%) below the buttons; layout feels broken, identical to V-M01 for vendors | 🔴 High | open |
| CM-M02 | **Mobile only** — No period selector in the management tab topbar — design shows a period context dropdown above the page header; users cannot switch periods on mobile from this page (same gap as A-11 and C-M04) | 🟠 Medium | open |
| CM-M03 | **Mobile only** — Search bar has no clear (`×`) button; once text is typed, clearing requires manually deleting characters — same issue as V-M05 | 🟡 Low | open |
| CM-M04 | **Mobile only** — `Archive` button on zero-transaction categories appears visually disabled/greyed (e.g. "Test" with 0 transactions) even though archiving should be available; makes the action appear inaccessible | 🟠 Medium | open |
| CM-M05 | **Mobile only** — No discard-changes confirmation when cancelling an Edit modal with unsaved changes — the sheet dismisses silently; users lose edits without warning (design pattern V-M02 for vendors implies a confirmation step is expected) | 🟠 Medium | open |
| CM-M06 | **Mobile only** — Targets tab present in the tab row at mobile width alongside Overview and Management — three tabs are cramped and the Targets tab is not in the design spec at all (same as C-M03 / C-02) | 🟠 Medium | open |

---

## Settings

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| ST-01 | Page subtitle reads `Manage your preferences and account settings` — design uses `Identity, security, structure, preferences, and data ownership controls.` | 🟡 Low | open |
| ST-02 | `SECTIONS` sidebar navigation missing — design has a two-column layout with a sticky left nav (Profile / Security / Period Model / Preferences / Data and Export / Danger Zone) for jumping between sections; live renders all sections as a single linear scroll with no section nav | 🔴 High | resolved |
| ST-03 | `PiggyPulse identity` breadcrumb chip missing from topbar — design shows it next to the logo as page context | 🟡 Low | open |
| ST-04 | Profile section: user avatar circle (`L`) displayed — design shows no avatar; fields are a clean key/value list | 🟠 Medium | resolved |
| ST-05 | Profile section: Email shows `l***@gmail.com` with no annotation — design shows `l***@example.com (read-only)` with an explicit `(read-only)` label | 🟠 Medium | open |
| ST-06 | Profile section: Default Currency shows `€` symbol only — design shows ISO code `EUR`; symbol-only is ambiguous for multi-currency users | 🟠 Medium | resolved |
| ST-07 | Security section: `Manage Security` button missing — design has it alongside `Revoke Session`; live only has per-row `Revoke` buttons | 🟠 Medium | open |
| ST-08 | Security section: Active Sessions rows show date only (`· 27 Feb 2026`) — design shows device name, country, and relative last-active time (`MacBook Pro \| Netherlands \| Last active: 2 minutes ago`); no context to identify which session to revoke | 🔴 High | open |
| ST-09 | Security section: `Session detail privacy` item missing — design shows this row ("Country-level location only. No IP or fingerprint shown.") to reassure users | 🟠 Medium | open |
| ST-10 | Security section: 2FA shown as `⊗ DISABLED` chip — design shows a plain status line (`Status: Enabled. Recovery codes can be regenerated.`); different visual pattern | 🟡 Low | open |
| ST-11 | Period Model section: only `Mode` field shown — design displays six fields: Mode, Start day, Duration, Generate ahead, Weekend rule, Name pattern; five fields are missing | 🔴 High | open |
| ST-12 | Period Model section: informational note missing — design shows `Schedule updates regenerate future periods only. Transactions are assigned by date, not linked directly to period records.` | 🟠 Medium | open |
| ST-13 | Preferences section: `Language` selector present in live — not in the design; undocumented field | 🟠 Medium | open |
| ST-14 | Preferences section: `Compact mode` row has a sub-description line (`Show more items with less spacing`) — design shows no description for this field | 🟡 Low | resolved |
| ST-15 | Preferences section: informational note missing — design shows `Changes preview immediately in this mockup but are committed only after pressing Save.` | 🟠 Medium | open |
| ST-16 | Data & Export section: heading uses `Data & Export` — design uses `DATA AND EXPORT`; `&` vs `and` inconsistency | 🟡 Low | open |
| ST-17 | Data & Export section: `Request account data copy` option missing — design shows it as a third export item with `Request Data Copy` button | 🟠 Medium | open |
| ST-18 | Data & Export section: export item descriptions differ — live uses generic download copy; design uses `Tabular transaction snapshot.` / `Structured dataset for personal archival.` | 🟡 Low | open |
| ST-19 | Data & Export section: export buttons rendered as compact icon+label chips (`CSV`, `JSON`) — design uses full-width text buttons (`Export CSV`, `Export JSON`) | 🟠 Medium | resolved |
| ST-20 | Danger Zone: Reset Structure description omits key safety qualifier — design explicitly states `Transactions remain intact.`; live omits this reassurance | 🔴 High | resolved |
| ST-21 | Danger Zone: Delete Account description omits typed-confirmation requirement — design states `requires typed confirmation: DELETE`; live gives no indication of the confirmation gate | 🔴 High | resolved |
| ST-22 | Danger Zone: action buttons use dark filled style with icons (↺ / 🗑) — design uses plain outline buttons with no icons | 🟠 Medium | resolved |
| ST-M01 | **Mobile only** — Section labels use mixed case (`Profile`, `Security`, `Period Model`) — design uses ALL CAPS (`PROFILE`, `SECURITY`, `PERIOD MODEL`) as visual scan anchors; the contrast is most impactful on mobile where users navigate by scrolling past section headers | 🟡 Low | resolved |
| ST-M02 | **Mobile only** — Action buttons (`Edit Profile`, `Edit Schedule`) are positioned top-right in the section header card — design places them at the **bottom** of each section, after all fields and the info note; on narrow mobile viewports the top-right placement clutters the header and disconnects the CTA from the content it acts on | 🟠 Medium | open |
| ST-M03 | **Mobile only** — Active Sessions renders as 8+ date-only rows each with an individual `Revoke` button, consuming the majority of the Security section's height and requiring extensive scrolling; design uses a single summary row for sessions — the date-only approach is both harder to scan and more disruptive on mobile | 🔴 High | open |
| ST-M04 | **Mobile only** — Password row has an inline `Change Password` button — design shows Password as a plain descriptive list item; the inline button increases row height and adds visual noise in mobile's narrow layout; actions are meant to be consolidated in the `Manage Security` bottom button | 🟠 Medium | open |
| ST-M05 | **Mobile only** — 2FA row has an inline `Enable 2FA` button — same structural issue as ST-M04; design shows 2FA status as a plain read line, not an actionable inline control | 🟠 Medium | open |
| ST-M06 | **Mobile only** — `Save Preferences` button is right-aligned — design shows it left-aligned at the bottom of the Preferences section, consistent with other section action buttons | 🟡 Low | open |

---

## Period Management

> Design reference: `http://127.0.0.1:8001/period-management/piggypulse-period-management.html`
> Validated: desktop (1400 × 900) — 2026-02-27

| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| PM-01 | Page title reads **"Budget Periods"** — design uses the shorter **"Periods"** | 🟡 Low | resolved |
| PM-02 | Page subtitle is a verbose two-sentence description — design uses the compact tagline **"Time windows that help you track patterns"** | 🟡 Low | resolved |
| PM-03 | `Create Period` button renders full-width centered below the subtitle — design places it top-right alongside `Edit Schedule`; layout breaks the standard page-header action pattern used on every other page | 🔴 High | open |
| PM-04 | `Edit Schedule` button is absent from the page header — design shows it as a secondary outline button next to `Create Period`; instead there is only a `Set up Auto-Creation` link inside a Schedule card | 🔴 High | open |
| PM-05 | Period selector dropdown is absent from the topbar — design shows a period picker in the header consistent with all other pages | 🟠 Medium | open |
| PM-06 | Current Period card shows **no financial summary** — design shows Incoming / Outgoing / Net amounts in EUR on the card face; live renders only the date range and status badge | 🔴 High | open |
| PM-07 | Current Period card title format is **"Feb/26"** chip — design shows the full month name **"February 2026"** as the card heading | 🟠 Medium | resolved |
| PM-08 | Period row actions are **icon-only buttons** (chart / edit / delete) — design uses labelled text buttons **"View details"** and **"Edit targets"** with no delete affordance on the current period | 🔴 High | open |
| PM-09 | Delete (trash) icon appears on the Current Period row — design does not expose a delete action on an open/current period | 🟠 Medium | resolved |
| PM-10 | Create Period modal is titled **"Create Budget Period"** — design uses **"Create Period"** | 🟡 Low | open |
| PM-11 | Create Period modal contains advanced sections (**Period Setup**, **End Rule** with By Duration / Set Manually toggle, **Naming**) — design shows a simple three-field form (Period name, Start date, End date + info note); the extra complexity is surfaced prematurely | 🔴 High | open |
| PM-12 | Create Period modal primary button is labelled **"Create Period"** — design uses **"Create"** | 🟡 Low | open |
| PM-13 | Edit Schedule modal opens as a **bottom sheet** — design shows it as a centred modal dialog | 🟠 Medium | open |
| PM-14 | Edit Schedule modal/sheet is titled **"Period Schedule Settings"** — design uses **"Edit schedule"** | 🟡 Low | open |
| PM-15 | Edit Schedule modal uses **two separate Weekend Policy dropdowns** (Saturday / Sunday) — design shows a single **"Weekend rule"** dropdown | 🟠 Medium | open |
| PM-16 | Edit Schedule modal includes an extra **"Schedule Preview"** summary box — not present in the design; adds visual noise without a clear call-to-action | 🟡 Low | open |
| PM-17 | Edit Schedule modal save button is labelled **"Save"** — design uses **"Save schedule"** | 🟡 Low | open |
| PM-M01 | **Mobile only** — Design places a compact **`+` icon button** and **`...` more button** top-right in the header (standard mobile affordance); live renders a full-width **"Create Period"** banner button that consumes significant vertical space and pushes content down | 🔴 High | open |
| PM-M02 | **Mobile only** — `...` more button absent from header — on mobile the design consolidates secondary actions (Edit Schedule, Disable Schedule) into the `...` overflow menu; in live there is no equivalent, those actions are only reachable via the Schedule card CTA | 🟠 Medium | open |
| PM-M03 | **Mobile only** — Section labels use Title Case (`Upcoming Periods`, `Past Periods`) — design uses ALL CAPS (`UPCOMING PERIODS`, `PAST PERIODS (TIME WINDOW ENDED)`) as high-contrast visual scan anchors; especially important on mobile where sections are navigated by scrolling | 🟡 Low | resolved |
| PM-M04 | **Mobile only** — Past Periods section heading is just **"Past Periods"** — design labels it **"PAST PERIODS (TIME WINDOW ENDED)"**; the parenthetical qualifier communicates why those periods are listed and is missing | 🟡 Low | open |
| PM-M05 | **Mobile only** — Upcoming Periods disclaimer note is absent — design shows **"Future periods may change. Future-dated transactions will appear in the appropriate period based on date."** below the upcoming period cards; live has no equivalent, leaving users without important context about auto-generated period mutability | 🟠 Medium | resolved |

---

## Categories Targets

> No canonical design — validated for internal consistency with the rest of the app.
> Validated: desktop + mobile — 2026-02-27

| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| CT-01 | Page subtitle ends with a trailing period — **"Set spending targets and track budget adherence per category."** — all other page subtitles in the app omit the trailing period | 🟡 Low | resolved |
| CT-02 | Period summary card displays the date range in **ISO format** (`2026-02-01 - 2026-03-01`) — every other date display in the app uses human-readable format (`Feb 1 - Mar 1` or `01 Feb → 01 Mar`); inconsistent with the Periods page and the Overview tab | 🟠 Medium | resolved |
| CT-03 | Amount input fields use a **`$` prefix** — the app is configured for EUR and renders `€` everywhere else (`€1,700.00`, `€500.00`); the hardcoded `$` is a currency consistency failure | 🔴 High | resolved |
| CT-04 | **"Mark as excluded" info note is duplicated** — the same note (`Use **Mark as excluded** when a category should remain outside target tracking for this period.`) appears once after the Outgoing section and again after the Incoming section; other sections in the app use a single info note per group | 🟡 Low | resolved |
| CT-05 | **Keyboard shortcut hint is visible on mobile** — `"Keyboard: Tab moves field to field; Enter on the final amount saves; Escape closes overlays."` is displayed at the bottom of the page on mobile where keyboard navigation is not applicable; no other page exposes desktop-only hints unconditionally | 🟠 Medium | resolved |
| CT-06 | **Archived category renders an editable-looking (but disabled) input row** — "Test2 (ARCHIVED)" shows a greyed-out input labelled "Unavailable" with no affordance to act on it; other archived states in the app (e.g., Management tab) suppress interactive controls entirely and show a clear read-only state | 🟠 Medium | open |
| CT-07 | **Zero-spend percentage shown as "0.0%"** — one decimal place for a whole number; other percentages in the app (`92% elapsed`, deviation indicators) omit decimals for whole numbers; inconsistent number formatting | 🟡 Low | resolved |
| CT-08 | **"None" label above the amount input** for categories with no target — the subtitle already reads "No target defined yet"; the extra "None" label is redundant and does not match the pattern of other form fields in the app which omit a current-value label and rely on placeholder text | 🟡 Low | resolved |
