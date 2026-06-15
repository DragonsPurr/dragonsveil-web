'use client';

import { logoutAction } from '@/app/shop/actions';
import { BoxIcon } from '@/components/icons/BoxIcon';
import {
  boxiconsUserCircle,
  boxiconsUserCircleFilled,
} from '@/components/icons/boxicons-cart';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItemClass =
  'block w-full text-left whitespace-normal px-3 py-1.5 font-cinzel text-sm text-white no-underline hover:text-(--dp-light-red) bg-transparent border-0 cursor-pointer';

type AccountNavDropdownProps = {
  isCustomerLoggedIn?: boolean;
  customerDisplayName?: string | null;
  customerAvatarUrl?: string | null;
  linkClass: (active: boolean) => string;
  isAccountActive: boolean;
};

function CustomerMenuHeader({
  displayName,
  avatarUrl,
}: {
  displayName: string;
  avatarUrl: string | null;
}) {
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden border border-(--dp-gray-600) bg-(--dp-gray-800) flex items-center justify-center">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={32}
            height={32}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="font-cinzel text-sm text-(--dp-light-red)" aria-hidden>
            {initials || '?'}
          </span>
        )}
      </div>
      <p className="font-cinzel text-sm font-bold text-white whitespace-normal min-w-0">
        {displayName}
      </p>
    </div>
  );
}

export function AccountNavDropdown({
  isCustomerLoggedIn = false,
  customerDisplayName = null,
  customerAvatarUrl = null,
  linkClass,
  isAccountActive,
}: AccountNavDropdownProps) {
  const pathname = usePathname();
  const loginActive = pathname === '/shop/login' || pathname === '/shop/signup';

  return (
    <div className="group relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={false}
        aria-label="Account menu"
        className={`inline-flex items-center gap-0.5 ${linkClass(isAccountActive || loginActive)}`}
      >
        <BoxIcon
          icon={isCustomerLoggedIn ? boxiconsUserCircleFilled : boxiconsUserCircle}
        />
        <span aria-hidden className="text-[0.65em] opacity-80">
          ▾
        </span>
      </button>
      <div className="pointer-events-none absolute right-0 top-full z-60 pt-1 opacity-0 invisible transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:visible group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus-within:visible">
        <ul
          role="menu"
          aria-label="Account"
          className="w-44 rounded-md border border-red-800 bg-black/95 py-2 shadow-lg"
        >
          {isCustomerLoggedIn && customerDisplayName ? (
            <li role="none" className="px-3 pb-2">
              <CustomerMenuHeader
                displayName={customerDisplayName}
                avatarUrl={customerAvatarUrl}
              />
              <div className="mt-2 border-b border-red-800" aria-hidden />
            </li>
          ) : (
            <li role="none">
              <Link
                role="menuitem"
                href="/shop/login"
                aria-current={loginActive ? 'page' : undefined}
                className={menuItemClass}
              >
                Login or create account
              </Link>
            </li>
          )}
          <li role="none">
            <Link
              role="menuitem"
              href="/shop/orders"
              aria-current={pathname === '/shop/orders' ? 'page' : undefined}
              className={menuItemClass}
            >
              Order history
            </Link>
          </li>
          <li role="none">
            <Link
              role="menuitem"
              href="/shop/account"
              aria-current={pathname === '/shop/account' ? 'page' : undefined}
              className={menuItemClass}
            >
              Manage account
            </Link>
          </li>
          <li role="none">
            <form action={logoutAction}>
              <button type="submit" role="menuitem" className={menuItemClass}>
                Log out
              </button>
            </form>
          </li>
        </ul>
      </div>
    </div>
  );
}
