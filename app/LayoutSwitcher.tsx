'use client';

import type { ShopCartNavPreview } from '@/app/lib/medusa-cart';
import type { ShopCategoryNavItem } from '@/app/lib/shop';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const ShopSubNav = dynamic(
  () =>
    import('@/components/shop/ShopSubNav').then((mod) => ({ default: mod.ShopSubNav })),
);

type LayoutSwitcherProps = {
  children: ReactNode;
  shopCategories?: ShopCategoryNavItem[];
  cart?: ShopCartNavPreview;
  isCustomerLoggedIn?: boolean;
  customerDisplayName?: string | null;
  customerAvatarUrl?: string | null;
};

const emptyCart: ShopCartNavPreview = {
  itemCount: 0,
  items: [],
  total: null,
  currencyCode: null,
};

export function LayoutSwitcher({
  children,
  shopCategories = [],
  cart = emptyCart,
  isCustomerLoggedIn = false,
  customerDisplayName = null,
  customerAvatarUrl = null,
}: LayoutSwitcherProps) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith('/studio');
  const isShop = pathname?.startsWith('/shop');
  const isHome = pathname === '/';

  if (isStudio) {
    return (
      <div className="h-screen w-screen overflow-hidden flex flex-col">
        {children}
      </div>
    );
  }

  const siteChrome = (
    <>
      <header className="sticky top-0 z-50 w-full shrink-0">
        <Navigation embedded={isShop} />
        {isShop ? (
          <ShopSubNav
            categories={shopCategories}
            cart={cart}
            isCustomerLoggedIn={isCustomerLoggedIn}
            customerDisplayName={customerDisplayName}
            customerAvatarUrl={customerAvatarUrl}
          />
        ) : null}
      </header>
      <main
        className={
          isHome
            ? 'dp-main-content dp-home-content flex-1 min-h-0'
            : 'dp-main-content'
        }
      >
        <div
          className={
            isHome
              ? 'w-full max-w-7xl mx-auto h-full flex items-center justify-center min-h-0'
              : 'w-full max-w-7xl mx-auto'
          }
        >
          {children}
        </div>
      </main>
      <Footer />
    </>
  );

  if (isHome) {
    return (
      <div className="flex flex-col h-dvh overflow-hidden">{siteChrome}</div>
    );
  }

  return siteChrome;
}
