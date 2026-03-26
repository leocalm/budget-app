import type { components } from '@/api/v2';

export type AccountDetailsData = components['schemas']['AccountDetailsResponse'];

/**
 * Extends AccountDetailsResponse with `spendLimit`, which lives on AccountResponse
 * but is not yet part of AccountDetailsResponse in the generated spec.
 *
 * Remove `spendLimit` from this extension once the backend includes it in
 * the details endpoint and v2.d.ts is regenerated.
 */
export type AccountExt = AccountDetailsData & {
  spendLimit?: number | null;
};
