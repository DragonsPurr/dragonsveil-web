'use client';

import type { ShopCartNavItem, ShopCartNavPreview } from '@/app/lib/medusa-cart';
import { formatMoney } from '@/app/lib/shop-pricing';
import { updateCartLineItemAction } from '@/app/shop/actions';
import { CartQuantityControls } from '@/components/shop/CartQuantityControls';
import { BoxIcon } from '@/components/icons/BoxIcon';
import { boxiconsCart, boxiconsCartFilled } from '@/components/icons/boxicons-cart';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

type CartNavDropdownProps = {
  cart: ShopCartNavPreview;
  linkClass: (active: boolean) => string;
};

function CartPreviewLine({
  item,
  currencyCode,
  pendingId,
  onQuantity,
}: {
  item: ShopCartNavItem;
  currencyCode: string | null;
  pendingId: string | null;
  onQuantity: (lineId: string, quantity: number) => void;
}) {
  const lineTotal = formatMoney(item.lineTotal, currencyCode);

  return (
    <li className="flex gap-3 px-4 py-3 border-b border-red-900/40 last:border-b-0">
      <div className="w-12 h-12 shrink-0 rounded-sm overflow-hidden bg-gray-800/60">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt=""
            width={48}
            height={48}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
            —
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-cinzel text-sm text-white leading-tight truncate">{item.title}</p>
        {item.variantTitle ? (
          <p className="font-cormorant_garamond text-xs text-gray-400 truncate">{item.variantTitle}</p>
        ) : null}
        {lineTotal ? (
          <p className="font-cormorant_garamond text-sm text-gray-300">{lineTotal}</p>
        ) : null}
        <div className="pt-0.5">
          <CartQuantityControls
          lineId={item.id}
          quantity={item.quantity}
          pending={pendingId === item.id}
          onQuantity={onQuantity}
          decreaseLabel={`Decrease quantity of ${item.title}`}
          increaseLabel={`Increase quantity of ${item.title}`}
          size="sm"
          />
        </div>
      </div>
    </li>
  );
}

export function CartNavDropdown({ cart, linkClass }: CartNavDropdownProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isCartActive = pathname === '/shop/cart' || pathname === '/shop/checkout';
  const isEmpty = cart.items.length === 0;
  const totalLabel = formatMoney(cart.total, cart.currencyCode);
  const cartLabel =
    cart.itemCount > 0 ? `Cart, ${cart.itemCount} items` : 'Cart';

  const handleQuantity = async (lineId: string, quantity: number) => {
    setPendingId(lineId);
    setError(null);
    const result = await updateCartLineItemAction(lineId, quantity);
    setPendingId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  };

  return (
    <div className="group relative inline-block">
      <div
        className={`inline-flex items-center gap-0.5 ${linkClass(isCartActive)}`}
      >
        <Link
          href="/shop/cart"
          aria-current={pathname === '/shop/cart' ? 'page' : undefined}
          aria-label={cartLabel}
          className="inline-flex items-center gap-1.5 no-underline text-inherit hover:text-inherit"
        >
          <BoxIcon icon={cart.itemCount > 0 ? boxiconsCartFilled : boxiconsCart} />
          {cart.itemCount > 0 ? (
            <span className="tabular-nums">{cart.itemCount}</span>
          ) : null}
        </Link>
        <span aria-hidden className="text-[0.65em] opacity-80">
          ▾
        </span>
      </div>
      <div className="pointer-events-none absolute right-0 top-full z-60 pt-1 opacity-0 invisible transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:visible group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus-within:visible">
        <div
          role="region"
          aria-label="Cart preview"
          className={`rounded-md border border-red-800 bg-black/95 shadow-lg w-max max-w-[min(100vw-1.5rem,22rem)] ${
            isEmpty ? '' : 'min-w-[min(100vw-1.5rem,18rem)]'
          }`}
        >
          {isEmpty ? (
            <>
              <p className="px-4 py-3 font-cormorant_garamond text-sm text-gray-400 whitespace-nowrap">
                Your cart is empty.
              </p>
              <div className="mx-4 border-t border-red-800" aria-hidden />
              <div className="px-4 py-3">
                <Link
                  href="/shop/cart"
                  className="block font-cinzel text-sm text-white no-underline hover:text-(--dp-light-red)"
                >
                  View cart
                </Link>
              </div>
            </>
          ) : (
            <>
              <ul className="max-h-[min(60vh,20rem)] overflow-y-auto">
                {cart.items.map((item) => (
                  <CartPreviewLine
                    key={item.id}
                    item={item}
                    currencyCode={cart.currencyCode}
                    pendingId={pendingId}
                    onQuantity={handleQuantity}
                  />
                ))}
              </ul>
              {error ? (
                <p className="px-4 py-2 text-red-400 font-cormorant_garamond text-sm" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="mx-4 border-t border-red-800" aria-hidden />
              <div className="px-4 py-3 space-y-2">
                {totalLabel ? (
                  <p className="font-cinzel text-base text-(--dp-light-red)">
                    Total: {totalLabel}
                  </p>
                ) : null}
                <Link
                  href="/shop/cart"
                  className="block font-cinzel text-sm text-white no-underline hover:text-(--dp-light-red)"
                >
                  View cart
                </Link>
                <Link
                  href="/shop/checkout"
                  className="block font-cinzel text-sm text-white/90 no-underline hover:text-(--dp-light-red)"
                >
                  Checkout
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
