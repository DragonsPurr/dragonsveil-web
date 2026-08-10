import {
  brandfetchSelectionId,
  buildBrandfetchAssetUrl,
  listBrandfetchCdnCatalog,
  normalizeBrandDomain,
  type BrandfetchAssetFormat,
  type BrandfetchAssetTheme,
  type BrandfetchAssetType,
  type BrandfetchIconOption,
} from '@/app/lib/brandfetch';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type BrandApiLogoFormat = {
  src?: string;
  format?: string;
  background?: string | null;
};

type BrandApiLogo = {
  type?: string;
  theme?: string;
  formats?: BrandApiLogoFormat[];
};

type BrandApiResponse = {
  name?: string;
  domain?: string;
  logos?: BrandApiLogo[];
};

function isAssetType(value: string): value is BrandfetchAssetType {
  return value === 'icon' || value === 'symbol' || value === 'logo';
}

function isAssetTheme(value: string): value is BrandfetchAssetTheme {
  return value === 'light' || value === 'dark';
}

function isAssetFormat(value: string): value is BrandfetchAssetFormat {
  return value === 'svg' || value === 'png' || value === 'jpeg';
}

function optionsFromBrandApi(domain: string, payload: BrandApiResponse): BrandfetchIconOption[] {
  const options: BrandfetchIconOption[] = [];
  const seen = new Set<string>();

  for (const logo of payload.logos ?? []) {
    const type = typeof logo.type === 'string' ? logo.type : '';
    const theme = typeof logo.theme === 'string' ? logo.theme : 'dark';
    if (!isAssetType(type) || !isAssetTheme(theme)) continue;

    for (const formatEntry of logo.formats ?? []) {
      const format = typeof formatEntry.format === 'string' ? formatEntry.format.toLowerCase() : '';
      if (!isAssetFormat(format)) continue;
      const selection = { type, theme, format };
      const id = brandfetchSelectionId(selection);
      if (seen.has(id)) continue;
      const previewSrc = buildBrandfetchAssetUrl(domain, selection);
      if (!previewSrc) continue;
      seen.add(id);
      options.push({
        ...selection,
        id,
        label: `${type} · ${theme} · ${format.toUpperCase()}`,
        previewSrc,
      });
    }
  }

  return options;
}

/**
 * GET /api/brandfetch/logos?domain=cara.app
 * Lists Brandfetch logo variants for the Sanity icon picker.
 * Uses Brand API when BRANDFETCH_API_KEY is set; otherwise returns a CDN catalog.
 */
export async function GET(request: Request) {
  const domain = normalizeBrandDomain(new URL(request.url).searchParams.get('domain') ?? '');
  if (!domain) {
    return NextResponse.json({ error: 'Valid domain is required.' }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID?.trim()) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_BRANDFETCH_CLIENT_ID is not configured.' },
      { status: 503 },
    );
  }

  const apiKey = process.env.BRANDFETCH_API_KEY?.trim();
  if (apiKey) {
    try {
      const res = await fetch(`https://api.brandfetch.io/v2/brands/domain/${encodeURIComponent(domain)}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const payload = (await res.json()) as BrandApiResponse;
        const options = optionsFromBrandApi(domain, payload);
        if (options.length > 0) {
          return NextResponse.json({
            domain,
            source: 'brand-api',
            brandName: payload.name ?? null,
            options,
          });
        }
      }
    } catch {
      // Fall through to CDN catalog.
    }
  }

  return NextResponse.json({
    domain,
    source: 'cdn-catalog',
    brandName: null,
    options: listBrandfetchCdnCatalog(domain),
  });
}
