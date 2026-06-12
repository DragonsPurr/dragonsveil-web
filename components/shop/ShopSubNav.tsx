'use client';

import type { ShopCategoryNavItem } from '@/app/lib/shop';
import type { ShopCartNavPreview } from '@/app/lib/medusa-cart';
import { AccountNavDropdown } from '@/components/shop/AccountNavDropdown';
import { CartNavDropdown } from '@/components/shop/CartNavDropdown';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type ShopSubNavProps = {
  categories?: ShopCategoryNavItem[];
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

export function ShopSubNav({
  categories = [],
  cart = emptyCart,
  isCustomerLoggedIn = false,
  customerDisplayName = null,
  customerAvatarUrl = null,
}: ShopSubNavProps) {
  const pathname = usePathname();

  const isBrowseActive =
    pathname === '/shop' || (pathname?.startsWith('/shop/category/') ?? false);

  const linkClass = (active: boolean) =>
    active
      ? 'text-white no-underline font-cinzel text-sm md:text-base'
      : 'text-white/90 no-underline hover:text-white font-cinzel text-sm md:text-base';

  const isPathActive = (href: string) =>
    href === '/shop'
      ? pathname === '/shop'
      : pathname === href || (pathname?.startsWith(`${href}/`) ?? false);

  const isAccountActive =
    isPathActive('/shop/account') ||
    isPathActive('/shop/orders') ||
    pathname === '/shop/login' ||
    pathname === '/shop/signup';

  return (
    <nav
      aria-label="Shop"
      className="w-full flex justify-center bg-[var(--dp-dark-red)] border-b-2 border-red-800"
    >
      <ul className="w-full max-w-7xl flex flex-wrap items-center gap-3 md:gap-5 py-1 md:py-1.5 px-3 md:px-0">
        <li>
          <div className="group relative inline-block">
            <Link
              href="/shop"
              aria-current={isBrowseActive ? 'page' : undefined}
              aria-haspopup="menu"
              className={`inline-flex items-center gap-0.5 ${linkClass(isBrowseActive)}`}
            >
              Browse
              <span aria-hidden className="text-[0.65em] opacity-80">
                ▾
              </span>
            </Link>
            <div
              className="pointer-events-none absolute left-0 top-full z-[60] pt-1 opacity-0 invisible transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:visible group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus-within:visible whitespace-nowrap"
            >
              <ul
                role="menu"
                aria-label="Product categories"
                className="min-w-[12rem] rounded-md border border-red-800 bg-black/95 py-2 shadow-lg md:min-w-[14rem]"
              >
                <li role="none">
                  <Link
                    role="menuitem"
                    href="/shop"
                    className="block whitespace-normal px-4 py-2 font-cinzel text-base md:text-lg text-white no-underline hover:text-[var(--dp-light-red)]"
                  >
                    All products
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category.id} role="none">
                    <Link
                      role="menuitem"
                      href={`/shop/category/${category.handle}`}
                      className="block whitespace-normal px-4 py-2 font-cinzel text-base md:text-lg text-white no-underline hover:text-[var(--dp-light-red)]"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
                {categories.length === 0 ? (
                  <li role="none" className="px-4 py-2 font-cormorant_garamond text-sm text-gray-400">
                    No categories yet
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </li>
        <li className="ml-auto flex items-center gap-2 md:gap-3">
          <AccountNavDropdown
            isCustomerLoggedIn={isCustomerLoggedIn}
            customerDisplayName={customerDisplayName}
            customerAvatarUrl={customerAvatarUrl}
            linkClass={linkClass}
            isAccountActive={isAccountActive}
          />
          <CartNavDropdown cart={cart} linkClass={linkClass} />
        </li>
      </ul>
    </nav>
  );
}
