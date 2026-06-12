import type { HttpTypes } from '@medusajs/types';

export function isStripePaymentProvider(providerId: string): boolean {
  return providerId.includes('stripe');
}

export function isManualPaymentProvider(providerId: string): boolean {
  return (
    providerId.includes('pp_system_default') ||
    providerId.includes('manual')
  );
}

export function getStripePublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || undefined;
}

export function findPaymentSession(
  cart: HttpTypes.StoreCart,
  providerId: string
): HttpTypes.StorePaymentSession | undefined {
  const sessions = cart.payment_collection?.payment_sessions ?? [];
  return (
    sessions.find((s) => s.provider_id === providerId) ??
    sessions.find((s) => isStripePaymentProvider(s.provider_id ?? '')) ??
    sessions[0]
  );
}

export function getPaymentSessionClientSecret(
  session: HttpTypes.StorePaymentSession | undefined
): string | undefined {
  const data = session?.data as { client_secret?: string } | undefined;
  return data?.client_secret;
}

export function isPaymentAuthorized(cart: HttpTypes.StoreCart): boolean {
  if (cart.payment_collection?.status === 'authorized') {
    return true;
  }
  return (cart.payment_collection?.payment_sessions ?? []).some(
    (s) => s.status === 'authorized'
  );
}

export function cartReadyForPayment(cart: HttpTypes.StoreCart): boolean {
  const shipping = cart.shipping_address;
  return Boolean(
    cart.email &&
      shipping?.first_name &&
      shipping?.address_1 &&
      shipping?.country_code
  );
}
