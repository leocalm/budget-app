import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as client from './client';
import { fetchTransactionsPage } from './transaction';

vi.mock('./client', () => ({ apiGetRaw: vi.fn() }));
const mockApiGetRaw = vi.mocked(client.apiGetRaw);

describe('fetchTransactionsPage filter serialization', () => {
  beforeEach(() => {
    mockApiGetRaw.mockResolvedValue({ transactions: [], nextCursor: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('appends account_id params', async () => {
    await fetchTransactionsPage({
      selectedPeriodId: null,
      filters: { accountIds: ['abc', 'def'] },
    });
    const url = mockApiGetRaw.mock.calls[0][0] as string;
    expect(url).toContain('account_id=abc');
    expect(url).toContain('account_id=def');
  });

  it('omits direction=all', async () => {
    await fetchTransactionsPage({
      selectedPeriodId: null,
      filters: { direction: 'all' },
    });
    const url = mockApiGetRaw.mock.calls[0][0] as string;
    expect(url).not.toContain('direction');
  });

  it('includes direction when not all', async () => {
    await fetchTransactionsPage({
      selectedPeriodId: null,
      filters: { direction: 'Outgoing' },
    });
    const url = mockApiGetRaw.mock.calls[0][0] as string;
    expect(url).toContain('direction=Outgoing');
  });
});
