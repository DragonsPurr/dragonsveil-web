import {
  findPaymentSession,
  getPaymentSessionClientSecret,
  isStripePaymentProvider,
} from '@/app/lib/shop-payment';
import { completeCheckoutAction } from '@/app/shop/actions';
import { retrieveCartById } from '@/app/lib/medusa-cart';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ cartId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { cartId } = await params;
  const { origin, searchParams } = request.nextUrl;

  const paymentIntentId = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
  const redirectStatus = searchParams.get('redirect_status') ?? '';

  const cart = await retrieveCartById(cartId);
  if (!cart) {
    return NextResponse.redirect(`${origin}/shop/checkout?error=cart_not_found`);
  }

  const paymentSession = (cart.payment_collection?.payment_sessions ?? []).find(
    (session) => {
      const data = session.data as { id?: string; client_secret?: string };
      return (
        data?.id === paymentIntentId &&
        data?.client_secret === paymentIntentClientSecret
      );
    }
  );

  const fallbackSession = findPaymentSession(
    cart,
    paymentSession?.provider_id ?? 'pp_stripe_stripe'
  );
  const session = paymentSession ?? fallbackSession;
  const providerId = session?.provider_id;

  if (
    !session ||
    !providerId ||
    !isStripePaymentProvider(providerId) ||
    getPaymentSessionClientSecret(session) !== paymentIntentClientSecret ||
    !['succeeded', 'pending'].includes(redirectStatus)
  ) {
    return NextResponse.redirect(`${origin}/shop/checkout?error=payment_failed`);
  }

  const result = await completeCheckoutAction(providerId, undefined, cartId);
  if (!result.ok) {
    const message = encodeURIComponent(result.error);
    return NextResponse.redirect(
      `${origin}/shop/checkout?error=payment_failed&message=${message}`
    );
  }

  return NextResponse.redirect(`${origin}/shop/orders?placed=${result.orderId}`);
}
