'use server';

import {
  clearMedusaAuthToken,
  getMedusaAuthHeaders,
  retrieveLoggedInCustomer,
  setMedusaAuthToken,
} from '@/app/lib/medusa-auth';
import {
  MEDUSA_CART_ID_COOKIE,
} from '@/app/lib/medusa-cookies';
import {
  CART_FIELDS,
  getCartIdFromCookie,
  ensureCart,
  retrieveCartById,
  retrieveShopCart,
} from '@/app/lib/medusa-cart';
import {
  AVATAR_MAX_BYTES,
  CUSTOMER_AVATAR_METADATA_KEY,
  isAllowedAvatarMimeType,
} from '@/app/lib/customer-avatar';
import { isMedusaConfigured, sdk } from '@/app/lib/medusa';
import {
  getDefaultRegionId,
  listStoreCountries,
  mergeCountriesWithSubdivisions,
} from '@/app/lib/medusa-region';
import { isOvhUserAssetsConfigured, uploadCustomerAvatarToOvh } from '@/app/lib/ovh-user-assets';
import {
  findPaymentSession,
  getPaymentSessionClientSecret,
  isManualPaymentProvider,
  isStripePaymentProvider,
} from '@/app/lib/shop-payment';
import type { HttpTypes } from '@medusajs/types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateShop() {
  revalidatePath('/', 'layout');
  revalidatePath('/shop', 'layout');
  revalidatePath('/shop/cart');
  revalidatePath('/shop/checkout');
  revalidatePath('/shop/account');
  revalidatePath('/shop/orders');
  revalidatePath('/shop/login');
  revalidatePath('/shop/signup');
}

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (!isMedusaConfigured()) {
    return { ok: false, error: 'Medusa is not configured.' };
  }

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { ok: false, error: 'Email and password are required.' };
  }

  let token: string;
  try {
    const result = await sdk.auth.login('customer', 'emailpass', { email, password });
    if (typeof result !== 'string') {
      return { ok: false, error: 'Login requires additional steps that are not supported here.' };
    }
    token = result;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed.';
    return { ok: false, error: message };
  }

  await setMedusaAuthToken(token);

  const cartId = await getCartIdFromCookie();
  if (cartId) {
    try {
      await sdk.store.cart.transferCart(cartId, { fields: CART_FIELDS }, await getMedusaAuthHeaders());
    } catch {
      // Guest cart may not transfer; continue after login
    }
  }

  revalidateShop();
  redirect('/shop/account');
}

export async function signupAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (!isMedusaConfigured()) {
    return { ok: false, error: 'Medusa is not configured.' };
  }

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const firstName = String(formData.get('first_name') ?? '').trim();
  const lastName = String(formData.get('last_name') ?? '').trim();

  if (!email || !password) {
    return { ok: false, error: 'Email and password are required.' };
  }

  let token: string;
  try {
    token = await sdk.auth.register('customer', 'emailpass', { email, password });
    const headers = { Authorization: `Bearer ${token}` };

    await sdk.store.customer.create(
      {
        email,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
      },
      {},
      headers
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign up failed.';
    return { ok: false, error: message };
  }

  await setMedusaAuthToken(token);
  revalidateShop();
  redirect('/shop/account');
}

async function requireCustomerHeaders(): Promise<
  { ok: true; headers: Record<string, string> } | { ok: false; error: string }
> {
  const headers = await getMedusaAuthHeaders();
  if (!headers.Authorization) {
    return { ok: false, error: 'You must be signed in.' };
  }
  return { ok: true, headers };
}

function customerAddressToCartShipping(
  address: HttpTypes.StoreCustomerAddress
): NonNullable<Exclude<HttpTypes.StoreUpdateCart['shipping_address'], string>> {
  return {
    first_name: address.first_name ?? '',
    last_name: address.last_name ?? undefined,
    company: address.company ?? undefined,
    address_1: address.address_1 ?? '',
    address_2: address.address_2 ?? undefined,
    city: address.city ?? '',
    province: address.province ?? undefined,
    country_code: (address.country_code ?? '').toLowerCase(),
    postal_code: address.postal_code ?? undefined,
    phone: address.phone ?? undefined,
  };
}

