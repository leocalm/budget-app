import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OverlayRequest } from '@/types/overlay';
import { apiDelete, apiGet, apiPost, apiPut } from './client';
import {
  createOverlay,
  deleteOverlay,
  excludeOverlayTransaction,
  fetchOverlay,
  fetchOverlays,
  fetchOverlayTransactions,
  includeOverlayTransaction,
  updateOverlay,
} from './overlay';

vi.mock('./client', () => ({
  apiPost: vi.fn(),
  apiGet: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

describe('overlay api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches overlays via /api/overlays', async () => {
    const response = [
      {
        id: 'overlay-1',
        name: 'Italy Trip',
        startDate: '2026-08-10',
        endDate: '2026-08-20',
        inclusionMode: 'manual' as const,
      },
    ];

    vi.mocked(apiGet).mockResolvedValueOnce(response);

    await expect(fetchOverlays()).resolves.toEqual(response);
    expect(apiGet).toHaveBeenCalledWith('/api/overlays');
  });

  it('creates an overlay via /api/overlays', async () => {
    const payload: OverlayRequest = {
      name: 'Holiday Shopping',
      startDate: '2026-12-01',
      endDate: '2026-12-25',
      inclusionMode: 'rules',
      rules: {
        categoryIds: ['category-1'],
        vendorIds: [],
        accountIds: [],
      },
      totalCapAmount: 50000,
      categoryCaps: [],
    };

    vi.mocked(apiPost).mockResolvedValueOnce({ id: 'overlay-2', ...payload });

    await createOverlay(payload);

    expect(apiPost).toHaveBeenCalledWith('/api/overlays', payload);
  });

  it('fetches overlay by id via /api/overlays/:id', async () => {
    const response = {
      id: 'overlay-1',
      name: 'Italy Trip',
      startDate: '2026-08-10',
      endDate: '2026-08-20',
      inclusionMode: 'manual' as const,
    };

    vi.mocked(apiGet).mockResolvedValueOnce(response);

    await expect(fetchOverlay('overlay-1')).resolves.toEqual(response);
    expect(apiGet).toHaveBeenCalledWith('/api/overlays/overlay-1');
  });

  it('fetches overlay transactions by overlay id', async () => {
    const response = [
      {
        id: 'tx-1',
        description: 'Flight',
        amount: 12000,
        occurredAt: '2026-08-11',
        category: {
          id: 'cat-1',
          name: 'Travel',
          color: '#00d4ff',
          icon: '✈️',
          categoryType: 'Outgoing' as const,
        },
        fromAccount: { id: 'acc-1', name: 'Main', color: '#00d4ff', icon: '💳' },
        toAccount: null,
        vendor: null,
        membership: { isIncluded: true, inclusionSource: 'manual' as const },
      },
    ];

    vi.mocked(apiGet).mockResolvedValueOnce(response);

    await expect(fetchOverlayTransactions('overlay-1')).resolves.toEqual(response);
    expect(apiGet).toHaveBeenCalledWith('/api/overlays/overlay-1/transactions');
  });

  it('updates an overlay by id', async () => {
    const payload: OverlayRequest = {
      name: 'Updated Overlay',
      startDate: '2026-08-10',
      endDate: '2026-08-20',
      inclusionMode: 'all',
      totalCapAmount: null,
      categoryCaps: [],
      rules: null,
    };

    vi.mocked(apiPut).mockResolvedValueOnce({ id: 'overlay-1', ...payload });

    await updateOverlay('overlay-1', payload);

    expect(apiPut).toHaveBeenCalledWith('/api/overlays/overlay-1', payload);
  });

  it('deletes an overlay by id', async () => {
    vi.mocked(apiDelete).mockResolvedValueOnce(undefined);

    await deleteOverlay('overlay-1');

    expect(apiDelete).toHaveBeenCalledWith('/api/overlays/overlay-1');
  });

  it('includes a transaction in an overlay', async () => {
    vi.mocked(apiPost).mockResolvedValueOnce(undefined);

    await includeOverlayTransaction('overlay-1', 'tx-1');

    expect(apiPost).toHaveBeenCalledWith('/api/overlays/overlay-1/transactions/tx-1/include', {});
  });

  it('excludes a transaction from an overlay', async () => {
    vi.mocked(apiDelete).mockResolvedValueOnce(undefined);

    await excludeOverlayTransaction('overlay-1', 'tx-1');

    expect(apiDelete).toHaveBeenCalledWith('/api/overlays/overlay-1/transactions/tx-1/exclude');
  });
});
