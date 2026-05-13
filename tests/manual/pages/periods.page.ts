import { expect, type Locator, type Page } from 'playwright/test';

export type PeriodType = 'Duration' | 'ManualEndDate';
export type DurationUnit = 'days' | 'weeks' | 'months';
export type RecurrenceMethod = 'dayOfMonth' | 'businessDay' | 'dayOfWeek';
export type WeekendPolicy = 'keep' | 'monday' | 'friday';

export interface CreateDurationPeriodOpts {
  name: string;
  startDate: string;
  durationUnits?: number;
  durationUnit?: DurationUnit;
}

export interface CreateManualEndPeriodOpts {
  name: string;
  startDate: string;
  endDate: string;
}

export class PeriodsPage {
  constructor(private readonly page: Page) {}

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  async goto(): Promise<void> {
    await this.page.goto('/periods');
    await expect(this.page.getByTestId('periods-add-button')).toBeVisible({ timeout: 15000 });
  }

  // ---------------------------------------------------------------------------
  // Form drawer — open / field fills
  // ---------------------------------------------------------------------------

  async clickAdd(): Promise<void> {
    await this.page.getByTestId('periods-add-button').click();
  }

  async fillName(name: string): Promise<void> {
    await this.page.getByTestId('period-name-input').fill(name);
  }

  async fillStartDate(yyyymmdd: string): Promise<void> {
    await this.page.getByTestId('period-start-date').fill(yyyymmdd);
  }

  async fillEndDate(yyyymmdd: string): Promise<void> {
    // Only visible when periodType === 'ManualEndDate'
    await this.page.getByTestId('period-end-date').fill(yyyymmdd);
  }

  async selectPeriodType(type: PeriodType): Promise<void> {
    const label = type === 'Duration' ? /Duration-based/i : /Manual end date/i;
    await this.selectMantineOption(this.page.getByTestId('period-type-select'), label);
  }

  async fillDurationUnits(n: number): Promise<void> {
    await this.clearAndType(this.page.getByTestId('period-duration-units'), String(n));
  }

  async selectDurationUnit(unit: DurationUnit): Promise<void> {
    // Option labels are capitalised in the UI: Days / Weeks / Months
    const label = unit.charAt(0).toUpperCase() + unit.slice(1);
    await this.selectMantineOption(this.page.getByTestId('period-duration-unit'), label);
  }

  async submitForm(): Promise<void> {
    await this.page.getByTestId('period-form-submit').click();
  }

  // ---------------------------------------------------------------------------
  // Form drawer — state assertions
  // ---------------------------------------------------------------------------

  async expectFormVisible(): Promise<void> {
    // Mantine Drawer lazy-mounts its content; assert on an inner element.
    await expect(this.page.getByTestId('period-name-input')).toBeVisible({ timeout: 10000 });
  }

