import { externalLinkAttributes, logoTypes } from "@/app/lib/constants";
import Image from 'next/image';

export default function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4 w-full items-center">
      <div className="flex items-center justify-center md:justify-start w-1/2 px-2 md:pl-12">
        <Image
          src={logoTypes.vertical_for_dark_bkgds}
          alt="Dragon's Veil Creations logo"
          className="w-full max-w-xs sm:max-w-sm md:max-w-md"
          width={200}
          height={200}
        />
      </div>
      <div className="flex justify-center md:justify-end items-center font-cormorant_garamond text-3xl sm:text-4xl md:text-[40px] leading-tight md:leading-none mt-2 md:mt-[100px] px-2 md:px-0 text-center md:text-left">
        <p>
          Welcome to <strong className="text-[var(--dv-light-purple)]">Dragon&apos;s Veil Creations</strong>!
          <br /><br />
          Dragon&apos;s Veil Creations is a <strong><a href="https://dragonspurr.ca" className="dp-link text-red-800" {...externalLinkAttributes}>Dragon&apos;s Purr Crafts and Sundry</a></strong> brand that specializes in crafting handmade and designed masquerade masks, fascinators, and various other accessories.
        </p>
      </div>
    </div>
  );
}
