'use client';

import {
  brandDomainFromUrl,
  buildBrandfetchAssetUrl,
  buildBrandfetchIconUrls,
  normalizeBrandDomain,
  type BrandfetchAssetFormat,
  type BrandfetchAssetTheme,
  type BrandfetchAssetType,
} from '@/app/lib/brandfetch';
import { Card, Flex, Stack, Text } from '@sanity/ui';
import { useMemo, useState } from 'react';
import { type StringInputProps, useFormValue } from 'sanity';
import type { SanityImageSource } from '@sanity/image-url';
import { urlFor } from '../lib/image';

type BrandfetchIconValue = {
  type?: string;
  theme?: string;
  format?: string;
};

type SocialLinkParent = {
  url?: string;
  brandDomain?: string;
  brandfetchIcon?: BrandfetchIconValue | null;
  customIcon?: SanityImageSource | null;
  desaturateToWhite?: boolean | null;
};

/** Matches `.dp-nav-social-icon` / hover in app/globals.css (Studio has no site CSS). */
const WHITE_FILTER = 'brightness(0) invert(1)';
const HOVER_FILTER =
  'brightness(0) saturate(100%) invert(27%) sepia(79%) saturate(2478%) hue-rotate(286deg) brightness(92%) contrast(96%)';

function resolveDomain(parent: SocialLinkParent | undefined): string | null {
  if (!parent) return null;
  let domain: string | null = null;
  if (typeof parent.brandDomain === 'string' && parent.brandDomain.trim()) {
    domain = normalizeBrandDomain(parent.brandDomain);
  } else if (typeof parent.url === 'string' && parent.url.trim()) {
    domain = brandDomainFromUrl(parent.url);
  }
  if (!domain || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
    return null;
  }
  return domain;
}

function hasCustomAsset(image: SanityImageSource | null | undefined): boolean {
  if (!image || typeof image !== 'object') return false;
  if ('asset' in image && image.asset) return true;
  return false;
}

function coerceSelection(raw: BrandfetchIconValue | null | undefined): {
  type: BrandfetchAssetType;
  theme: BrandfetchAssetTheme;
  format: BrandfetchAssetFormat;
} | null {
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
  return { type, theme, format };
}

function PreviewIcon({
  candidates,
  desaturate,
  forceHover,
}: {
  candidates: string[];
  desaturate: boolean;
  forceHover?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const src = candidates[index];
  if (!src) {
    return (
      <Text size={1} muted>
        No icon available yet
      </Text>
    );
  }

  const filter = desaturate
    ? forceHover
      ? HOVER_FILTER
      : WHITE_FILTER
    : undefined;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={`${src}-${forceHover ? 'hover' : 'default'}`}
      src={src}
      alt=""
      width={28}
      height={28}
      style={{
        width: 28,
        height: 28,
        objectFit: 'contain',
        background: 'transparent',
        ...(filter ? { filter } : null),
      }}
      onError={() => {
        setIndex((current) => (current + 1 < candidates.length ? current + 1 : current));
      }}
    />
  );
}

function PreviewChip({
  label,
  candidates,
  desaturate,
  forceHover,
}: {
  label: string;
  candidates: string[];
  desaturate: boolean;
  forceHover?: boolean;
}) {
  return (
    <Card padding={3} radius={2} style={{ background: '#000', border: '1px solid #c427c0' }}>
      <Stack space={2}>
        <Text size={0} style={{ color: '#aaa' }}>
          {label}
        </Text>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            opacity: forceHover ? 1 : 0.9,
          }}
        >
          <PreviewIcon
            key={candidates.join('|')}
            candidates={candidates}
            desaturate={desaturate}
            forceHover={forceHover}
          />
        </span>
      </Stack>
    </Card>
  );
}

/**
 * Live preview of how the social icon will look in the site nav.
 */
export function SocialLinkNavPreview(props: StringInputProps) {
  const parentPath = Array.isArray(props.path) ? props.path.slice(0, -1) : [];
  const parent = useFormValue(parentPath) as SocialLinkParent | undefined;

  const desaturate = parent?.desaturateToWhite !== false;
  const domain = useMemo(() => resolveDomain(parent), [parent]);

  const candidates = useMemo(() => {
    if (hasCustomAsset(parent?.customIcon ?? null) && parent?.customIcon) {
      try {
        return [urlFor(parent.customIcon).width(64).height(64).fit('max').format('png').url()];
      } catch {
        return [];
      }
    }

    if (!domain) return [];

    const selection = coerceSelection(parent?.brandfetchIcon);
    if (selection) {
      const selected = buildBrandfetchAssetUrl(domain, selection);
      return selected ? [selected] : [];
    }

    return buildBrandfetchIconUrls(domain)?.candidates ?? [];
  }, [parent, domain]);

  if (!parent?.url && !parent?.brandDomain && !hasCustomAsset(parent?.customIcon ?? null)) {
    return (
      <Card padding={3} radius={2} tone="transparent" border>
        <Text size={1} muted>
          Add a URL or custom icon to see a nav preview.
        </Text>
      </Card>
    );
  }

  return (
    <Stack space={3}>
      <Text size={1} muted>
        Preview as rendered in the top nav
        {desaturate ? ' (white; purple shows the hover state)' : ' (original colors)'}.
      </Text>
      <Flex gap={3} wrap="wrap">
        <PreviewChip label="Default" candidates={candidates} desaturate={desaturate} />
        {desaturate ? (
          <PreviewChip label="Hover" candidates={candidates} desaturate={desaturate} forceHover />
        ) : null}
      </Flex>
    </Stack>
  );
}
