import Script from 'next/script';
import { headers } from 'next/headers';
import { LayoutSwitcher } from './LayoutSwitcher';
import { getCustomerAvatarProxyUrl } from './lib/customer-avatar';
import { getCustomerDisplayName } from './lib/customer-display';
import { retrieveLoggedInCustomer } from './lib/medusa-auth';
import { getShopCartNavPreview } from './lib/medusa-cart';
import { listShopCategories } from './lib/shop';
import { logoTypes, siteInfo } from './lib/constants';
import {
  Cinzel_Decorative,
  Cinzel,
  Cormorant_Garamond,
} from 'next/font/google';
import './globals.css';
import type { CSSProperties, ReactNode } from 'react';

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

function isShopPath(pathname: string): boolean {
  return pathname === '/shop' || pathname.startsWith('/shop/');
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const pathname = (await headers()).get('x-pathname') ?? '';
  const shopNavData = isShopPath(pathname)
    ? await Promise.all([
        listShopCategories(),
        getShopCartNavPreview(),
        retrieveLoggedInCustomer(),
      ])
    : null;
  const [shopCategories, cart, customer] = shopNavData ?? [[], undefined, null];

  return (
    <html
      lang="en"
      className={`bg-black ${cinzelDecorative.variable} ${cinzel.variable} ${cormorant.variable}`}
      style={
        {
          '--dp-main-content-bg-image': `url("${logoTypes.publication_banner}")`,
        } as CSSProperties
      }
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
        <LayoutSwitcher
          shopCategories={shopCategories}
          cart={cart}
          isCustomerLoggedIn={customer != null}
          customerDisplayName={customer ? getCustomerDisplayName(customer) : null}
          customerAvatarUrl={customer ? getCustomerAvatarProxyUrl(customer) : null}
        >
          {children}
        </LayoutSwitcher>
      </body>
    </html>
  );
}
