import type { HttpTypes } from '@medusajs/types';

/** Fixed locale so server and client render identical currency strings (avoids hydration mismatch). */
const SHOP_PRICE_LOCALE = 'en-CA';

function formatCurrencyAmount(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat(SHOP_PRICE_LOCALE, {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount);
}

export function formatVariantPrice(
  calculatedPrice: HttpTypes.StoreCalculatedPrice | null | undefined
): string | null {
  const amount = calculatedPrice?.calculated_amount;
  const currency = calculatedPrice?.currency_code;
  if (amount == null || !currency) return null;

  return formatCurrencyAmount(amount, currency);
}

export function formatMoney(amount: number | null | undefined, currencyCode: string | null | undefined): string | null {
  if (amount == null || !currencyCode) return null;
  return formatCurrencyAmount(amount, currencyCode);
}

export function getProductDisplayPrice(product: HttpTypes.StoreProduct): string | null {
  const variants = product.variants ?? [];
  const prices = variants
    .map((v) => formatVariantPrice(v.calculated_price))
    .filter((p): p is string => p != null);

  if (prices.length === 0) return null;
  return prices[0];
}
