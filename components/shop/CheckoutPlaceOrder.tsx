'use client';

import {
  findPaymentSession,
  getPaymentSessionClientSecret,
  isManualPaymentProvider,
  isStripePaymentProvider,
} from '@/app/lib/shop-payment';
import {
  completeCheckoutAction,
  initiateCheckoutPaymentAction,
} from '@/app/shop/actions';
import {
  isStripeCheckoutConfigured,
  StripeCheckoutContext,
  StripeCheckoutProvider,
} from '@/components/shop/StripeCheckoutProvider';
import type { HttpTypes } from '@medusajs/types';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';

type CheckoutPlaceOrderProps = {
  cart: HttpTypes.StoreCart;
  paymentProviderId: string;
  shippingOptionId: string | undefined;
  shippingRequired: boolean;
  shippingMethodApplied: boolean;
  totalLabel: string | null;
};

export function CheckoutPlaceOrder(props: CheckoutPlaceOrderProps) {
  const { paymentProviderId } = props;
  const usesStripe = isStripePaymentProvider(paymentProviderId);
  const [clientSecret, setClientSecret] = useState<string | null>(() => {
    const session = findPaymentSession(props.cart, paymentProviderId);
    return getPaymentSessionClientSecret(session) ?? null;
  });

  if (
    usesStripe &&
    clientSecret &&
    isStripeCheckoutConfigured()
  ) {
    return (
      <StripeCheckoutProvider clientSecret={clientSecret}>
        <CheckoutPlaceOrderBody
          {...props}
          clientSecret={clientSecret}
          onClientSecret={setClientSecret}
        />
      </StripeCheckoutProvider>
    );
  }

  return (
    <CheckoutPlaceOrderBody
      {...props}
      clientSecret={clientSecret}
      onClientSecret={setClientSecret}
    />
  );
}

type BodyProps = CheckoutPlaceOrderProps & {
  clientSecret: string | null;
  onClientSecret: (secret: string | null) => void;
};

