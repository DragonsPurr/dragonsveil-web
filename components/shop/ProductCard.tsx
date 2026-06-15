import { getProductDisplayPrice } from '@/app/lib/shop-pricing';
import type { HttpTypes } from '@medusajs/types';
import Image from 'next/image';
import Link from 'next/link';

type ProductCardProps = {
  product: HttpTypes.StoreProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const price = getProductDisplayPrice(product);
  const href = `/shop/${product.handle}`;

  return (
    <article className="min-w-0 flex flex-col">
      <Link
        href={href}
        className="block w-full min-w-0 aspect-square overflow-hidden rounded-lg bg-gray-800/60 focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-black"
      >
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            width={500}
            height={500}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-cormorant_garamond text-gray-400 text-lg px-4 text-center"
            aria-hidden
          >
            No image
          </div>
        )}
      </Link>
      <div className="mt-3 space-y-1">
        <h2 className="font-cinzel text-lg md:text-xl leading-snug">
          <Link href={href} className="text-white hover:text-red-600 transition-colors">
            {product.title}
          </Link>
        </h2>
        {price ? (
          <p className="font-cormorant_garamond text-xl text-gray-300">{price}</p>
        ) : null}
        {product.description ? (
          <p className="font-cormorant_garamond text-base text-gray-400 line-clamp-2">
            {product.description}
          </p>
        ) : null}
      </div>
    </article>
  );
}
