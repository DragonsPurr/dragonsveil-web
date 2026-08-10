import {
  brandDomainFromUrl,
  buildBrandfetchAssetUrl,
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
    expect(brandDomainFromUrl('https://cara.app/someone')).toBe('cara.app');
    expect(brandDomainFromUrl('not-a-url')).toBeNull();
  });

  it('builds ordered Brandfetch candidates including logo for Cara-like brands', () => {
    process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID = 'client-123';
    expect(buildBrandfetchIconUrls('cara.app')).toEqual({
      candidates: [
        'https://cdn.brandfetch.io/cara.app/theme/dark/fallback/404/symbol.svg?c=client-123',
        'https://cdn.brandfetch.io/cara.app/w/64/h/64/theme/dark/fallback/404/icon.png?c=client-123',
        'https://cdn.brandfetch.io/cara.app/theme/dark/fallback/404/logo.svg?c=client-123',
        'https://cdn.brandfetch.io/cara.app/w/64/h/64/theme/dark/fallback/404/logo.png?c=client-123',
      ],
    });
  });

  it('builds a selected Brandfetch asset URL', () => {
    process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID = 'client-123';
    expect(
      buildBrandfetchAssetUrl('cara.app', { type: 'logo', theme: 'dark', format: 'svg' }),
    ).toBe('https://cdn.brandfetch.io/cara.app/theme/dark/fallback/404/logo.svg?c=client-123');
  });

  it('returns null when client ID is missing', () => {
    delete process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID;
    expect(buildBrandfetchIconUrls('instagram.com')).toBeNull();
  });
});
