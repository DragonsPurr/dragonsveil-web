import Medusa, { FetchError } from '@medusajs/js-sdk';
import type { FetchArgs } from '@medusajs/js-sdk';

function readEnv(name: string, publicName: string): string | undefined {
  const value = process.env[name]?.trim() || process.env[publicName]?.trim();
  return value || undefined;
}

const MEDUSA_BACKEND_URL =
  readEnv('MEDUSA_BACKEND_URL', 'NEXT_PUBLIC_MEDUSA_BACKEND_URL') ??
  'http://localhost:9000';

export const medusaPublishableKey = readEnv(
  'MEDUSA_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY'
);

/** Cloudflare rejects inbound requests that carry these reserved headers (error 1000 → 403). */
export const CLOUDFLARE_HEADERS_TO_STRIP = [
  'cf-connecting-ip',
  'cf-ipcountry',
  'cf-visitor',
  'cf-ray',
] as const;

export function stripCloudflareHeadersFromInit(
  init?: RequestInit
): RequestInit | undefined {
  if (!init?.headers) {
    return init;
  }

  const headers = new Headers(init.headers);
  for (const name of CLOUDFLARE_HEADERS_TO_STRIP) {
    headers.delete(name);
  }

  return { ...init, headers };
}

function patchGlobalFetchForMedusaOrigin(origin: string): void {
  if (typeof globalThis.fetch !== 'function') return;

  const marker = '__dragonsveilMedusaFetchPatched__';
  const globalRef = globalThis as typeof globalThis & { [marker]?: boolean };
  if (globalRef[marker]) return;
  globalRef[marker] = true;

  const nativeFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    if (url.startsWith(origin)) {
      return nativeFetch(input, stripCloudflareHeadersFromInit(init));
    }

    return nativeFetch(input, init);
  };
}

patchGlobalFetchForMedusaOrigin(new URL(MEDUSA_BACKEND_URL).origin);

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.MEDUSA_DEBUG === 'true',
  publishableKey: medusaPublishableKey,
  globalHeaders: Object.fromEntries(
    CLOUDFLARE_HEADERS_TO_STRIP.map((name) => [name, null])
  ),
  auth: {
    type: 'jwt',
    jwtTokenStorageMethod: 'memory',
  },
});

const medusaFetch = sdk.client.fetch.bind(sdk.client);
sdk.client.fetch = (input, init?: FetchArgs) =>
  medusaFetch(input, { cache: 'no-store', ...init });

export function isMedusaConfigured(): boolean {
  return Boolean(medusaPublishableKey);
}

export function formatMedusaError(err: unknown, fallback: string): string {
  if (err instanceof FetchError) {
    if (err.status === 403) {
      return (
        'Cloudflare blocked the Medusa API request (403 Forbidden). This usually happens when ' +
        'Vercel forwards Cloudflare headers to shopadmin.dragonspurr.ca. Redeploy with the latest ' +
        'code, or add a Cloudflare WAF skip rule for /store/* server-to-server traffic.'
      );
    }
    if (err.status === 400 && err.message.includes('publishable')) {
      return err.message;
    }
    if (err.message && err.message !== err.statusText) {
      return err.message;
    }
    if (err.status) {
      return `${fallback} (HTTP ${err.status}${err.statusText ? `: ${err.statusText}` : ''})`;
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}
