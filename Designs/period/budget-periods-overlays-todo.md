# Budget Periods + Overlays - Implementation TODO List

## Project Overview
Implementing manual-first budgeting with flexible budget periods and temporary budget overlays (vacations/events) as specified in PRD.

---

## Phase 1: Period Foundation (Weeks 1-2)

### 1.1 Global Period Chip Enhancement
- [ ] **Desktop**: Replace "02/26" chip with expandable period display
  - [ ] Show format: "Feb 1 → Feb 29 • 21 days left"
  - [ ] Add dropdown indicator
  - [ ] Style: gradient border to indicate it's interactive
  - [ ] Hover state design
- [ ] **Mobile**: Enhance top bar period chip
  - [ ] Same format as desktop but condensed if needed
  - [ ] Tap-friendly hit area (min 44px height)

### 1.2 Period Picker (Bottom Sheet/Dropdown)
- [ ] **Desktop**: Dropdown from period chip
  - [ ] Design dropdown panel (max-height with scroll)
  - [ ] Current period section (highlighted with gradient)
  - [ ] Next period section (if exists)
  - [ ] Previous periods section (collapsed/expandable)
  - [ ] "Manage Periods" CTA button
  - [ ] Warning card for No Period state
- [ ] **Mobile**: Bottom sheet from period chip
  - [ ] Drag handle at top
  - [ ] Same sections as desktop
  - [ ] Smooth slide-up animation
  - [ ] Backdrop overlay (semi-transparent)

### 1.3 No Period Warning System
- [ ] **Dashboard Banner**: Top of page warning
  - [ ] Red/warning gradient background
  - [ ] Icon: alert triangle
  - [ ] Text: "You're in a gap. X transactions aren't in any period."
  - [ ] "Fix This" CTA button
  - [ ] Dismissible? (Decision needed)
- [ ] **Period Picker Warning**: Inline warning in picker
  - [ ] Same styling, compact version
  - [ ] Shows transaction count
  - [ ] Quick fix button
- [ ] **Transactions Filter**: Add "No Period (X)" filter chip
  - [ ] Badge with count
  - [ ] Red/warning color
  - [ ] Clicking filters to show only no-period transactions

---

## Phase 2: Period Management (Weeks 2-3)

### 2.1 Periods Management Screen
- [ ] **Desktop Layout**
  - [ ] Header: "Budget Periods" with description
  - [ ] Three main sections in cards:
    - [ ] Current Period (prominent card with gradient)
    - [ ] Upcoming Periods (list of cards)
    - [ ] Past Periods (collapsed accordion)
  - [ ] No Period Issues card (conditional, warning style)
  - [ ] "+ Create Period" floating action button (only if schedule OFF)
  - [ ] "Set up auto-creation" card/button (if schedule not configured)
- [ ] **Mobile Layout**
  - [ ] Same sections, stacked vertically
  - [ ] Collapsible Past Periods section
  - [ ] Sticky FAB for "+ Create Period"

### 2.2 Period Card Design
- [ ] **Manual Period Card**
  - [ ] Period name (display-only, can be duplicate)
  - [ ] Date range display: "Feb 1 → Feb 29"
  - [ ] Duration info: "28 days"
  - [ ] Transaction count badge
  - [ ] Edit icon button
  - [ ] Delete icon button (with confirmation)
  - [ ] Current indicator (if applicable)
- [ ] **Schedule-Generated Period Card**
  - [ ] Same as manual, plus:
  - [ ] "Auto" badge (blue/purple gradient)
  - [ ] Read-only indicator (no edit button)
  - [ ] Schedule icon

### 2.3 Create Period Flow
- [ ] **Desktop Modal**
  - [ ] Modal overlay (centered, ~500px width)
  - [ ] Title: "Create Budget Period"
  - [ ] Form fields:
    - [ ] Start Date picker (calendar widget)
    - [ ] Duration inputs (number + unit dropdown: days/weeks/months)
    - [ ] Preview end date (calculated, read-only, styled differently)
    - [ ] Name field (optional, display-only)
  - [ ] Options section:
    - [ ] "Copy budgets from previous period" toggle (default ON)
    - [ ] Helper text explaining what this does
  - [ ] Validation errors inline
  - [ ] Overlap error (prominent red warning)
  - [ ] Action buttons: Cancel, Create