function cartHasShippingMethod(cart: HttpTypes.StoreCart): boolean {
  return (cart.shipping_methods?.length ?? 0) > 0;
}

function getAppliedShippingOptionId(cart: HttpTypes.StoreCart): string | undefined {
  const method = cart.shipping_methods?.[0] as
    | { shipping_option_id?: string; option_id?: string }
    | undefined;
  return method?.shipping_option_id ?? method?.option_id;
}

async function listCartShippingOptions(
  cartId: string,
  headers: Record<string, string>
): Promise<HttpTypes.StoreCartShippingOption[]> {
  const { shipping_options } = await sdk.store.fulfillment.listCartOptions(
    { cart_id: cartId },
    headers
  );
  return shipping_options ?? [];
}

async function addShippingMethodToCart(
  cartId: string,
  optionId: string,
  headers: Record<string, string>
): Promise<void> {
  await sdk.store.cart.addShippingMethod(
    cartId,
    { option_id: optionId },
    { fields: CART_FIELDS },
    headers
  );
}

/** Applies the only available option, or the requested one when valid. */
async function ensureCartShippingMethod(
  cartId: string,
  headers: Record<string, string>,
  preferredOptionId?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const cart = await retrieveCartById(cartId);
  if (!cart) return { ok: false, error: 'Cart not found.' };
  if (cartHasShippingMethod(cart)) return { ok: true };

  const options = await listCartShippingOptions(cartId, headers);
  if (options.length === 0) return { ok: true };

  const optionId =
    preferredOptionId && options.some((o) => o.id === preferredOptionId)
      ? preferredOptionId
      : options.length === 1
        ? options[0].id
        : undefined;

  if (!optionId) {
    return { ok: false, error: 'Select a shipping method before placing your order.' };
  }

  try {
    await addShippingMethodToCart(cartId, optionId, headers);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not set shipping method.';
    return { ok: false, error: message };
  }
}

async function tryAutoApplySingleShippingMethod(
  cartId: string,
  headers: Record<string, string>
): Promise<void> {
  const cart = await retrieveCartById(cartId);
  if (!cart || cartHasShippingMethod(cart)) return;

  const options = await listCartShippingOptions(cartId, headers);
  if (options.length !== 1) return;

  try {
    await addShippingMethodToCart(cartId, options[0].id, headers);
  } catch {
    // Checkout will surface a clear error if shipping is still required
  }
}

function parseAddressBody(formData: FormData) {
  return {
    address_name: String(formData.get('address_name') ?? '').trim() || undefined,
    first_name: String(formData.get('first_name') ?? '').trim(),
    last_name: String(formData.get('last_name') ?? '').trim() || undefined,
    company: String(formData.get('company') ?? '').trim() || undefined,
    address_1: String(formData.get('address_1') ?? '').trim(),
    address_2: String(formData.get('address_2') ?? '').trim() || undefined,
    city: String(formData.get('city') ?? '').trim(),
    province: String(formData.get('province') ?? '').trim() || undefined,
    country_code: String(formData.get('country_code') ?? '').trim().toLowerCase(),
    postal_code: String(formData.get('postal_code') ?? '').trim() || undefined,
    phone: String(formData.get('phone') ?? '').trim() || undefined,
    is_default_shipping: formData.get('is_default_shipping') === 'on',
    is_default_billing: formData.get('is_default_billing') === 'on',
  };
}

function getAvatarUploadFile(formData: FormData): File | null {
  const entry = formData.get('avatar');
  if (!entry || typeof entry === 'string') return null;
  const file = entry as File;
  if (!file.size) return null;
  return file;
}

