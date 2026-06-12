import { listShopProducts } from '@/app/lib/shop';
import { ProductCard } from '@/components/shop/ProductCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop',
  description: "Browse Dragon's Purr Crafts and Sundry products.",
};

export default async function ShopPage() {
  const result = await listShopProducts();

  return (
    <div className="container mx-auto w-full">
      <header className="mb-8 md:mb-12">
        <h1 className="dp-page-header">Shop</h1>
        <p className="dp-body-text max-w-3xl">
          Browse our latest products. Prices are shown for your region when available.
        </p>
      </header>

      {!result.ok ? (
        <div
          className="rounded-lg border border-red-700 bg-red-900/40 px-4 py-3 font-cormorant_garamond text-lg text-red-100"
          role="alert"
        >
          {result.error}
        </div>
      ) : result.products.length === 0 ? (
        <p className="dp-body-text">No products are available yet. Add products in Medusa Admin.</p>
      ) : (
        <>
          <p className="font-cormorant_garamond text-lg text-gray-300 mb-6">
            {result.count} {result.count === 1 ? 'product' : 'products'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 min-w-0">
            {result.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
