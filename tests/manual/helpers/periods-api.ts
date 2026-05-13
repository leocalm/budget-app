import { expect, type APIRequestContext } from 'playwright/test';
import { e2eEnv } from '../../setup/env';

export type PeriodStatus = 'active' | 'upcoming' | 'past';
export type PeriodType = 'Duration' | 'ManualEndDate';
export type DurationUnit = 'days' | 'weeks' | 'months';

export interface PeriodSummary {
  id: string;
  name: string;
  startDate: string;
  length: number;
  status?: PeriodStatus;
}

export interface CreatePeriodApiOpts {
  name: string;
  /** ISO date string, e.g. "2026-01-01" */
  startDate: string;
  periodType?: PeriodType;
  /** For Duration-type periods — number of units */
  durationUnits?: number;
  /** For Duration-type periods — unit of duration */
  durationUnit?: DurationUnit;
  /** For ManualEndDate-type periods — ISO date string */
  endDate?: string;
}

export interface ScheduleSummary {
  id?: string;
  scheduleType?: 'manual' | 'automatic';
  recurrenceMethod?: 'dayOfMonth' | 'businessDay' | 'dayOfWeek';
  startDayOfTheMonth?: number;
  periodDuration?: number;
  generateAhead?: number;
  durationUnit?: DurationUnit;
  saturdayPolicy?: 'keep' | 'monday' | 'friday';
  sundayPolicy?: 'keep' | 'monday' | 'friday';
  namePattern?: string;
}

/**
 * Returns all periods for the current user.
 * Handles both plain-array and paginated `{ data: [] }` response shapes.
 */
export async function getPeriodsViaApi(pageRequest: APIRequestContext): Promise<PeriodSummary[]> {
  const res = await pageRequest.get(`${e2eEnv.baseUrl}/v2/periods`);
  expect(res.ok(), `GET /v2/periods failed: ${await res.text()}`).toBeTruthy();

  const body = await res.json();
  const items: PeriodSummary[] = Array.isArray(body) ? body : (body.data ?? []);
  return items;
}

/**
 * Creates a period via the API proxy and returns its id.
 *
 * The form sends `periodType: 'Duration' | 'ManualEndDate'` (PascalCase) and
 * nests duration info as `{ duration: { durationUnits, durationUnit } }`.
 */
export async function createPeriodViaApi(
  pageRequest: APIRequestContext,
  opts: CreatePeriodApiOpts
): Promise<{ id: string }> {
  const periodType = opts.periodType ?? 'Duration';

  let body: Record<string, unknown>;

  if (periodType === 'Duration') {
    body = {
      name: opts.name,
      startDate: opts.startDate,
      periodType,
      duration: {
        durationUnits: opts.durationUnits ?? 30,
        durationUnit: opts.durationUnit ?? 'days',
      },
    };
  } else {
    if (!opts.endDate) {
      throw new Error('createPeriodViaApi: endDate is required for ManualEndDate periods');
    }
    body = {
      name: opts.name,
      startDate: opts.startDate,
      periodType,
      manualEndDate: opts.endDate,
    };
  }

  const res = await pageRequest.post(`${e2eEnv.baseUrl}/v2/periods`, { data: body });

  if (!res.ok()) {
    throw new Error(`createPeriodViaApi failed: ${res.status()} ${await res.text()}`);
  }

  const json = (await res.json()) as { id: string };
  return { id: json.id };
}

/**
 * Deletes a period via the API proxy.
 * Returns { ok, status, body } so tests can inspect backend rejection without
 * throwing.
 */
export async function deletePeriodViaApi(
  pageRequest: APIRequestContext,
  id: string
): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await pageRequest.delete(`${e2eEnv.baseUrl}/v2/periods/${id}`);
  const body = await res.text();
  return { ok: res.ok(), status: res.status(), body };
}

/**
 * Returns the current user's period schedule, or null if none exists (404).
 */
export async function getScheduleViaApi(
  pageRequest: APIRequestContext
): Promise<ScheduleSummary | null> {
  const res = await pageRequest.get(`${e2eEnv.baseUrl}/v2/periods/schedule`);
  if (res.status() === 404) {
    return null;
  }
  expect(res.ok(), `GET /v2/periods/schedule failed: ${await res.text()}`).toBeTruthy();
  return (await res.json()) as ScheduleSummary;
}

/**
 * Deletes the period schedule. Ignores 404 (idempotent).
 */
export async function deleteScheduleViaApi(pageRequest: APIRequestContext): Promise<void> {
  const res = await pageRequest.delete(`${e2eEnv.baseUrl}/v2/periods/schedule`);
  if (res.status() === 404) {
    return;
  }
  if (!res.ok()) {
    throw new Error(`deleteScheduleViaApi failed: ${res.status()} ${await res.text()}`);
  }
}

/**
 * Disables auto-generation and deletes every existing period for the current
 * user so a test can start with a clean slate. Onboarding always seeds a
 * schedule plus a current period and a handful of future periods, which
 * would otherwise cause overlap-rejection (5xx) on any new period whose
 * date range falls in that window.
 *
 * Returns the list of period ids that were deleted (mainly for diagnostics).
 */
export async function clearPeriodState(pageRequest: APIRequestContext): Promise<string[]> {
  await deleteScheduleViaApi(pageRequest);
  const periods = await getPeriodsViaApi(pageRequest);
  const deleted: string[] = [];
  for (const p of periods) {
    const res = await deletePeriodViaApi(pageRequest, p.id);
    if (res.ok) {
      deleted.push(p.id);
    }
  }
  return deleted;
}

/**
 * Creates a period that covers today (status === 'active') for tests that
 * need a current period after a `clearPeriodState` cleanup. Defaults to a
 * 30-day duration starting today.
 */
export async function seedCurrentPeriod(
  pageRequest: APIRequestContext,
  opts: { name: string; durationDays?: number } = { name: 'Current' }
): Promise<{ id: string }> {
  const today = new Date().toISOString().slice(0, 10);
  return createPeriodViaApi(pageRequest, {
    name: opts.name,
    startDate: today,
    periodType: 'Duration',
    durationUnits: opts.durationDays ?? 30,
    durationUnit: 'days',
  });
}
