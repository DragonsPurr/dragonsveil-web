import {
  MEDUSA_CART_ID_COOKIE,
  medusaCookieOptions,
} from '@/app/lib/medusa-cookies';
import { getDefaultRegionId } from '@/app/lib/medusa-region';
import { getMedusaAuthHeaders } from '@/app/lib/medusa-auth';
import { isMedusaConfigured, sdk } from '@/app/lib/medusa';
import type { HttpTypes } from '@medusajs/types';
import { cookies } from 'next/headers';

export const CART_FIELDS =
  '*items,*items.product,*items.variant,*items.thumbnail,+shipping_address,+billing_address,+region,+payment_collection,+payment_collection.payment_sessions,+shipping_methods';

type CartErrorResult = {
  ok: false;
  error: string;
  code: 'missing_config' | 'api_error';
};

/** Sets the cart cookie. Only call from Server Actions or Route Handlers. */
export async function setCartIdCookie(cartId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(MEDUSA_CART_ID_COOKIE, cartId, {
    ...medusaCookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getCartIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(MEDUSA_CART_ID_COOKIE)?.value ?? null;
}

export async function retrieveCartById(
  cartId: string
): Promise<HttpTypes.StoreCart | null> {
  if (!isMedusaConfigured()) return null;
  const headers = await getMedusaAuthHeaders();

  try {
    const { cart } = await sdk.store.cart.retrieve(
      cartId,
      { fields: CART_FIELDS },
      headers
    );
    return cart;
  } catch {
    return null;
  }
}

/** Read-only cart fetch for Server Components (does not create or modify cookies). */
export async function retrieveShopCart(): Promise<
  | { ok: true; cart: HttpTypes.StoreCart | null }
  | CartErrorResult
> {
  if (!isMedusaConfigured()) {
    return {
      ok: false,
      code: 'missing_config',
      error: 'Medusa is not configured.',
    };
  }

  const existingId = await getCartIdFromCookie();
  if (!existingId) {
    return { ok: true, cart: null };
  }

  const cart = await retrieveCartById(existingId);
  return { ok: true, cart };
}

/**
 * Creates a cart and sets the cookie when needed.
 * Only call from Server Actions or Route Handlers.
 */
export async function ensureCart(): Promise<
  | { ok: true; cart: HttpTypes.StoreCart }
  | CartErrorResult
> {
  if (!isMedusaConfigured()) {
    return {
      ok: false,
      code: 'missing_config',
      error: 'Medusa is not configured.',
    };
  }

  const headers = await getMedusaAuthHeaders();
  const existingId = await getCartIdFromCookie();

  if (existingId) {
    const cart = await retrieveCartById(existingId);
    if (cart) return { ok: true, cart };
  }

  try {
    const regionId = await getDefaultRegionId();
    if (!regionId) {
      return {
        ok: false,
        code: 'api_error',
        error: 'No sales regions found in Medusa.',
      };
    }

    const { cart } = await sdk.store.cart.create(
      { region_id: regionId },
      { fields: CART_FIELDS },
      headers
    );
    await setCartIdCookie(cart.id);
    return { ok: true, cart };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create cart.';
    return { ok: false, code: 'api_error', error: message };
  }
}

export function getCartItemCount(cart: HttpTypes.StoreCart): number {
  return (cart.items ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0);
}

export type ShopCartNavItem = {
  id: string;
  title: string;
  variantTitle: string | null;
  quantity: number;
  thumbnail: string | null;
  lineTotal: number | null;
};

export type ShopCartNavPreview = {
  itemCount: number;
  items: ShopCartNavItem[];
  total: number | null;
  currencyCode: string | null;
};

const emptyCartPreview = (): ShopCartNavPreview => ({
  itemCount: 0,
  items: [],
  total: null,
  currencyCode: null,
});

function toShopCartNavPreview(cart: HttpTypes.StoreCart): ShopCartNavPreview {
  const items = (cart.items ?? []).map((item) => ({
    id: item.id,
    title: item.product_title ?? item.title ?? 'Item',
    variantTitle:
      item.variant_title && item.variant_title !== 'Default variant'
        ? item.variant_title
        : null,
    quantity: item.quantity ?? 0,
    thumbnail: item.thumbnail ?? item.variant?.product?.thumbnail ?? item.product?.thumbnail ?? null,
    lineTotal: item.total ?? (item.unit_price != null ? item.unit_price * (item.quantity ?? 0) : null),
  }));

  return {
    itemCount: getCartItemCount(cart),
    items,
    total: cart.total ?? null,
    currencyCode: cart.currency_code ?? null,
  };
}

/** Cart summary for shop sub-nav (count, line items, total). Safe for Server Components. */
export async function getShopCartNavPreview(): Promise<ShopCartNavPreview> {
  if (!isMedusaConfigured()) return emptyCartPreview();

  const existingId = await getCartIdFromCookie();
  if (!existingId) return emptyCartPreview();

  const cart = await retrieveCartById(existingId);
  if (!cart) return emptyCartPreview();

  return toShopCartNavPreview(cart);
}

/** Total quantity of items in the current cart (0 if none). Safe for Server Components. */
export async function getShopCartItemCount(): Promise<number> {
  const preview = await getShopCartNavPreview();
  return preview.itemCount;
}
