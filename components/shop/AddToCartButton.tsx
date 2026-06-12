'use client';

import { addToCartAction } from '@/app/shop/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type AddToCartButtonProps = {
  variantId: string;
  disabled?: boolean;
};

export function AddToCartButton({ variantId, disabled }: AddToCartButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setPending(true);
    setError(null);
    const result = await addToCartAction(variantId, 1);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push('/shop/cart');
    router.refresh();
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || pending || !variantId}
        className="dp-form-button"
      >
        {pending ? 'Adding…' : 'Add to cart'}
      </button>
      {error ? (
        <p className="text-red-400 font-cormorant_garamond text-base" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