- [ ] **Mobile Modal**
  - [ ] Full-screen modal
  - [ ] Same fields, stacked layout
  - [ ] Bottom fixed action buttons

### 2.4 Edit Period Flow
- [ ] **Edit Modal** (same layout as create)
  - [ ] Pre-filled fields
  - [ ] Warning banner at top:
    - [ ] "Changing dates will change which transactions appear in this period."
    - [ ] Icon + yellow/orange warning color
  - [ ] Disable editing if period is schedule-generated
  - [ ] Action buttons: Cancel, Save Changes

### 2.5 No Period Fix Flow
- [ ] **Fix Modal - Schedule OFF**
  - [ ] Show list of No Period transactions (date range)
  - [ ] Suggest period dates to cover them
  - [ ] Pre-fill create form with suggested dates
  - [ ] "Create Period to Cover" CTA
- [ ] **Fix Modal - Schedule ON**
  - [ ] Explain situation
  - [ ] Option 1: "Adjust Schedule" button
  - [ ] Option 2: "Disable Schedule" button
  - [ ] Warning about implications

---

## Phase 3: Period Scheduling (Week 4)

### 3.1 Schedule Configuration Screen
- [ ] **Access Points**
  - [ ] From Periods Management: "Set up auto-creation" card
  - [ ] From Settings (if you have settings)
- [ ] **Configuration Form**
  - [ ] Section: Basic Settings
    - [ ] Start day of month (1-31) number input
    - [ ] Warning for 29/30/31 (fallback to last day)
    - [ ] Duration: value + unit (days/weeks/months)
  - [ ] Section: Weekend Adjustments
    - [ ] Saturday handling: dropdown (Move to Friday / Move to Monday / Keep)
    - [ ] Sunday handling: dropdown (same options)
  - [ ] Section: Naming
    - [ ] Name pattern input (with variable hints)
    - [ ] Example preview
  - [ ] Section: Advanced
    - [ ] Generate ahead count (default 6)
    - [ ] Explanation text
  - [ ] Actions: Cancel, Enable Schedule

### 3.2 Schedule Active State
- [ ] **Periods Management Changes**
  - [ ] Schedule ON indicator card at top
  - [ ] Show schedule configuration summary
  - [ ] "Edit Schedule" button
  - [ ] "Disable Schedule" button
  - [ ] Hide "+ Create Period" button
  - [ ] All auto-generated periods show "Auto" badge
- [ ] **Schedule Edit Flow**
  - [ ] Same form as configuration
  - [ ] Warning about changing existing periods
  - [ ] Regenerate logic

---

## Phase 4: Budget Overlays Foundation (Week 5)

### 4.1 Dashboard Overlay Banner
- [ ] **Desktop Banner** (above main stats cards)
  - [ ] Gradient background (different from main cards)
  - [ ] Left: Overlay icon + name "Italy Trip"
  - [ ] Center: Spend info "€120 left (3 days)"
  - [ ] Progress bar (if total cap exists)
  - [ ] Right: Close/minimize button
  - [ ] Tap anywhere → overlay detail
- [ ] **Mobile Banner** (same position)
  - [ ] Stacked layout for info
  - [ ] Tap to view detail
  - [ ] Swipe to dismiss option
- [ ] **Multiple Active Overlays**
  - [ ] Show most recent
  - [ ] Dropdown indicator
  - [ ] Tapping dropdown shows all active overlays list

### 4.2 Overlays Navigation
- [ ] **Sidebar Addition** (Desktop)
  - [ ] Add "Overlays" under MANAGEMENT section
  - [ ] Icon: layered squares or calendar event icon
  - [ ] Badge showing count of active overlays
