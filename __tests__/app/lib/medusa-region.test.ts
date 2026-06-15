const mockRegionList = jest.fn();

jest.mock('@/app/lib/medusa', () => ({
  isMedusaConfigured: jest.fn(() => true),
  sdk: {
    store: {
      region: {
        list: (...args: unknown[]) => mockRegionList(...args),
      },
    },
  },
}));

import { getDefaultRegionId } from '@/app/lib/medusa-region';

describe('getDefaultRegionId', () => {
  const originalRegionId = process.env.MEDUSA_DEFAULT_REGION_ID;

  afterEach(() => {
    mockRegionList.mockReset();
    if (originalRegionId === undefined) {
      delete process.env.MEDUSA_DEFAULT_REGION_ID;
    } else {
      process.env.MEDUSA_DEFAULT_REGION_ID = originalRegionId;
    }
  });

  it('returns MEDUSA_DEFAULT_REGION_ID without calling the Medusa API', async () => {
    process.env.MEDUSA_DEFAULT_REGION_ID = 'reg_cad';

    await expect(getDefaultRegionId()).resolves.toBe('reg_cad');
    expect(mockRegionList).not.toHaveBeenCalled();
  });

  it('ignores blank MEDUSA_DEFAULT_REGION_ID and falls back to the first region', async () => {
    process.env.MEDUSA_DEFAULT_REGION_ID = '   ';
    mockRegionList.mockResolvedValue({ regions: [{ id: 'reg_eur' }] });

    await expect(getDefaultRegionId()).resolves.toBe('reg_eur');
    expect(mockRegionList).toHaveBeenCalledWith({ limit: 1 });
  });

  it('falls back to the first region when MEDUSA_DEFAULT_REGION_ID is unset', async () => {
    delete process.env.MEDUSA_DEFAULT_REGION_ID;
    mockRegionList.mockResolvedValue({ regions: [{ id: 'reg_eur' }] });

    await expect(getDefaultRegionId()).resolves.toBe('reg_eur');
    expect(mockRegionList).toHaveBeenCalledWith({ limit: 1 });
  });
});
