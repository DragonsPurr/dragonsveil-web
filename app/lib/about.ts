import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImageSource } from '@sanity/image-url';
import { groq } from 'next-sanity';
import { isSanityConfigured, sanityClient } from './sanity';

const aboutPageQuery = groq`
  *[_type == "aboutPage" && _id == "aboutPage"][0]{
    portraitImage,
    whoWeAreTitle,
    whoWeAreBody,
    whatWeMakeTitle,
    whatWeMakeBody,
  }
`;

/** Sanity may still return strings for titles saved before those fields were portable text. */
type TitleField = string | PortableTextBlock[] | null | undefined;

type AboutPageRaw = {
  portraitImage: SanityImageSource | null;
  whoWeAreTitle: TitleField;
  whoWeAreBody: PortableTextBlock[] | null;
  whatWeMakeTitle: TitleField;
  whatWeMakeBody: PortableTextBlock[] | null;
};

export type AboutPageContent = {
  portraitImage: SanityImageSource | null;
  whoWeAreTitle: PortableTextBlock[] | null;
  whoWeAreBody: PortableTextBlock[] | null;
  whatWeMakeTitle: PortableTextBlock[] | null;
  whatWeMakeBody: PortableTextBlock[] | null;
};

export function defaultSectionTitle(text: string): PortableTextBlock[] {
  return [
    {
      _type: 'block',
      _key: 'default-section-title',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'default-span',
          text,
          marks: [],
        },
      ],
    },
  ];
}

function coercePortableTitle(value: TitleField): PortableTextBlock[] | null {
  if (Array.isArray(value) && value.length > 0) {
    return value as PortableTextBlock[];
  }
  if (typeof value === 'string') {
    const t = value.trim();
    return t ? defaultSectionTitle(t) : null;
  }
  return null;
}

export async function getAboutPageContent(): Promise<AboutPageContent | null> {
  if (!isSanityConfigured()) return null;
  const raw = await sanityClient.fetch<AboutPageRaw | null>(aboutPageQuery, {}, { next: { revalidate: 60 } });
  if (!raw) return null;
  return {
    portraitImage: raw.portraitImage,
    whoWeAreTitle: coercePortableTitle(raw.whoWeAreTitle),
    whoWeAreBody: raw.whoWeAreBody,
    whatWeMakeTitle: coercePortableTitle(raw.whatWeMakeTitle),
    whatWeMakeBody: raw.whatWeMakeBody,
  };
}

export function resolvePortraitAlt(content: AboutPageContent | null): string {
  const img = content?.portraitImage;
  if (img && typeof img === 'object' && 'alt' in img) {
    const alt = (img as { alt?: string }).alt;
    if (typeof alt === 'string' && alt.trim()) return alt.trim();
  }
  return 'Kayt and Ryan';
}
