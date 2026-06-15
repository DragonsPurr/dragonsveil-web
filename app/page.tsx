import { externalLinkAttributes, logoTypes } from '@/app/lib/constants';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-h-full min-h-0 items-center justify-items-center md:justify-items-stretch">
      <div className="flex items-center justify-center md:justify-start w-full min-h-0 px-2 md:pl-8">
        <div className="relative h-[min(38dvh,22rem)] sm:h-[min(42dvh,24rem)] md:h-[min(52dvh,28rem)] aspect-2/3 w-auto max-w-full shrink min-h-0">
          <Image
            src={logoTypes.square_for_dark_bkgds}
            alt="Dragon's Veil Creations logo"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 50dvh, 35dvh"
            priority
          />
        </div>
      </div>
      <div className="flex justify-center md:justify-end items-center min-h-0 px-2 md:px-0 text-center md:text-left font-cormorant_garamond text-2xl sm:text-3xl md:text-[2.25rem] leading-snug md:leading-tight">
        <p>
          Welcome to <strong className="text-(--dv-light-purple)">Dragon&apos;s Veil Creations</strong>!
          <br /><br />
          Dragon&apos;s Veil Creations is a{' '}
          <strong>
            <a href="https://dragonspurr.ca" className="dp-link" {...externalLinkAttributes}>
              Dragon&apos;s Purr Crafts and Sundry
            </a>
          </strong>{' '}
          brand that specializes in crafting handmade and designed masquerade masks, fascinators, and
          various other accessories.
        </p>
      </div>
    </div>
  );
}
