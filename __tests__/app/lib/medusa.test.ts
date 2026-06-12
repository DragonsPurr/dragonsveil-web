jest.mock('@medusajs/js-sdk', () => {
  class FetchError extends Error {
    status?: number;
    statusText?: string;

    constructor(message: string, statusText?: string, status?: number) {
      super(message);
      this.name = 'FetchError';
      this.status = status;
      this.statusText = statusText;
    }
  }

  class Medusa {
    client = { fetch: jest.fn() };
  }

  return { __esModule: true, default: Medusa, FetchError };
});

import { FetchError } from '@medusajs/js-sdk';
import {
  CLOUDFLARE_HEADERS_TO_STRIP,
  formatMedusaError,
  stripCloudflareHeadersFromInit,
} from '@/app/lib/medusa';

describe('stripCloudflareHeadersFromInit', () => {
  it('removes Cloudflare reserved headers from outbound requests', () => {
    const init = stripCloudflareHeadersFromInit({
      headers: {
        accept: 'application/json',
        'cf-connecting-ip': '76.76.21.21',
        'cf-ray': 'abc123',
        'x-publishable-api-key': 'pk_test',
      },
    });

    const headers = new Headers(init?.headers);
    expect(headers.get('accept')).toBe('application/json');
    expect(headers.get('x-publishable-api-key')).toBe('pk_test');
    for (const name of CLOUDFLARE_HEADERS_TO_STRIP) {
      expect(headers.has(name)).toBe(false);
    }
  });

  it('returns init unchanged when there are no headers', () => {
    expect(stripCloudflareHeadersFromInit(undefined)).toBeUndefined();
    expect(stripCloudflareHeadersFromInit({ cache: 'no-store' })).toEqual({
      cache: 'no-store',
    });
  });
});

describe('formatMedusaError', () => {
  it('returns actionable guidance for 403 responses', () => {
    const err = new FetchError('Forbidden', 'Forbidden', 403);
    expect(formatMedusaError(err, 'Failed to load products from Medusa.')).toContain(
      '403 Forbidden'
    );
    expect(formatMedusaError(err, 'Failed to load products from Medusa.')).toContain('Cloudflare');
  });

  it('returns the Medusa message for publishable key errors', () => {
    const err = new FetchError(
      'Publishable API key required in the request header: x-publishable-api-key.',
      'Bad Request',
      400
    );
    expect(formatMedusaError(err, 'fallback')).toContain('Publishable API key required');
  });

  it('falls back for unknown errors', () => {
    expect(formatMedusaError(new Error('network down'), 'Something failed.')).toBe('network down');
    expect(formatMedusaError(null, 'Something failed.')).toBe('Something failed.');
  });
});