export async function uploadCustomerAvatarAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (!isMedusaConfigured()) {
    return { ok: false, error: 'Medusa is not configured.' };
  }
  if (!isOvhUserAssetsConfigured()) {
    return { ok: false, error: 'Profile photo upload is not configured.' };
  }

  const auth = await requireCustomerHeaders();
  if (!auth.ok) return auth;

  const customer = await retrieveLoggedInCustomer();
  if (!customer) {
    return { ok: false, error: 'You must be signed in.' };
  }

  const file = getAvatarUploadFile(formData);
  if (!file) {
    return { ok: false, error: 'Choose an image to upload.' };
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return { ok: false, error: 'Image must be 2 MB or smaller.' };
  }
  if (!isAllowedAvatarMimeType(file.type)) {
    return { ok: false, error: 'Use a JPEG, PNG, WebP, or GIF image.' };
  }

  try {
    const body = new Uint8Array(await file.arrayBuffer());
    const avatarUrl = await uploadCustomerAvatarToOvh(customer.id, body, file.type);

    await sdk.store.customer.update(
      {
        metadata: {
          ...(customer.metadata ?? {}),
          [CUSTOMER_AVATAR_METADATA_KEY]: avatarUrl,
        },
      },
      { fields: '*addresses' },
      auth.headers
    );
    revalidateShop();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not upload profile photo.';
    return { ok: false, error: message };
  }
}

export async function removeCustomerAvatarAction(): Promise<ActionResult> {
  if (!isMedusaConfigured()) {
    return { ok: false, error: 'Medusa is not configured.' };
  }

  const auth = await requireCustomerHeaders();
  if (!auth.ok) return auth;

  const customer = await retrieveLoggedInCustomer();
  if (!customer) {
    return { ok: false, error: 'You must be signed in.' };
  }

  const metadata = { ...(customer.metadata ?? {}) };
  delete metadata[CUSTOMER_AVATAR_METADATA_KEY];

  try {
    await sdk.store.customer.update(
      { metadata },
      { fields: '*addresses' },
      auth.headers
    );
    revalidateShop();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not remove profile photo.';
    return { ok: false, error: message };
  }
}

export async function updateCustomerProfileAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (!isMedusaConfigured()) {
    return { ok: false, error: 'Medusa is not configured.' };
  }

  const auth = await requireCustomerHeaders();
  if (!auth.ok) return auth;

  const first_name = String(formData.get('first_name') ?? '').trim();
  const last_name = String(formData.get('last_name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const company_name = String(formData.get('company_name') ?? '').trim();

  try {
    await sdk.store.customer.update(
      {
        first_name: first_name || undefined,
        last_name: last_name || undefined,
        phone: phone || undefined,
        company_name: company_name || undefined,
      },
      { fields: '*addresses' },
      auth.headers
    );
    revalidateShop();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not update profile.';
    return { ok: false, error: message };
  }
}

export async function saveCustomerAddressAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (!isMedusaConfigured()) {
    return { ok: false, error: 'Medusa is not configured.' };
  }

  const auth = await requireCustomerHeaders();
  if (!auth.ok) return auth;

  const addressId = String(formData.get('address_id') ?? '').trim();
  const body = parseAddressBody(formData);

  if (!body.first_name || !body.address_1 || !body.city || !body.country_code) {
    return { ok: false, error: 'Fill in name, address, city, and country.' };
  }

  try {
    if (addressId) {
      await sdk.store.customer.updateAddress(
        addressId,
        body,
        { fields: '*addresses' },
        auth.headers
      );
    } else {
      await sdk.store.customer.createAddress(
        body,
        { fields: '*addresses' },
        auth.headers
      );
    }
    revalidateShop();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not save address.';
    return { ok: false, error: message };
  }
}

export async function deleteCustomerAddressAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (!isMedusaConfigured()) {
    return { ok: false, error: 'Medusa is not configured.' };
  }

  const auth = await requireCustomerHeaders();
  if (!auth.ok) return auth;

  const addressId = String(formData.get('address_id') ?? '').trim();
  if (!addressId) {
    return { ok: false, error: 'Address not found.' };
  }

  try {
    await sdk.store.customer.deleteAddress(addressId, auth.headers);
    revalidateShop();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not delete address.';
    return { ok: false, error: message };
  }
}

export async function logoutAction(): Promise<void> {
  const headers = await getMedusaAuthHeaders();
  const token = headers.Authorization?.replace(/^Bearer\s+/i, '');
  if (token) {
    try {
      await sdk.client.setToken(token);
      await sdk.auth.logout();
    } catch {
      // Clear local session even if Medusa logout fails
    }
  }
  await clearMedusaAuthToken();
  revalidateShop();
  redirect('/shop/login');
}

