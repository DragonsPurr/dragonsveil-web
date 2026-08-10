import type { SanityImageSource } from '@sanity/image-url';
import { groq } from 'next-sanity';
import {
  brandDomainFromUrl,
  buildBrandfetchAssetUrl,
  buildBrandfetchIconUrls,
  normalizeBrandDomain,
  type BrandfetchAssetFormat,
  type BrandfetchAssetTheme,
  type BrandfetchAssetType,
  type BrandfetchIconSelection,
} from './brandfetch';
import { isSanityConfigured, sanityClient, urlFor } from './sanity';

const socialLinksQuery = groq`
  *[_type == "socialLinks" && _id == "socialLinks"][0]{
    items[]{
      _key,
      label,
      url,
      brandDomain,
      brandfetchIcon,
      customIcon,
      desaturateToWhite
    }
  }
`;

type BrandfetchIconRaw = {
  type?: string | null;
  theme?: string | null;
  format?: string | null;
};

type SocialLinkRaw = {
  _key: string;
  label?: string | null;
  url?: string | null;
  brandDomain?: string | null;
  brandfetchIcon?: BrandfetchIconRaw | null;
  customIcon?: SanityImageSource | null;
  desaturateToWhite?: boolean | null;
};

type SocialLinksDocRaw = {
  items?: SocialLinkRaw[] | null;
} | null;

export type NavSocialLink = {
  _key: string;
  label: string;
  url: string;
  /**
   * Ordered icon URL candidates. First entry is the initial <img src>;
   * later entries are used via onError (needed for Brandfetch gaps like Cara).
   */
  iconCandidates: string[];
  /** Whether the icon comes from Sanity or Brandfetch (for alt / debugging). */
  iconSource: 'custom' | 'brandfetch';
  /** When true, nav forces the icon to white (purple on hover). */
  desaturateToWhite: boolean;
};

function hasAsset(image: SanityImageSource | null | undefined): boolean {
  if (!image || typeof image !== 'object') return false;
  if ('asset' in image && image.asset) return true;
  if ('_ref' in image && typeof (image as { _ref?: string })._ref === 'string') return true;
  return false;
}

function coerceBrandfetchSelection(raw: BrandfetchIconRaw | null | undefined): BrandfetchIconSelection | null {
  const type = raw?.type;
  const theme = raw?.theme;
  const format = raw?.format;
  if (
    (type !== 'icon' && type !== 'symbol' && type !== 'logo') ||
    (theme !== 'light' && theme !== 'dark') ||
    (format !== 'svg' && format !== 'png' && format !== 'jpeg')
  ) {
    return null;
  }
  return {
    type: type as BrandfetchAssetType,
    theme: theme as BrandfetchAssetTheme,
    format: format as BrandfetchAssetFormat,
  };
}

function resolveSocialLink(raw: SocialLinkRaw): NavSocialLink | null {
  const label = typeof raw.label === 'string' ? raw.label.trim() : '';
  const url = typeof raw.url === 'string' ? raw.url.trim() : '';
  if (!label || !url || !raw._key) return null;

  // Default on for existing documents that predate this field.
  const desaturateToWhite = raw.desaturateToWhite !== false;

  if (hasAsset(raw.customIcon ?? null)) {
    return {
      _key: raw._key,
      label,
      url,
      iconCandidates: [
        urlFor(raw.customIcon!).width(64).height(64).fit('max').format('png').url(),
      ],
      iconSource: 'custom',
      desaturateToWhite,
    };
  }

  const domain =
    (typeof raw.brandDomain === 'string' ? normalizeBrandDomain(raw.brandDomain) : null) ??
    brandDomainFromUrl(url);

  const selection = coerceBrandfetchSelection(raw.brandfetchIcon);
  if (domain && selection) {
    const selectedUrl = buildBrandfetchAssetUrl(domain, selection);
    if (selectedUrl) {
      return {
        _key: raw._key,
        label,
        url,
        iconCandidates: [selectedUrl],
        iconSource: 'brandfetch',
        desaturateToWhite,
      };
    }
  }

  const brandfetchUrls = domain ? buildBrandfetchIconUrls(domain) : null;
  if (!brandfetchUrls?.candidates.length) return null;

  return {
    _key: raw._key,
    label,
    url,
    iconCandidates: brandfetchUrls.candidates,
    iconSource: 'brandfetch',
    desaturateToWhite,
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