function CheckoutPlaceOrderBody({
  cart,
  paymentProviderId,
  shippingOptionId,
  shippingRequired,
  shippingMethodApplied,
  totalLabel,
  clientSecret,
  onClientSecret,
}: BodyProps) {
  const router = useRouter();
  const usesStripe = isStripePaymentProvider(paymentProviderId);
  const usesManual = isManualPaymentProvider(paymentProviderId);
  const stripeReady = useContext(StripeCheckoutContext);
  const stripe = useStripe();
  const elements = useElements();

  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [paymentInitError, setPaymentInitError] = useState<string | null>(null);
  const [initializingPayment, setInitializingPayment] = useState(false);
  const [paymentFormComplete, setPaymentFormComplete] = useState(false);

  const shippingBlocked =
    shippingRequired && !shippingMethodApplied && !shippingOptionId;

  useEffect(() => {
    if (!usesStripe || shippingBlocked || !paymentProviderId || clientSecret) {
      return;
    }

    let cancelled = false;
    setInitializingPayment(true);
    setPaymentInitError(null);

    void initiateCheckoutPaymentAction(paymentProviderId, shippingOptionId).then(
      (result) => {
        if (cancelled) return;
        setInitializingPayment(false);
        if (!result.ok) {
          setPaymentInitError(result.error);
          return;
        }
        if (result.clientSecret) {
          onClientSecret(result.clientSecret);
        } else {
          setPaymentInitError(
            'Payment could not be initialized. Check Stripe configuration on Medusa.'
          );
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [
    cart.id,
    clientSecret,
    onClientSecret,
    paymentProviderId,
    shippingBlocked,
    shippingOptionId,
    usesStripe,
  ]);

  const finalizeOrder = async () => {
    setCheckoutError(null);
    setCompleting(true);
    const result = await completeCheckoutAction(
      paymentProviderId,
      shippingOptionId,
      cart.id
    );
    setCompleting(false);
    if (!result.ok) {
      setCheckoutError(result.error);
      return;
    }
    router.push(`/shop/orders?placed=${result.orderId}`);
    router.refresh();
  };

  const handleStripePlaceOrder = async () => {
    if (!stripeReady || !stripe || !elements) {
      setCheckoutError('Payment form is still loading. Please wait a moment.');
      return;
    }

    setCheckoutError(null);
    setCompleting(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setCheckoutError(submitError.message ?? 'Check your payment details.');
      setCompleting(false);
      return;
    }

    if (!clientSecret) {
      setCheckoutError('Payment session expired. Refresh the page and try again.');
      setCompleting(false);
      return;
    }

    const billing = cart.billing_address ?? cart.shipping_address;

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/api/shop/capture-payment/${cart.id}`,
        payment_method_data: {
          billing_details: {
            name: [billing?.first_name, billing?.last_name].filter(Boolean).join(' ') || undefined,
            email: cart.email ?? undefined,
            phone: billing?.phone ?? undefined,
            address: {
              city: billing?.city ?? undefined,
              country: billing?.country_code ?? undefined,
              line1: billing?.address_1 ?? undefined,
              line2: billing?.address_2 ?? undefined,
              postal_code: billing?.postal_code ?? undefined,
              state: billing?.province ?? undefined,
            },
          },
        },
      },
      redirect: 'if_required',
    });

    if (error) {
      const pi = error.payment_intent;
      if (
        pi &&
        (pi.status === 'succeeded' || pi.status === 'requires_capture')
      ) {
        await finalizeOrder();
        return;
      }
      setCheckoutError(error.message ?? 'Payment failed.');
      setCompleting(false);
      return;
    }

    if (
      paymentIntent?.status === 'succeeded' ||
      paymentIntent?.status === 'requires_capture'
    ) {
      await finalizeOrder();
      return;
    }

    setCheckoutError('Payment was not completed. Try again.');
    setCompleting(false);
  };

  const handlePlaceOrder = async () => {
    if (usesStripe) {
      await handleStripePlaceOrder();
      return;
    }
    await finalizeOrder();
  };

  const placeOrderDisabled =
    completing ||
    initializingPayment ||
    shippingBlocked ||
    (cart.items?.length ?? 0) === 0 ||
    !paymentProviderId ||
    (usesStripe && (!clientSecret || !paymentFormComplete));

  return (
    <section>
      <h2 className="dp-section-header text-xl mb-4">Payment</h2>

      {!paymentProviderId ? (
        <p className="dp-body-text text-gray-400">No payment provider is available for this region.</p>
      ) : null}

      {usesStripe && !isStripeCheckoutConfigured() ? (
        <p className="text-red-400 font-cormorant_garamond" role="alert">
          Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable card payments.
        </p>
      ) : null}

      {usesStripe && isStripeCheckoutConfigured() ? (
        <div className="space-y-4 mb-6">
          {initializingPayment ? (
            <p className="font-cormorant_garamond text-sm text-gray-400">Loading payment form…</p>
          ) : null}
          {paymentInitError ? (
            <p className="text-red-400 font-cormorant_garamond" role="alert">
              {paymentInitError}
            </p>
          ) : null}
          {clientSecret && stripeReady ? (
            <PaymentElement
              onChange={(event) => {
                setPaymentFormComplete(event.complete);
                if (event.complete) setCheckoutError(null);
              }}
            />
          ) : null}
        </div>
      ) : null}

      {usesManual ? (
        <p className="dp-body-text text-gray-400 mb-4">
          Test checkout — payment is simulated (no card required).
        </p>
      ) : null}

      {totalLabel ? (
        <p className="font-cinzel_decorative text-2xl text-red-600">Order total: {totalLabel}</p>
      ) : null}
      <button
        type="button"
        onClick={() => void handlePlaceOrder()}
        disabled={placeOrderDisabled}
        className="dp-form-button mt-4"
      >
        {completing ? 'Placing order…' : 'Place order'}
      </button>
      {checkoutError ? (
        <p className="text-red-400 mt-2" role="alert">
          {checkoutError}
        </p>
      ) : null}
    </section>
  );
}