- [ ] **Mobile Navigation**
  - [ ] Add to bottom tab bar? Or in "More" menu?
  - [ ] Badge for active count

### 4.3 Overlays List Screen
- [ ] **Desktop Layout**
  - [ ] Header: "Budget Overlays" with description
  - [ ] Three sections:
    - [ ] Active (gradient highlight cards)
    - [ ] Upcoming (standard cards)
    - [ ] Past (collapsed accordion)
  - [ ] "+ Create Overlay" floating action button
- [ ] **Mobile Layout**
  - [ ] Same sections, stacked
  - [ ] Sticky FAB

### 4.4 Overlay Card Design
- [ ] **Card Layout**
  - [ ] Overlay name + icon/emoji
  - [ ] Date range: "Aug 10 → Aug 20"
  - [ ] Spend vs cap: "€450 / €800"
  - [ ] Progress bar (visual spend indicator)
  - [ ] Overspend warning (if applicable)
  - [ ] Inclusion mode badge (Manual / Rules / All)
  - [ ] Transaction count
  - [ ] Actions: View, Edit, Delete

---

## Phase 5: Overlay Creation & Management (Week 6)

### 5.1 Create Overlay Flow (Multi-Step)
- [ ] **Step 1: Basic Info**
  - [ ] Modal/screen with progress indicator (1/5)
  - [ ] Name input
  - [ ] Date range picker (start + end)
  - [ ] Visual: mini calendar showing range
  - [ ] Validation: must have end date, no infinite overlays
  - [ ] Next button
- [ ] **Step 2: Inclusion Mode**
  - [ ] Progress indicator (2/5)
  - [ ] Three radio cards:
    - [ ] Manual (default, recommended badge)
    - [ ] Rules-based
    - [ ] Include Everything
  - [ ] Description for each mode
  - [ ] Back, Next buttons
- [ ] **Step 3: Rules Builder** (if Rules mode selected)
  - [ ] Progress indicator (3/5)
  - [ ] OR logic explanation
  - [ ] Three rule types:
    - [ ] Categories: multi-select chips
    - [ ] Vendors: multi-select chips
    - [ ] Accounts: multi-select chips
  - [ ] "Add another rule type" button
  - [ ] Preview: "X transactions will be included"
  - [ ] Back, Next buttons
- [ ] **Step 4: Set Caps**
  - [ ] Progress indicator (4/5)
  - [ ] Total cap section (optional toggle + amount input)
  - [ ] Category caps section:
    - [ ] List of categories
    - [ ] Each has optional cap input
    - [ ] Visual distribution if total cap exists
  - [ ] Back, Next buttons
- [ ] **Step 5: Review**
  - [ ] Progress indicator (5/5)
  - [ ] Summary card:
    - [ ] Name + dates
    - [ ] Inclusion mode
    - [ ] Rules (if applicable)
    - [ ] Caps configured
    - [ ] Estimated transactions
  - [ ] Back, Create Overlay buttons

### 5.2 Overlay Detail Screen
- [ ] **Desktop Layout**
  - [ ] Header with overlay name + date range
  - [ ] Edit button (if not ended)
  - [ ] Delete button
  - [ ] Stats section:
    - [ ] Total spent vs cap (large display)
    - [ ] Progress ring/bar
    - [ ] Overspend warning (if applicable)
  - [ ] Category Breakdown section:
    - [ ] If category caps exist
    - [ ] Cards for each category with cap
    - [ ] Spent/cap/remaining
    - [ ] Visual progress bars
  - [ ] Transactions section:
    - [ ] Filtered to overlay membership
    - [ ] Same transaction list component
    - [ ] Overlay-specific actions
- [ ] **Mobile Layout**
  - [ ] Same sections, stacked
  - [ ] Sticky header with name

### 5.3 Overlay Transaction Management
- [ ] **Transaction Row Changes**
  - [ ] Add overlay pills/badges under transaction
  - [ ] Multiple overlays? Show count badge
  - [ ] Tap badge → filter to that overlay
