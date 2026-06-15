import { AboutPageView } from '@/components/AboutPageView';
import { asset_base_url, siteInfo } from '@/app/lib/constants';
import { defaultSectionTitle, getAboutPageContent, resolvePortraitAlt } from '@/app/lib/about';
import { urlFor } from '@/app/lib/sanity';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: `Learn more about ${siteInfo.name}.`,
};

export default async function About() {
  const content = await getAboutPageContent();
  const portraitUrl =
    content?.portraitImage != null
      ? urlFor(content.portraitImage).width(1000).height(1000).fit('crop').auto('format').url()
      : `${asset_base_url}/kayt-and-ryan.png`;
  const portraitAlt = resolvePortraitAlt(content);

  return (
    <AboutPageView
      portraitUrl={portraitUrl}
      portraitAlt={portraitAlt}
      whoWeAreTitle={content?.whoWeAreTitle ?? defaultSectionTitle('Who We Are')}
      whoWeAreBody={content?.whoWeAreBody?.length ? content.whoWeAreBody : null}
      whatWeMakeTitle={content?.whatWeMakeTitle ?? defaultSectionTitle('What We Make')}
      whatWeMakeBody={content?.whatWeMakeBody?.length ? content.whatWeMakeBody : null}
    />
  );
}
