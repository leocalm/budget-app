import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Vendor, VendorInput } from '@/types/vendor';
import { apiPost, apiPut } from './client';
import { createVendor, updateVendor } from './vendor';

vi.mock('./client', () => ({
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiGet: vi.fn(),
  apiDelete: vi.fn(),
}));

describe('vendor api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a vendor via /api/vendors', async () => {
    const payload: VendorInput = { name: 'Coffee Shop' };
    const response: Vendor = { id: 'ven-1', name: 'Coffee Shop' };

    const apiPostMock = vi.mocked(apiPost);
    apiPostMock.mockResolvedValueOnce(response);

    await expect(createVendor(payload)).resolves.toEqual(response);
    expect(apiPostMock).toHaveBeenCalledWith('/api/vendors', payload);
  });

  it('updates a vendor via /api/vendors/:id', async () => {
    const payload: VendorInput = { name: 'Corner Store' };
    const response: Vendor = { id: 'ven-2', name: 'Corner Store' };

    const apiPutMock = vi.mocked(apiPut);
    apiPutMock.mockResolvedValueOnce(response);

    await expect(updateVendor('ven-2', payload)).resolves.toEqual(response);
    expect(apiPutMock).toHaveBeenCalledWith('/api/vendors/ven-2', payload);
  });
});