export async function addToCartAction(
  variantId: string,
  quantity = 1
): Promise<ActionResult> {
  if (!variantId) return { ok: false, error: 'Select a variant.' };

  const cartResult = await ensureCart();
  if (!cartResult.ok) return { ok: false, error: cartResult.error };

  try {
    const headers = await getMedusaAuthHeaders();
    await sdk.store.cart.createLineItem(
      cartResult.cart.id,
      { variant_id: variantId, quantity },
      { fields: CART_FIELDS },
      headers
    );
    revalidateShop();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not add to cart.';
    return { ok: false, error: message };
  }
}

export async function updateCartLineItemAction(
  lineId: string,
  quantity: number
): Promise<ActionResult> {
  const cartId = await getCartIdFromCookie();
  if (!cartId) return { ok: false, error: 'Cart not found.' };

  try {
    const headers = await getMedusaAuthHeaders();
    if (quantity < 1) {
      await sdk.store.cart.deleteLineItem(cartId, lineId, { fields: CART_FIELDS }, headers);
    } else {
      await sdk.store.cart.updateLineItem(
        cartId,
        lineId,
        { quantity },
        { fields: CART_FIELDS },
        headers
      );
    }
    revalidateShop();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not update cart.';
    return { ok: false, error: message };
  }
}

export async function applySavedAddressToCartAction(
  addressId: string
): Promise<ActionResult> {
  const cartId = await getCartIdFromCookie();
  if (!cartId) return { ok: false, error: 'Cart not found.' };

  const auth = await requireCustomerHeaders();
  if (!auth.ok) return auth;

  const customer = await retrieveLoggedInCustomer();
  if (!customer?.email) {
    return { ok: false, error: 'You must be signed in.' };
  }

  const address = customer.addresses?.find((a) => a.id === addressId);
  if (!address) {
    return { ok: false, error: 'Address not found.' };
  }

  const shippingAddress = customerAddressToCartShipping(address);
  if (!shippingAddress.first_name || !shippingAddress.address_1 || !shippingAddress.country_code) {
    return { ok: false, error: 'This saved address is incomplete.' };
  }

  try {
    const headers = await getMedusaAuthHeaders();
    await sdk.store.cart.update(
      cartId,
      {
        email: customer.email,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
      },
      { fields: CART_FIELDS },
      headers
    );
    await tryAutoApplySingleShippingMethod(cartId, headers);
    revalidateShop();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not apply address.';
    return { ok: false, error: message };
  }
}

export async function updateCartAddressAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const cartId = await getCartIdFromCookie();
  if (!cartId) return { ok: false, error: 'Cart not found.' };

  const email = String(formData.get('email') ?? '').trim();
  const shippingAddress = {
    first_name: String(formData.get('first_name') ?? '').trim(),
    last_name: String(formData.get('last_name') ?? '').trim(),
    address_1: String(formData.get('address_1') ?? '').trim(),
    address_2: String(formData.get('address_2') ?? '').trim() || undefined,
    city: String(formData.get('city') ?? '').trim(),
    province: String(formData.get('province') ?? '').trim() || undefined,
    country_code: String(formData.get('country_code') ?? '').trim().toLowerCase(),
    postal_code: String(formData.get('postal_code') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim() || undefined,
  };

  if (!email || !shippingAddress.first_name || !shippingAddress.address_1 || !shippingAddress.country_code) {
    return { ok: false, error: 'Fill in email, name, address, and country.' };
  }

  try {
    const headers = await getMedusaAuthHeaders();
    await sdk.store.cart.update(
      cartId,
      {
        email,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
      },
      { fields: CART_FIELDS },
      headers
    );
    await tryAutoApplySingleShippingMethod(cartId, headers);
    revalidateShop();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not update address.';
    return { ok: false, error: message };
  }
}

export async function initiateCheckoutPaymentAction(
  providerId: string,
  shippingOptionId?: string
): Promise<
  | { ok: true; clientSecret: string | null }
  | { ok: false; error: string }
