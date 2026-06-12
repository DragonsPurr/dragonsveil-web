import { retrieveShopCart } from '@/app/lib/medusa-cart';
import { CartView } from '@/components/shop/CartView';
import { MedusaConfigAlert } from '@/components/shop/MedusaConfigAlert';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review items in your cart.',
};

export default async function CartPage() {
  const result = await retrieveShopCart();

  return (
    <div className="container mx-auto w-full">
      <MedusaConfigAlert />
      <h1 className="dp-page-header">Cart</h1>
      {!result.ok ? (
        <div
          className="rounded-lg border border-red-700 bg-red-900/40 px-4 py-3 font-cormorant_garamond text-lg text-red-100"
          role="alert"
        >
          {result.error}
        </div>
      ) : result.cart ? (
        <CartView cart={result.cart} />
      ) : (
        <div className="space-y-4">
          <p className="dp-body-text">Your cart is empty.</p>
          <Link href="/shop" className="dp-link font-cinzel text-lg">
            Continue shopping
          </Link>
        </div>
      )}
      {result.ok && result.cart ? (
        <p className="mt-8">
          <Link href="/shop" className="dp-link font-cinzel text-lg">
            ← Continue shopping
          </Link>
        </p>
      ) : null}
    </div>
  );
}
