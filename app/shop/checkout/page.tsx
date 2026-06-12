import { getCheckoutData } from '@/app/shop/actions';
import { CheckoutForm } from '@/components/shop/CheckoutForm';
import { MedusaConfigAlert } from '@/components/shop/MedusaConfigAlert';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your order.',
};

export default async function CheckoutPage() {
  const data = await getCheckoutData();

  if (!data.ok) {
    return (
      <div className="container mx-auto w-full">
        <MedusaConfigAlert />
        <h1 className="dp-page-header">Checkout</h1>
        <div
          className="rounded-lg border border-red-700 bg-red-900/40 px-4 py-3 font-cormorant_garamond text-lg text-red-100"
          role="alert"
        >
          {data.error}
        </div>
      </div>
    );
  }

  if ((data.cart.items?.length ?? 0) === 0) {
    redirect('/shop/cart');
  }

  return (
    <div className="container mx-auto w-full">
      <MedusaConfigAlert />
      <h1 className="dp-page-header">Checkout</h1>
      <Suspense fallback={<p className="font-cormorant_garamond text-gray-400">Loading checkout…</p>}>
        <CheckoutForm
          cart={data.cart}
          shippingOptions={data.shippingOptions}
          paymentProviders={data.paymentProviders}
          customer={data.customer}
          countries={data.countries}
        />
      </Suspense>
      <p className="mt-8">
        <Link href="/shop/cart" className="dp-link font-cinzel text-lg">
          ← Back to cart
        </Link>
      </p>
    </div>
  );
}
