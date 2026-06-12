'use client';

import { formatMoney } from '@/app/lib/shop-pricing';
import { updateCartLineItemAction } from '@/app/shop/actions';
import { CartQuantityControls } from '@/components/shop/CartQuantityControls';
import type { HttpTypes } from '@medusajs/types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type CartViewProps = {
  cart: HttpTypes.StoreCart;
};

export function CartView({ cart }: CartViewProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const items = cart.items ?? [];
  const totalLabel = formatMoney(cart.total, cart.currency_code);

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

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <p className="dp-body-text">Your cart is empty.</p>
        <Link href="/shop" className="dp-link font-cinzel text-lg">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ul className="divide-y divide-red-900/50">
        {items.map((item) => {
          const thumb = item.thumbnail ?? item.variant?.product?.thumbnail ?? item.product?.thumbnail;
          const lineTotal = formatMoney(
            item.total ?? (item.unit_price ?? 0) * item.quantity,
            cart.currency_code
          );
          return (
            <li key={item.id} className="py-6 grid grid-cols-1 sm:grid-cols-[120px_1fr_auto] gap-4 items-start">
              <div className="w-[120px] aspect-square rounded-lg overflow-hidden bg-gray-800/60">
                {thumb ? (
                  <Image src={thumb} alt={item.title} width={120} height={120} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">No image</div>
                )}
              </div>
              <div>
                <h2 className="font-cinzel text-lg text-white">{item.product_title ?? item.title}</h2>
                {item.variant_title && item.variant_title !== 'Default variant' ? (
                  <p className="font-cormorant_garamond text-gray-400">{item.variant_title}</p>
                ) : null}
                <p className="font-cormorant_garamond text-gray-300 mt-1">{lineTotal}</p>
              </div>
              <CartQuantityControls
                lineId={item.id}
                quantity={item.quantity}
                pending={pendingId === item.id}
                onQuantity={handleQuantity}
                decreaseLabel="Decrease quantity"
                increaseLabel="Increase quantity"
              />
            </li>
          );
        })}
      </ul>

      {error ? (
        <p className="text-red-400 font-cormorant_garamond text-lg" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-red-900/60 pt-6">
        {totalLabel ? (
          <p className="font-cinzel_decorative text-2xl text-red-600">Total: {totalLabel}</p>
        ) : null}
        <Link href="/shop/checkout" className="dp-form-button text-center">
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