> {
  const cartId = await getCartIdFromCookie();
  if (!cartId) return { ok: false, error: 'Cart not found.' };

  try {
    const headers = await getMedusaAuthHeaders();
    const shippingResult = await ensureCartShippingMethod(
      cartId,
      headers,
      shippingOptionId
    );
    if (!shippingResult.ok) return shippingResult;

    let cart = await retrieveCartById(cartId);
    if (!cart) return { ok: false, error: 'Cart not found.' };

    const existing = findPaymentSession(cart, providerId);
    let clientSecret = getPaymentSessionClientSecret(existing);
    if (clientSecret) {
      return { ok: true, clientSecret };
    }

    await sdk.store.payment.initiatePaymentSession(
      cart,
      { provider_id: providerId },
      {},
      headers
    );

    cart = (await retrieveCartById(cartId))!;
    const session = findPaymentSession(cart, providerId);
    clientSecret = getPaymentSessionClientSecret(session);

    revalidateShop();
    return { ok: true, clientSecret: clientSecret ?? null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Could not start payment.';
    return { ok: false, error: message };
  }
}

export async function setShippingMethodAction(
  shippingOptionId: string
): Promise<ActionResult> {
  const cartId = await getCartIdFromCookie();
  if (!cartId) return { ok: false, error: 'Cart not found.' };

  try {
    const headers = await getMedusaAuthHeaders();
    await addShippingMethodToCart(cartId, shippingOptionId, headers);
    revalidateShop();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not set shipping method.';
    return { ok: false, error: message };
  }
}

export async function completeCheckoutAction(
  providerId: string,
  shippingOptionId?: string,
  cartIdOverride?: string
): Promise<{ ok: true; orderId: string } | { ok: false; error: string }> {
  const cartId = cartIdOverride ?? (await getCartIdFromCookie());
  if (!cartId) return { ok: false, error: 'Cart not found.' };

  try {
    const headers = await getMedusaAuthHeaders();
    let cart = await retrieveCartById(cartId);
    if (!cart) return { ok: false, error: 'Cart not found.' };

    const shippingResult = await ensureCartShippingMethod(
      cartId,
      headers,
      shippingOptionId
    );
    if (!shippingResult.ok) return shippingResult;

    if (isManualPaymentProvider(providerId)) {
      await sdk.store.payment.initiatePaymentSession(
        cart,
        { provider_id: providerId },
        {},
        headers
      );
    } else if (!isStripePaymentProvider(providerId)) {
      await sdk.store.payment.initiatePaymentSession(
        cart,
        { provider_id: providerId },
        {},
        headers
      );
    }

    const result = await sdk.store.cart.complete(cartId, { fields: '+order' }, headers);

    if (result.type === 'cart') {
      const errMsg =
        typeof result.error === 'object' && result.error && 'message' in result.error
          ? String((result.error as { message: string }).message)
          : 'Checkout could not be completed.';
      return { ok: false, error: errMsg };
    }

    const cookieStore = await cookies();
    cookieStore.delete(MEDUSA_CART_ID_COOKIE);
    revalidateShop();
    return { ok: true, orderId: result.order.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed.';
    return { ok: false, error: message };
  }
}

export async function getCheckoutData() {
  const cartResult = await retrieveShopCart();
  if (!cartResult.ok) {
    return { ok: false as const, error: cartResult.error, code: cartResult.code };
  }

  const cart = cartResult.cart;
  if (!cart) {
    return { ok: false as const, error: 'Cart not found.', code: 'api_error' as const };
  }
  const regionId = cart.region_id ?? (await getDefaultRegionId());

  let shippingOptions: HttpTypes.StoreCartShippingOption[] = [];
  let paymentProviders: Awaited<
    ReturnType<typeof sdk.store.payment.listPaymentProviders>
  >['payment_providers'] = [];

  try {
    const headers = await getMedusaAuthHeaders();
    if (cart.id) {
      shippingOptions = await listCartShippingOptions(cart.id, headers);
    }
    if (regionId) {
      const paymentRes = await sdk.store.payment.listPaymentProviders(
        { region_id: regionId },
        headers
      );
      paymentProviders = paymentRes.payment_providers ?? [];
    }
  } catch {
    // Shipping/payment lists may be empty until address is set
  }

  const [customer, countries] = await Promise.all([
    retrieveLoggedInCustomer(),
    listStoreCountries().then(mergeCountriesWithSubdivisions),
  ]);

  return {
    ok: true as const,
    cart,
    shippingOptions,
    paymentProviders,
    customer,
    countries,
  };
}
