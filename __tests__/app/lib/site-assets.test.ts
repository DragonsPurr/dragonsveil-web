import {
  buildSiteAssetUrl,
  isAllowedSiteAssetObjectKey,
  SITE_ASSETS_PROXY_BASE,
} from '@/app/lib/site-assets';

describe('site-assets', () => {
  it('builds same-origin proxy URLs', () => {
    expect(buildSiteAssetUrl('brand/dragonspurr_square-for-dark-bg.png')).toBe(
      `${SITE_ASSETS_PROXY_BASE}/brand/dragonspurr_square-for-dark-bg.png`,
    );
    expect(buildSiteAssetUrl('eeby-deeby-404.jpg')).toBe(
      `${SITE_ASSETS_PROXY_BASE}/eeby-deeby-404.jpg`,
    );
  });

  it('allows brand assets and root-level images', () => {
    expect(isAllowedSiteAssetObjectKey('brand/wide-logo-for-dark-bkgds.png')).toBe(true);
    expect(isAllowedSiteAssetObjectKey('eeby-deeby-404.jpg')).toBe(true);
  });

  it('rejects traversal and unexpected paths', () => {
    expect(isAllowedSiteAssetObjectKey('../secret.txt')).toBe(false);
    expect(isAllowedSiteAssetObjectKey('avatars/cus_1/1.jpg')).toBe(false);
    expect(isAllowedSiteAssetObjectKey('brand/nested/logo.png')).toBe(false);
  });
});