- [ ] **Quick Add Integration**
  - [ ] If overlay active:
    - [ ] Show "Add to overlay" toggle
    - [ ] Default OFF (unless inclusion mode = All)
    - [ ] If multiple overlays active, show dropdown
  - [ ] Save logic includes overlay membership

### 5.4 Manual Inclusion (Default Mode)
- [ ] **In Overlay Detail - Transactions Section**
  - [ ] Show all period transactions
  - [ ] Each transaction has "+ Include" button
  - [ ] Included transactions show "✓ Included" + Remove option
  - [ ] Bulk selection mode option
- [ ] **In Main Transactions Screen**
  - [ ] Overlay filter chip
  - [ ] Select multiple → "Add to overlay" bulk action

### 5.5 Rules-Based Inclusion
- [ ] **Automatic Matching**
  - [ ] Backend calculates matches on overlay save
  - [ ] Frontend shows matched transactions with "Auto-included" badge
- [ ] **Override Options**
  - [ ] In overlay detail, each transaction has:
    - [ ] Auto-included → "Exclude" button
    - [ ] Not matched → "+ Include" button
  - [ ] Override badges: "Manually excluded" / "Manually included"

### 5.6 Include Everything Mode
- [ ] **Auto-Inclusion**
  - [ ] All transactions in date range auto-included
  - [ ] Show "Auto-included" badge
- [ ] **Exclusion**
  - [ ] Each transaction has "Exclude" button
  - [ ] Excluded transactions show "Manually excluded" badge
  - [ ] Can re-include later

---

## Phase 6: Polish & Edge Cases (Week 7)

### 6.1 Auto-Switch Logic
- [ ] **Period Auto-Switch**
  - [ ] On page load, check if today is outside selected period
  - [ ] If yes, switch to current period (period containing today)
  - [ ] If no current period, show No Period state
  - [ ] Toast notification: "Switched to [Period Name]"
- [ ] **User Override**
  - [ ] User can manually select any period
  - [ ] Persist selection in session
  - [ ] But auto-switch on next day if appropriate

### 6.2 Loading States
- [ ] **Period Picker Loading**
  - [ ] Skeleton for period list
  - [ ] Spinner on period switch
- [ ] **Overlays Loading**
  - [ ] Skeleton cards
  - [ ] Banner loading state
- [ ] **Form Submissions**
  - [ ] Disable buttons during submit
  - [ ] Loading spinner on button
  - [ ] Success feedback

### 6.3 Empty States
- [ ] **No Periods Yet**
  - [ ] Illustration or icon
  - [ ] Helpful message
  - [ ] "Create Your First Period" CTA
- [ ] **No Overlays Yet**
  - [ ] Illustration
  - [ ] Explanation of overlays
  - [ ] "Create Your First Overlay" CTA
- [ ] **No Transactions in Period**
  - [ ] Empty state in transactions list
  - [ ] Encourage adding transactions

### 6.4 Error States
- [ ] **Overlap Error**
  - [ ] Clear error message with dates
  - [ ] Visual timeline showing conflict
  - [ ] Suggestion to adjust dates
- [ ] **Network Errors**
  - [ ] Retry buttons
  - [ ] Offline indicators
- [ ] **Validation Errors**
  - [ ] Inline field errors
  - [ ] Summary at top of form

### 6.5 Responsive Breakpoints
- [ ] **Test all screens at:**
  - [ ] 320px (small mobile)
  - [ ] 375px (standard mobile)
  - [ ] 768px (tablet)
  - [ ] 1024px (small desktop)
  - [ ] 1440px+ (large desktop)

### 6.6 Accessibility
- [ ] **Keyboard Navigation**
  - [ ] Period picker navigable with arrows
  - [ ] Modal forms tab-friendly
  - [ ] Focus indicators
- [ ] **Screen Reader**
  - [ ] ARIA labels for all interactive elements
  - [ ] Announce period switches
  - [ ] Describe visual progress indicators
- [ ] **Color Contrast**
  - [ ] Warning texts meet WCAG AA
  - [ ] Badges readable

---

## Phase 7: Integration & Testing (Week 8)

