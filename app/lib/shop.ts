import type { HttpTypes } from '@medusajs/types';
import { formatMedusaError, isMedusaConfigured, sdk } from '@/app/lib/medusa';
import { getDefaultRegionId } from '@/app/lib/medusa-region';

export {
  formatMoney,
  formatVariantPrice,
  getProductDisplayPrice,
} from '@/app/lib/shop-pricing';

export type ShopCategoryNavItem = {
  id: string;
  name: string;
  handle: string;
};

export type ShopProductsResult =
  | {
      ok: true;
      products: HttpTypes.StoreProduct[];
      count: number;
      regionId: string;
    }
  | {
      ok: false;
      error: string;
      code: 'missing_config' | 'api_error';
    };

export type ShopCategoryResult =
  | { ok: true; category: HttpTypes.StoreProductCategory }
  | { ok: false; error: string; code: 'missing_config' | 'not_found' | 'api_error' };

export async function listShopCategories(): Promise<ShopCategoryNavItem[]> {
  if (!isMedusaConfigured()) return [];

  try {
    const { product_categories } = await sdk.store.category.list({
      limit: 100,
      fields: 'id,name,handle',
    });

    return (product_categories ?? [])
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => ({ id: c.id, name: c.name, handle: c.handle }));
  } catch {
    return [];
  }
}

export async function retrieveShopCategoryByHandle(handle: string): Promise<ShopCategoryResult> {
  if (!isMedusaConfigured()) {
    return {
      ok: false,
      code: 'missing_config',
      error: 'Medusa is not configured.',
    };
  }

  try {
    const { product_categories } = await sdk.store.category.list({
      handle,
      limit: 1,
      fields: 'id,name,handle,description',
    });
    const category = product_categories[0];
    if (!category) {
      return { ok: false, code: 'not_found', error: 'Category not found.' };
    }
    return { ok: true, category };
  } catch (err) {
    return {
      ok: false,
      code: 'api_error',
      error: formatMedusaError(err, 'Failed to load category from Medusa.'),
    };
  }
}

export async function listShopProducts(
  limit = 24,
  categoryId?: string
): Promise<ShopProductsResult> {
  if (!isMedusaConfigured()) {
    return {
      ok: false,
      code: 'missing_config',
      error:
        'Medusa is not configured. Add MEDUSA_PUBLISHABLE_KEY (or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) to your environment (create one in Medusa Admin → Settings → Publishable API Keys).',
    };
  }

  try {
    const regionId = await getDefaultRegionId();
    if (!regionId) {
      return {
        ok: false,
        code: 'api_error',
        error: 'No sales regions found in Medusa. Add a region in Medusa Admin before listing products.',
      };
    }

    const { products, count } = await sdk.store.product.list({
      limit,
      region_id: regionId,
      ...(categoryId ? { category_id: categoryId } : {}),
      fields: '*variants.calculated_price',
    });

    return { ok: true, products, count, regionId };
  } catch (err) {
    return {
      ok: false,
      code: 'api_error',
      error: formatMedusaError(err, 'Failed to load products from Medusa.'),
    };
  }
}

export async function retrieveShopProduct(
  handle: string
): Promise<
  | { ok: true; product: HttpTypes.StoreProduct; regionId: string }
  | { ok: false; error: string; code: 'missing_config' | 'not_found' | 'api_error' }
> {
  if (!isMedusaConfigured()) {
    return {
      ok: false,
      code: 'missing_config',
      error:
        'Medusa is not configured. Add MEDUSA_PUBLISHABLE_KEY (or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) to your environment.',
    };
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

    const { products } = await sdk.store.product.list({
      handle,
      limit: 1,
      region_id: regionId,
      fields: '*variants.calculated_price,+variants.options,+variants.options.option',
    });

    const product = products[0];
    if (!product) {
      return { ok: false, code: 'not_found', error: 'Product not found.' };
    }

    return { ok: true, product, regionId };
  } catch (err) {
    return {
      ok: false,
      code: 'api_error',
      error: formatMedusaError(err, 'Failed to load product from Medusa.'),
    };
  }
}
