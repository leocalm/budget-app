import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Vendor, VendorInput, VendorWithStats } from '@/types/vendor';
import { apiGetRaw, apiPost, apiPut } from './client';
import { createVendor, fetchVendorsPage, updateVendor } from './vendor';

vi.mock('./client', () => ({
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiGet: vi.fn(),
  apiGetRaw: vi.fn(),
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

  it('fetches paginated vendors with cursor', async () => {
    const vendors: VendorWithStats[] = [
      { id: 'ven-1', name: 'Shop 1', transactionCount: 5, lastUsedAt: '2025-01-01' },
      { id: 'ven-2', name: 'Shop 2', transactionCount: 3, lastUsedAt: '2025-01-02' },
    ];

    const mockResponse = {
      items: vendors,
      nextCursor: 'cursor-next',
    };

    const apiGetRawMock = vi.mocked(apiGetRaw);
    apiGetRawMock.mockResolvedValueOnce(mockResponse);

    const result = await fetchVendorsPage({
      periodId: 'period-1',
      cursor: 'cursor-start',
      pageSize: 50,
    });

    expect(result).toEqual(mockResponse);
    expect(apiGetRawMock).toHaveBeenCalledWith(
      '/api/vendors?period_id=period-1&page_size=50&cursor=cursor-start'
    );
  });

  it('parses array response from paginated vendors endpoint', async () => {
    const vendors: VendorWithStats[] = [{ id: 'ven-1', name: 'Shop 1', transactionCount: 5 }];

    const apiGetRawMock = vi.mocked(apiGetRaw);
    apiGetRawMock.mockResolvedValueOnce(vendors as unknown);

    const result = await fetchVendorsPage({ periodId: null, pageSize: 50 });

    expect(result).toEqual({ items: vendors, nextCursor: null });
  });

  it('parses payload.items structure from paginated vendors endpoint', async () => {
    const vendors: VendorWithStats[] = [{ id: 'ven-1', name: 'Shop 1', transactionCount: 5 }];

    const mockResponse = {
      items: vendors,
      nextCursor: 'next-cursor',
    };

    const apiGetRawMock = vi.mocked(apiGetRaw);
    apiGetRawMock.mockResolvedValueOnce(mockResponse);

    const result = await fetchVendorsPage({ periodId: null, pageSize: 50 });

    expect(result).toEqual(mockResponse);
  });
});
