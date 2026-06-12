import type { HttpTypes } from '@medusajs/types';

export const CUSTOMER_AVATAR_METADATA_KEY = 'avatar_url';

const DEFAULT_PUBLIC_BASE = 'https://dp-user-assets.s3.ca-east-tor.io.cloud.ovh.net';

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

const ALLOWED_AVATAR_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export function getAvatarPublicBaseUrl(): string {
  const base = process.env.OVH_USER_ASSETS_PUBLIC_URL?.trim() || DEFAULT_PUBLIC_BASE;
  return base.replace(/\/$/, '');
}

export function isAllowedAvatarMimeType(mime: string): boolean {
  return mime in ALLOWED_AVATAR_MIME;
}

export function extensionForAvatarMime(mime: string): string | null {
  return ALLOWED_AVATAR_MIME[mime] ?? null;
}

/** Only accept avatar URLs hosted on our OVH user-assets bucket. */
export function isAllowedAvatarUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const base = new URL(getAvatarPublicBaseUrl());
    return parsed.origin === base.origin && parsed.pathname.startsWith('/avatars/');
  } catch {
    return false;
  }
}

export function getCustomerAvatarUrl(
  customer: Pick<HttpTypes.StoreCustomer, 'metadata'>
): string | null {
  const raw = customer.metadata?.[CUSTOMER_AVATAR_METADATA_KEY];
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const url = raw.trim();
  return isAllowedAvatarUrl(url) ? url : null;
}

export function buildCustomerAvatarObjectKey(customerId: string, extension: string): string {
  const safeId = customerId.replace(/[^a-zA-Z0-9_-]/g, '');
  return `avatars/${safeId}/${Date.now()}.${extension}`;
}

export function buildPublicObjectUrl(objectKey: string): string {
  const base = getAvatarPublicBaseUrl();
  const encodedKey = objectKey.split('/').map(encodeURIComponent).join('/');
  return `${base}/${encodedKey}`;
}

const AVATAR_OBJECT_KEY_PATTERN =
  /^avatars\/[a-zA-Z0-9_-]+\/[0-9]+\.(jpg|jpeg|png|webp|gif)$/;

export function isAllowedAvatarObjectKey(objectKey: string): boolean {
  return AVATAR_OBJECT_KEY_PATTERN.test(objectKey);
}

export function avatarUrlToObjectKey(url: string): string | null {
  if (!isAllowedAvatarUrl(url)) return null;
  const key = decodeURIComponent(new URL(url).pathname.replace(/^\//, ''));
  return isAllowedAvatarObjectKey(key) ? key : null;
}

/** Same-origin URL for displaying private bucket objects via the shop avatar API route. */
export function getCustomerAvatarProxyUrl(
  customer: Pick<HttpTypes.StoreCustomer, 'metadata'>
): string | null {
  const storedUrl = getCustomerAvatarUrl(customer);
  if (!storedUrl) return null;
  const objectKey = avatarUrlToObjectKey(storedUrl);
  if (!objectKey) return null;
  return `/api/shop/avatar/${objectKey.split('/').map(encodeURIComponent).join('/')}`;
}
