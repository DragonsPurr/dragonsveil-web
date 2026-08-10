/** Brandfetch Logo CDN helpers. Hotlink URLs only; do not proxy or cache via next/image. */

const BRANDFETCH_CDN = 'https://cdn.brandfetch.io';

export type BrandfetchIconUrls = {
  /** SVG symbol when Brandfetch has one (transparent). Prefer in <picture>. */
  svgSrc: string;
  /** Transparent PNG icon fallback when SVG is unavailable. */
  pngSrc: string;
};

export function getBrandfetchClientId(): string | null {
  const id = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID?.trim();
  return id || null;
}

/**
 * Normalize a hostname or domain string for Brandfetch (lowercase, no www.).
 */
export function normalizeBrandDomain(domain: string): string | null {
  const trimmed = domain.trim().toLowerCase();
  if (!trimmed) return null;
  const withoutWww = trimmed.replace(/^www\./, '');
  // Reject anything that still looks like a path or scheme.
  if (withoutWww.includes('/') || withoutWww.includes(':')) return null;
  return withoutWww || null;
}

/**
 * Derive a Brandfetch domain from a profile URL hostname.
 */
export function brandDomainFromUrl(url: string): string | null {
  try {
    const hostname = new URL(url).hostname;
    return normalizeBrandDomain(hostname);
  } catch {
    return null;
  }
}

/**
 * Build Brandfetch icon CDN URLs for a dark background (theme=light asset color).
 * Prefers transparent SVG (symbol); falls back to transparent PNG (icon).
 * Returns null when client ID or domain is missing.
 */
export function buildBrandfetchIconUrls(domain: string): BrandfetchIconUrls | null {
  const clientId = getBrandfetchClientId();
  const normalized = normalizeBrandDomain(domain);
  if (!clientId || !normalized) return null;

  const encodedDomain = encodeURIComponent(normalized);
  const encodedClientId = encodeURIComponent(clientId);
  const base = `${BRANDFETCH_CDN}/domain/${encodedDomain}`;

  return {
    // logo/symbol support SVG; fallback/transparent keeps the canvas clear.
    svgSrc: `${base}/theme/light/type/symbol/fallback/transparent.svg?c=${encodedClientId}`,
    pngSrc: `${base}/w/64/h/64/theme/light/type/icon/fallback/transparent.png?c=${encodedClientId}`,
  };
}
