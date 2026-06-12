'use client';

import { formatVariantPrice } from '@/app/lib/shop-pricing';
import type { HttpTypes } from '@medusajs/types';
import { AddToCartButton } from '@/components/shop/AddToCartButton';
import { useState } from 'react';

type ProductPurchaseProps = {
  product: HttpTypes.StoreProduct;
};

export function ProductPurchase({ product }: ProductPurchaseProps) {
  const variants = product.variants ?? [];
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? '');

  if (variants.length === 0) {
    return <p className="dp-body-text text-gray-400">This product has no purchasable variants.</p>;
  }

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? variants[0];

  return (
    <div className="pt-4 border-t border-red-900/60 space-y-4">
      {variants.length > 1 ? (
        <div>
          <label htmlFor="variant" className="dp-form-label">
            Variant
          </label>
          <select
            id="variant"
            value={selectedVariantId}
            onChange={(e) => setSelectedVariantId(e.target.value)}
            className="dp-form-input max-w-md"
          >
            {variants.map((variant) => {
              const price = formatVariantPrice(variant.calculated_price);
              const label =
                variant.title !== 'Default variant'
                  ? `${variant.title}${price ? ` — ${price}` : ''}`
                  : `${product.title}${price ? ` — ${price}` : ''}`;
              return (
                <option key={variant.id} value={variant.id}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      ) : (
        selectedVariant && formatVariantPrice(selectedVariant.calculated_price) ? (
          <p className="font-cinzel_decorative text-2xl text-red-600">
            {formatVariantPrice(selectedVariant.calculated_price)}
          </p>
        ) : null
      )}
      <AddToCartButton variantId={selectedVariantId} />
    </div>
  );
}
