export const SITE_ASSETS_PROXY_BASE = '/api/assets';

const DEFAULT_PUBLIC_BASE = 'https://dp-dv-assets.s3.ca-east-tor.io.cloud.ovh.net';

export function getSiteAssetsPublicBaseUrl(): string {
  const base = process.env.OVH_SITE_ASSETS_PUBLIC_URL?.trim() || DEFAULT_PUBLIC_BASE;
  return base.replace(/\/$/, '');
}

export function buildSiteAssetUrl(objectKey: string): string {
  const encodedKey = objectKey.split('/').map(encodeURIComponent).join('/');
  return `${SITE_ASSETS_PROXY_BASE}/${encodedKey}`;
}

export function isAllowedSiteAssetObjectKey(objectKey: string): boolean {
  if (!objectKey || objectKey.includes('..') || objectKey.startsWith('/')) {
    return false;
  }

  if (objectKey.startsWith('brand/')) {
    return /^brand\/[a-zA-Z0-9._-]+$/.test(objectKey);
  }

  return /^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp|gif|svg)$/i.test(objectKey);
}
