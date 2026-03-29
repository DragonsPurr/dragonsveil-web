import type { PortableTextBlock } from '@portabletext/types';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import Image from 'next/image';

const bodyComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
  },
};

type AboutPageViewProps = {
  portraitUrl: string;
  portraitAlt: string;
  whoWeAreTitle: string;
  whoWeAreBody: PortableTextBlock[] | null;
  whatWeMakeTitle: string;
  whatWeMakeBody: PortableTextBlock[] | null;
};

export function AboutPageView({
  portraitUrl,
  portraitAlt,
  whoWeAreTitle,
  whoWeAreBody,
  whatWeMakeTitle,
  whatWeMakeBody,
}: AboutPageViewProps) {
  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="flex justify-start items-start">
          <div className="dp-about-portrait-wrap">
            <Image
              src={portraitUrl}
              alt={portraitAlt}
              className="dp-circular-image relative z-0"
              width={500}
              height={500}
              sizes="(max-width: 768px) 100vw, 500px"
            />
          </div>
        </div>
        <div className="dp-body-text">
          <p className="mb-4">
            <strong className="dp-section-header">{whoWeAreTitle}</strong>
          </p>
          {whoWeAreBody?.length ? (
            <PortableText value={whoWeAreBody} components={bodyComponents} />
          ) : (
            <div className="space-y-4">
              <p>
                Hi! We&apos;re Kayt and Ryan!
                <br />
                Co-Founders of{' '}
                <strong className="text-[var(--dv-light-purple)]">
                  <em>Dragon&apos;s Purr Crafts and Sundry!</em>
                </strong>
              </p>
              <p>
                We started Dragon&apos;s Purr for a bunch of different reasons, but chief among them was a desire to
                share our creativity with the world, and to make dorky little trinkets that folks like us would find
                funny, charming, and above all, inclusive; it&apos;s our hope that you&apos;ll find a bit of yourselves
                in our quirky designs.
              </p>
              <p>
                Beyond that, we believe in helping out where we can, and championing causes close to our hearts, both
                through the art we make, and through direct support in the form of charitable donations which come from
                the sale of that same art.
              </p>
            </div>
          )}
        </div>
        <div className="dp-body-text">
          <p className="mb-4">
            <strong className="dp-section-header">{whatWeMakeTitle}</strong>
          </p>
          {whatWeMakeBody?.length ? (
            <PortableText value={whatWeMakeBody} components={bodyComponents} />
          ) : (
            <p>
              If you can slap vinyl on it, we can make it. From t-shirts to stickers, to mugs, keychains, and much
              more. Beyond the custom die-cut vinyl, we also offer small-scale custom engravings, and our own in-house
              designs on apparel courtesy of our sister brand, Hipster Donut Apparel. Check our portfolio page for some
              of our past work!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

