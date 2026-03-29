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

export type AboutPageContent = {
  portraitImage: SanityImageSource | null;
  whoWeAreTitle: string | null;
  whoWeAreBody: PortableTextBlock[] | null;
  whatWeMakeTitle: string | null;
  whatWeMakeBody: PortableTextBlock[] | null;
};

export async function getAboutPageContent(): Promise<AboutPageContent | null> {
  if (!isSanityConfigured()) return null;
  return sanityClient.fetch<AboutPageContent | null>(aboutPageQuery, {}, { next: { revalidate: 60 } });
}

export function resolvePortraitAlt(content: AboutPageContent | null): string {
  const img = content?.portraitImage;
  if (img && typeof img === 'object' && 'alt' in img) {
    const alt = (img as { alt?: string }).alt;
    if (typeof alt === 'string' && alt.trim()) return alt.trim();
  }
  return 'Kayt and Ryan';
}
