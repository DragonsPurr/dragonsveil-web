import { getProductDisplayPrice } from '@/app/lib/shop-pricing';
import { retrieveShopProduct } from '@/app/lib/shop';
import { ProductPurchase } from '@/components/shop/ProductPurchase';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const result = await retrieveShopProduct(handle);
  if (!result.ok) return { title: 'Product' };
  return {
    title: result.product.title,
    description: result.product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const result = await retrieveShopProduct(handle);

  if (!result.ok) {
    if (result.code === 'not_found') notFound();
    return (
      <div className="container mx-auto">
        <div
          className="rounded-lg border border-red-700 bg-red-900/40 px-4 py-3 font-cormorant_garamond text-lg text-red-100"
          role="alert"
        >
          {result.error}
        </div>
        <p className="mt-6">
          <Link href="/shop" className="dp-link font-cinzel text-lg">
            ← Back to shop
          </Link>
        </p>
      </div>
    );
  }

  const { product } = result;
  const price = getProductDisplayPrice(product);

  return (
    <div className="container mx-auto w-full">
      <p className="mb-6">
        <Link href="/shop" className="dp-link font-cinzel text-lg">
          ← Back to shop
        </Link>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        <div className="rounded-lg overflow-hidden bg-gray-800/60 aspect-square max-w-lg w-full">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              className="w-full h-full object-cover"
              width={800}
              height={800}
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-cormorant_garamond text-gray-400 text-xl">
              No image
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h1 className="dp-page-header mb-0">{product.title}</h1>
          {product.subtitle ? (
            <p className="font-cormorant_garamond text-2xl text-gray-300">{product.subtitle}</p>
          ) : null}
          {price ? (
            <p className="font-cinzel_decorative text-3xl text-red-600">{price}</p>
          ) : null}
          {product.description ? (
            <div className="dp-body-text whitespace-pre-wrap">{product.description}</div>
          ) : null}

          <ProductPurchase product={product} />
        </div>
      </div>
    </div>
  );
}
