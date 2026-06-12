'use client';

import { getStripePublishableKey } from '@/app/lib/shop-payment';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js';
import { createContext, useMemo, type ReactNode } from 'react';

export const StripeCheckoutContext = createContext(false);

const stripePublishableKey = getStripePublishableKey();
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

type StripeCheckoutProviderProps = {
  clientSecret: string;
  children: ReactNode;
};

export function StripeCheckoutProvider({
  clientSecret,
  children,
}: StripeCheckoutProviderProps) {
  const options = useMemo<StripeElementsOptions>(
    () => ({ clientSecret }),
    [clientSecret]
  );

  if (!stripePromise) {
    return <>{children}</>;
  }

  return (
    <StripeCheckoutContext.Provider value={true}>
      <Elements stripe={stripePromise} options={options}>
        {children}
      </Elements>
    </StripeCheckoutContext.Provider>
  );
}

export function isStripeCheckoutConfigured(): boolean {
  return Boolean(stripePromise);
}
