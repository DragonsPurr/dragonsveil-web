import type { SanityImageSource } from '@sanity/image-url';
import { groq } from 'next-sanity';
import { brandDomainFromUrl, buildBrandfetchIconUrls, normalizeBrandDomain } from './brandfetch';
import { isSanityConfigured, sanityClient, urlFor } from './sanity';

const socialLinksQuery = groq`
  *[_type == "socialLinks" && _id == "socialLinks"][0]{
    items[]{
      _key,
      label,
      url,
      brandDomain,
      customIcon
    }
  }
`;

type SocialLinkRaw = {
  _key: string;
  label?: string | null;
  url?: string | null;
  brandDomain?: string | null;
  customIcon?: SanityImageSource | null;
};

type SocialLinksDocRaw = {
  items?: SocialLinkRaw[] | null;
} | null;

export type NavSocialLink = {
  _key: string;
  label: string;
  url: string;
  /** Transparent PNG (or custom raster) used as <img> src / picture fallback. */
  iconSrc: string;
  /** Transparent SVG when available (Brandfetch symbol); omit for custom rasters. */
  iconSvgSrc?: string | null;
  /** Whether the icon comes from Sanity or Brandfetch (for alt / debugging). */
  iconSource: 'custom' | 'brandfetch';
};

function hasAsset(image: SanityImageSource | null | undefined): boolean {
  if (!image || typeof image !== 'object') return false;
  if ('asset' in image && image.asset) return true;
  if ('_ref' in image && typeof (image as { _ref?: string })._ref === 'string') return true;
  return false;
}

function resolveSocialLink(raw: SocialLinkRaw): NavSocialLink | null {
  const label = typeof raw.label === 'string' ? raw.label.trim() : '';
  const url = typeof raw.url === 'string' ? raw.url.trim() : '';
  if (!label || !url || !raw._key) return null;

  if (hasAsset(raw.customIcon ?? null)) {
    return {
      _key: raw._key,
      label,
      url,
      // PNG preserves alpha for transparent custom uploads.
      iconSrc: urlFor(raw.customIcon!).width(64).height(64).fit('max').format('png').url(),
      iconSvgSrc: null,
      iconSource: 'custom',
    };
  }

  const domain =
    (typeof raw.brandDomain === 'string' ? normalizeBrandDomain(raw.brandDomain) : null) ??
    brandDomainFromUrl(url);
  const brandfetchUrls = domain ? buildBrandfetchIconUrls(domain) : null;
  if (!brandfetchUrls) return null;

  return {
    _key: raw._key,
    label,
    url,
    iconSrc: brandfetchUrls.pngSrc,
    iconSvgSrc: brandfetchUrls.svgSrc,
    iconSource: 'brandfetch',
  };
}

export async function getSiteSettingsSocialLinks(): Promise<NavSocialLink[]> {
  if (!isSanityConfigured()) return [];
  const raw = await sanityClient.fetch<SocialLinksDocRaw>(
    socialLinksQuery,
    {},
    { next: { revalidate: 60 } },
  );
  const links = raw?.items ?? [];
  return links
    .map(resolveSocialLink)
    .filter((link): link is NavSocialLink => link != null);
}