### 7.1 API Integration
- [ ] **Period Endpoints**
  - [ ] GET /periods (list with filters)
  - [ ] POST /periods (create manual)
  - [ ] PUT /periods/:id (edit manual)
  - [ ] DELETE /periods/:id
  - [ ] GET /periods/current
  - [ ] POST /periods/schedule (configure)
  - [ ] PUT /periods/schedule
  - [ ] DELETE /periods/schedule
- [ ] **Overlay Endpoints**
  - [ ] GET /overlays (list)
  - [ ] POST /overlays (create)
  - [ ] PUT /overlays/:id
  - [ ] DELETE /overlays/:id
  - [ ] GET /overlays/:id/transactions
  - [ ] POST /overlays/:id/transactions/:txId/include
  - [ ] DELETE /overlays/:id/transactions/:txId/exclude

### 7.2 State Management
- [ ] **Period State**
  - [ ] Current period ID
  - [ ] Period list cache
  - [ ] Schedule config
- [ ] **Overlay State**
  - [ ] Active overlays
  - [ ] Current overlay (if viewing detail)
  - [ ] Transaction memberships

### 7.3 Testing Checklist
- [ ] **Period Flows**
  - [ ] Create period (manual)
  - [ ] Edit period dates (verify transaction recalculation)
  - [ ] Delete period
  - [ ] Switch periods (verify filtering)
  - [ ] Enable schedule
  - [ ] Edit schedule
  - [ ] Disable schedule
  - [ ] No Period warning appears correctly
  - [ ] Fix No Period flow
  - [ ] Auto-switch on date change
- [ ] **Overlay Flows**
  - [ ] Create overlay (all 3 inclusion modes)
  - [ ] Edit overlay
  - [ ] Delete overlay
  - [ ] Manual include/exclude transactions
  - [ ] Rules matching works correctly
  - [ ] Include Everything mode auto-includes
  - [ ] Total cap tracking
  - [ ] Category cap tracking
  - [ ] Overspend warnings
  - [ ] Banner shows/hides correctly
  - [ ] Multiple active overlays
- [ ] **Edge Cases**
  - [ ] Overlap validation
  - [ ] Weekend adjustments
  - [ ] Month-end date handling (Feb 29, etc.)
  - [ ] Transfer exclusion from overlays
  - [ ] Ended overlay read-only

---

## Design Decisions Needed

### Priority 1 (Blocking)
1. **Period Chip Style**: Expand in place or dropdown? Mobile bottom sheet height?
2. **Navigation**: Where do Periods and Overlays live in the menu?
3. **Banner Position**: Overlay banner above or below period chip?
4. **No Period Warning**: Banner, card, or badge?

### Priority 2 (Nice to Have)
5. **Overlay Icons**: Use emojis, custom icons, or color codes?
6. **Schedule UI**: Wizard or single-page form?
7. **Period Names**: Show inline or tooltip?
8. **Mobile FAB**: Single FAB that opens menu, or separate FABs?

### Open Questions from PRD
9. **Overlay Names**: Unique or allow duplicates?
10. **Overlay End Date**: Required or allow indefinite?
11. **Category Cap Inheritance**: Auto-inherit from base budget?

---

## Technical Notes

### Transfers Handling
- Blue styling (consistent across app)
- Excluded from overlay spend totals
- Same logic as main budget

### Date Handling
- All dates in UTC? Or user timezone?
- Date range: `[start_date, end_date)` (inclusive start, exclusive end)
- Weekend adjustments happen after month-end fallback

### Performance Considerations
- Period list can grow large (years of data)
- Virtual scrolling for period picker?
- Lazy load past periods
- Cache transaction counts per period

---

## Next Steps

1. **Review and approve TODO structure**
2. **Answer design decisions (Priority 1)**
3. **Create high-fidelity mockups for key screens**
4. **Iterate on designs based on feedback**
5. **Begin implementation phase-by-phase**

---

**Last Updated**: 2026-02-05  
**Status**: Ready for review and design phase
