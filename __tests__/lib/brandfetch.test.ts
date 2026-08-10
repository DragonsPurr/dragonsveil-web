import {
  brandDomainFromUrl,
  buildBrandfetchIconUrls,
  normalizeBrandDomain,
} from '@/app/lib/brandfetch';

describe('brandfetch helpers', () => {
  const originalClientId = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID;

  afterEach(() => {
    if (originalClientId === undefined) {
      delete process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID;
    } else {
      process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID = originalClientId;
    }
  });

  it('normalizes domains and strips www', () => {
    expect(normalizeBrandDomain('WWW.Instagram.com')).toBe('instagram.com');
    expect(normalizeBrandDomain('  discord.com  ')).toBe('discord.com');
    expect(normalizeBrandDomain('https://bad')).toBeNull();
  });

  it('derives brand domain from a profile URL', () => {
    expect(brandDomainFromUrl('https://www.instagram.com/dragonsveil')).toBe('instagram.com');
    expect(brandDomainFromUrl('not-a-url')).toBeNull();
  });

  it('builds transparent SVG + PNG Brandfetch URLs when client ID is set', () => {
    process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID = 'client-123';
    expect(buildBrandfetchIconUrls('instagram.com')).toEqual({
      svgSrc:
        'https://cdn.brandfetch.io/domain/instagram.com/theme/light/type/symbol/fallback/transparent.svg?c=client-123',
      pngSrc:
        'https://cdn.brandfetch.io/domain/instagram.com/w/64/h/64/theme/light/type/icon/fallback/transparent.png?c=client-123',
    });
  });

  it('returns null when client ID is missing', () => {
    delete process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID;
    expect(buildBrandfetchIconUrls('instagram.com')).toBeNull();
  });
});
