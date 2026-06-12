import {
  formatVariantPrice,
  getProductDisplayPrice,
} from '@/app/lib/shop-pricing';
import type { HttpTypes } from '@medusajs/types';

describe('shop pricing helpers', () => {
  it('formatVariantPrice formats amount with currency', () => {
    expect(
      formatVariantPrice({
        calculated_amount: 49.99,
        currency_code: 'usd',
      } as HttpTypes.StoreCalculatedPrice)
    ).toBe('US$49.99');
  });

  it('formatVariantPrice returns null without amount', () => {
    expect(formatVariantPrice(undefined)).toBeNull();
  });

  it('getProductDisplayPrice uses first variant with a price', () => {
    const product = {
      variants: [
        { calculated_price: { calculated_amount: 12, currency_code: 'cad' } },
        { calculated_price: { calculated_amount: 20, currency_code: 'cad' } },
      ],
    } as HttpTypes.StoreProduct;

    expect(getProductDisplayPrice(product)).toBe('$12.00');
  });
});