  async expectFormClosed(): Promise<void> {
    await expect(this.page.getByTestId('period-name-input')).toBeHidden({ timeout: 15000 });
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.page.getByTestId('period-form-submit')).toBeDisabled();
  }

  async expectSubmitEnabled(): Promise<void> {
    await expect(this.page.getByTestId('period-form-submit')).toBeEnabled();
  }

  // ---------------------------------------------------------------------------
  // Composite create helpers
  // ---------------------------------------------------------------------------

  async createDurationPeriod(opts: CreateDurationPeriodOpts): Promise<void> {
    await this.clickAdd();
    await this.expectFormVisible();
    await this.fillName(opts.name);
    await this.fillStartDate(opts.startDate);
    await this.selectPeriodType('Duration');
    if (opts.durationUnits !== undefined) {
      await this.fillDurationUnits(opts.durationUnits);
    }
    if (opts.durationUnit !== undefined) {
      await this.selectDurationUnit(opts.durationUnit);
    }
    await this.submitForm();
    await this.expectFormClosed();
  }

  async createManualEndPeriod(opts: CreateManualEndPeriodOpts): Promise<void> {
    await this.clickAdd();
    await this.expectFormVisible();
    await this.fillName(opts.name);
    await this.fillStartDate(opts.startDate);
    await this.selectPeriodType('ManualEndDate');
    await this.fillEndDate(opts.endDate);
    await this.submitForm();
    await this.expectFormClosed();
  }

  // ---------------------------------------------------------------------------
  // Period cards
  // ---------------------------------------------------------------------------

  periodCard(id: string): Locator {
    return this.page.getByTestId(`period-card-${id}`);
  }

  periodCardByName(name: string): Locator {
    return this.page.locator(`[data-testid^="period-card-"]:has-text("${name}")`).first();
  }

  async openCardMenu(id: string): Promise<void> {
    await this.page.getByTestId(`period-card-${id}-menu`).click();
  }

  async clickEditFromMenu(): Promise<void> {
    await this.page.getByTestId('period-menu-edit').click();
  }

  async clickDeleteFromMenu(): Promise<void> {
    await this.page.getByTestId('period-menu-delete').click();
  }

  async confirmDelete(): Promise<void> {
    // Mantine Modal lazy-mounts; wait on the confirm button before clicking.
    await expect(this.page.getByTestId('confirm-delete-confirm')).toBeVisible({ timeout: 5000 });
    await this.page.getByTestId('confirm-delete-confirm').click();
    await expect(this.page.getByTestId('confirm-delete-confirm')).toBeHidden({ timeout: 10000 });
  }

  async cancelDelete(): Promise<void> {
    await this.page.getByTestId('confirm-delete-cancel').click();
  }

  // ---------------------------------------------------------------------------
  // Schedule drawer
  // ---------------------------------------------------------------------------

  async openScheduleDrawer(): Promise<void> {
    await this.page.getByTestId('periods-schedule-pill').click();
  }

  async expectScheduleVisible(): Promise<void> {
    // Drawer lazy-mounts; assert on an inner element.
    await expect(this.page.getByTestId('schedule-enable-switch')).toBeVisible({ timeout: 10000 });
  }

  async expectScheduleClosed(): Promise<void> {
    await expect(this.page.getByTestId('schedule-enable-switch')).toBeHidden({ timeout: 15000 });
  }

  async toggleScheduleEnabled(desiredState: boolean): Promise<void> {
    const sw = this.page.getByTestId('schedule-enable-switch');
    const current = await sw.isChecked();
    if (current !== desiredState) {
      await sw.click();
    }
  }

  async selectRecurrence(method: RecurrenceMethod): Promise<void> {
    await this.page.getByTestId(`schedule-recurrence-${method}`).click();
  }

  async fillStartDayOfMonth(n: number): Promise<void> {
    await this.clearAndType(this.page.getByTestId('schedule-start-day-month'), String(n));
  }

  async fillStartBusinessDay(n: number): Promise<void> {
    await this.clearAndType(this.page.getByTestId('schedule-start-day-business'), String(n));
  }

  async selectDayOfWeek(
    dow: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  ): Promise<void> {
    await this.selectMantineOption(this.page.getByTestId('schedule-start-day-week'), dow);
  }

  async fillPeriodLength(n: number): Promise<void> {
    await this.clearAndType(this.page.getByTestId('schedule-period-length'), String(n));
  }

  async selectScheduleDurationUnit(unit: DurationUnit): Promise<void> {
    const label = unit.charAt(0).toUpperCase() + unit.slice(1);
    await this.selectMantineOption(this.page.getByTestId('schedule-duration-unit'), label);
  }

  async fillGenerateAhead(n: number): Promise<void> {
    await this.clearAndType(this.page.getByTestId('schedule-generate-ahead'), String(n));
  }

  async selectSaturdayPolicy(p: WeekendPolicy): Promise<void> {
    await this.selectWeekendPolicy('schedule-saturday-policy', p);
  }

  async selectSundayPolicy(p: WeekendPolicy): Promise<void> {
    await this.selectWeekendPolicy('schedule-sunday-policy', p);
  }

  async fillNamePattern(s: string): Promise<void> {
    const input = this.page.getByTestId('schedule-name-pattern');
    await input.click({ clickCount: 3 });
    await input.fill(s);
  }

  async submitSchedule(): Promise<void> {
    await this.page.getByTestId('schedule-save').click();
  }

  // ---------------------------------------------------------------------------
  // Period selector
  // ---------------------------------------------------------------------------

  async openPeriodSelector(): Promise<void> {
    // The sidebar uses data-testid="period-selector" as the trigger pill.
    await this.page.getByTestId('period-selector').click();
  }

  async expectPeriodSelectorVisible(): Promise<void> {
    // Desktop opens a Popover, mobile a Drawer — both render the same
    // PeriodDropdown with testid `period-dropdown`.
    await expect(this.page.getByTestId('period-dropdown')).toBeVisible({ timeout: 10000 });
  }

  async selectPeriodInSelector(name: string): Promise<void> {
    const dropdown = this.page.getByTestId('period-dropdown');
    await dropdown.getByText(name).first().click();
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async clearAndType(input: Locator, value: string): Promise<void> {
    // Mantine NumberInput wraps react-number-format which intercepts user
    // input, so Locator.fill() / pressSequentially can be inconsistent on
    // pre-populated fields. Drive the native input setter + dispatch the
    // input event the way React's synthetic-event system expects.
    await input.evaluate((el: HTMLInputElement, val: string) => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      setter?.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
    await input.press('Tab');
  }

  private async selectMantineOption(input: Locator, optionLabel: string | RegExp): Promise<void> {
    // Mantine v8 Select is a combobox-style input. Click to open, then click
    // the matching option in the portal-rendered listbox.
    await input.click();
    await this.page.getByRole('option', { name: optionLabel }).first().click();
  }

  private async selectWeekendPolicy(testId: string, policy: WeekendPolicy): Promise<void> {
    // Map internal policy values to their visible labels
    const labelMap: Record<WeekendPolicy, RegExp> = {
      keep: /keep as.is/i,
      monday: /move.*monday/i,
      friday: /move.*friday/i,
    };
    await this.selectMantineOption(this.page.getByTestId(testId), labelMap[policy]);
  }
}
