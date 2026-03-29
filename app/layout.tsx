import Script from 'next/script';
import { LayoutSwitcher } from './LayoutSwitcher';
import { logoTypes, siteInfo } from './lib/constants';
import {
  Cinzel_Decorative,
  Cinzel,
  Cormorant_Garamond,
} from 'next/font/google';
import './globals.css';
import type { ReactNode } from 'react';

const cinzelDecorative = Cinzel_Decorative({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-cinzel-decorative',
});
const cinzel = Cinzel({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-cinzel',
});
const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
});

export const viewport = {
  themeColor: '#000000',
};

export const metadata = {
  title: siteInfo.name,
  description: siteInfo.description,
  openGraph: {
    url: siteInfo.url,
  },
  icons: {
    icon: logoTypes.square_for_dark_bkgds,
    apple: logoTypes.square_for_dark_bkgds,
  },
};

export const UmamiAnalytics = () => {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!websiteId) {
    return <></>;
  }
  return (
    <>
      <Script async src="https://umami.is/script.js" data-website-id={websiteId} />
    </>
  );
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`bg-black ${cinzelDecorative.variable} ${cinzel.variable} ${cormorant.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
            `,
          }}
        />
      </head>
      <body className="bg-black text-white min-h-screen flex flex-col">
        <UmamiAnalytics />
        <LayoutSwitcher>{children}</LayoutSwitcher>
      </body>
    </html>
  );
}
