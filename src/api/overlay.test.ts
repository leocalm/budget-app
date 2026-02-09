import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OverlayRequest } from '@/types/overlay';
import { apiDelete, apiGet, apiPost, apiPut } from './client';
import { createOverlay, deleteOverlay, fetchOverlays, updateOverlay } from './overlay';

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
});
