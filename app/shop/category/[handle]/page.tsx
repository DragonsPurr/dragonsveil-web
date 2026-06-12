import {
  listShopProducts,
  retrieveShopCategoryByHandle,
} from '@/app/lib/shop';
import { ProductCard } from '@/components/shop/ProductCard';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type CategoryPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { handle } = await params;
  const result = await retrieveShopCategoryByHandle(handle);
  if (!result.ok) return { title: 'Category' };
  return {
    title: result.category.name,
    description: result.category.description ?? undefined,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { handle } = await params;
  const categoryResult = await retrieveShopCategoryByHandle(handle);

  if (!categoryResult.ok) {
    if (categoryResult.code === 'not_found') notFound();
    return (
      <div className="container mx-auto w-full">
        <div
          className="rounded-lg border border-red-700 bg-red-900/40 px-4 py-3 font-cormorant_garamond text-lg text-red-100"
          role="alert"
        >
          {categoryResult.error}
        </div>
      </div>
    );
  }

  const { category } = categoryResult;
  const productsResult = await listShopProducts(24, category.id);

  return (
    <div className="container mx-auto w-full">
      <p className="mb-4">
        <Link href="/shop" className="dp-link font-cinzel text-lg">
          ← All products
        </Link>
      </p>
      <header className="mb-8 md:mb-12">
        <h1 className="dp-page-header">{category.name}</h1>
        {category.description ? (
          <p className="dp-body-text max-w-3xl">{category.description}</p>
        ) : null}
      </header>

      {!productsResult.ok ? (
        <div
          className="rounded-lg border border-red-700 bg-red-900/40 px-4 py-3 font-cormorant_garamond text-lg text-red-100"
          role="alert"
        >
          {productsResult.error}
        </div>
      ) : productsResult.products.length === 0 ? (
        <p className="dp-body-text">No products in this category yet.</p>
      ) : (
        <>
          <p className="font-cormorant_garamond text-lg text-gray-300 mb-6">
            {productsResult.count} {productsResult.count === 1 ? 'product' : 'products'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 min-w-0">
            {productsResult.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
