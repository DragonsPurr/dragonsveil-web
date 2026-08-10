/** Brandfetch Logo CDN helpers. Hotlink URLs only; do not proxy or cache via next/image. */

const BRANDFETCH_CDN = 'https://cdn.brandfetch.io';

export type BrandfetchAssetType = 'icon' | 'symbol' | 'logo';
export type BrandfetchAssetTheme = 'light' | 'dark';
export type BrandfetchAssetFormat = 'svg' | 'png' | 'jpeg';

export type BrandfetchIconSelection = {
  type: BrandfetchAssetType;
  theme: BrandfetchAssetTheme;
  format: BrandfetchAssetFormat;
};

export type BrandfetchIconOption = BrandfetchIconSelection & {
  id: string;
  label: string;
  /** CDN preview URL suitable for <img> hotlinking. */
  previewSrc: string;
};

export type BrandfetchIconUrls = {
  /**
   * Ordered candidates for <img src> + onError fallback.
   * Prefer symbol SVG, then logo SVG, then logo PNG, then icon PNG.
   * Brands like Cara only ship a dark logo (SVG/PNG), not a symbol or icon PNG.
   */
  candidates: string[];
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

export function brandfetchSelectionId(selection: BrandfetchIconSelection): string {
  return `${selection.type}:${selection.theme}:${selection.format}`;
}

export function parseBrandfetchSelectionId(id: string): BrandfetchIconSelection | null {
  const [type, theme, format] = id.split(':');
  if (
    (type !== 'icon' && type !== 'symbol' && type !== 'logo') ||
    (theme !== 'light' && theme !== 'dark') ||
    (format !== 'svg' && format !== 'png' && format !== 'jpeg')
  ) {
    return null;
  }
  return { type, theme, format };
}

/**
 * Build a single Brandfetch CDN URL for a chosen asset.
 * Uses fallback/404 so missing variants fail instead of showing Brandfetch's "B".
 */
export function buildBrandfetchAssetUrl(
  domain: string,
  selection: BrandfetchIconSelection,
): string | null {
  const clientId = getBrandfetchClientId();
  const normalized = normalizeBrandDomain(domain);
  if (!clientId || !normalized) return null;

  const base = `${BRANDFETCH_CDN}/${encodeURIComponent(normalized)}`;
  const c = encodeURIComponent(clientId);
  const { type, theme, format } = selection;

  if (format === 'svg') {
    return `${base}/theme/${theme}/fallback/404/${type}.svg?c=${c}`;
  }

  return `${base}/w/128/h/128/theme/${theme}/fallback/404/${type}.${format}?c=${c}`;
}

/**
 * Catalog of CDN variants to offer in Studio when Brand API is unavailable.
 * The picker hides options that 404 at preview time.
 */
export function listBrandfetchCdnCatalog(domain: string): BrandfetchIconOption[] {
  const types: BrandfetchAssetType[] = ['icon', 'symbol', 'logo'];
  const themes: BrandfetchAssetTheme[] = ['dark', 'light'];
  const formats: BrandfetchAssetFormat[] = ['svg', 'png'];
  const options: BrandfetchIconOption[] = [];

  for (const type of types) {
    for (const theme of themes) {
      for (const format of formats) {
        // SVG is only supported for logo/symbol on Brandfetch.
        if (format === 'svg' && type === 'icon') continue;
        const selection = { type, theme, format };
        const previewSrc = buildBrandfetchAssetUrl(domain, selection);
        if (!previewSrc) continue;
        options.push({
          ...selection,
          id: brandfetchSelectionId(selection),
          label: `${type} · ${theme} · ${format.toUpperCase()}`,
          previewSrc,
        });
      }
    }
  }

  return options;
}

/**
 * Build Brandfetch icon CDN URL candidates for a dark nav (CSS invert to white).
 * theme/dark matches brands that only publish dark marks (e.g. cara.app).
 * Returns null when client ID or domain is missing.
 */
export function buildBrandfetchIconUrls(domain: string): BrandfetchIconUrls | null {
  const clientId = getBrandfetchClientId();
  const normalized = normalizeBrandDomain(domain);
  if (!clientId || !normalized) return null;

  const encodedDomain = encodeURIComponent(normalized);
  const encodedClientId = encodeURIComponent(clientId);
  // Prefer the shorter Logo API path form Brandfetch documents for format selection.
  const base = `${BRANDFETCH_CDN}/${encodedDomain}`;

  return {
    candidates: [
      // Symbol/icon first so brands like Instagram get the glyph, not the wordmark.
      // Logo is last for brands like Cara that only ship a logo asset.
      // fallback/404 is required: the default Brandfetch "B" is HTTP 200, so onError
      // would never advance to the next candidate.
      `${base}/theme/dark/fallback/404/symbol.svg?c=${encodedClientId}`,
      `${base}/w/64/h/64/theme/dark/fallback/404/icon.png?c=${encodedClientId}`,
      `${base}/theme/dark/fallback/404/logo.svg?c=${encodedClientId}`,
      `${base}/w/64/h/64/theme/dark/fallback/404/logo.png?c=${encodedClientId}`,
    ],
  };
}
