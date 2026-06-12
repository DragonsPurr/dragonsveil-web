import { render, screen } from '@testing-library/react';
import ShopPage from '@/app/shop/page';

jest.mock('@/app/lib/shop', () => {
  const actual = jest.requireActual('@/app/lib/shop-pricing');
  return {
    ...actual,
    listShopProducts: jest.fn(),
    retrieveShopProduct: jest.fn(),
  };
});

const { listShopProducts } = jest.requireMock<{ listShopProducts: jest.Mock }>('@/app/lib/shop');

describe('Shop page', () => {
  beforeEach(() => {
    listShopProducts.mockReset();
  });

  it('shows configuration message when Medusa is not configured', async () => {
    listShopProducts.mockResolvedValue({
      ok: false,
      code: 'missing_config',
      error: 'Medusa is not configured.',
    });

    render(await ShopPage());
    expect(screen.getByRole('alert')).toHaveTextContent('Medusa is not configured.');
  });

  it('renders product grid when products are returned', async () => {
    listShopProducts.mockResolvedValue({
      ok: true,
      products: [
        {
          id: 'prod_1',
          title: 'Dragon Mug',
          handle: 'dragon-mug',
          thumbnail: null,
          description: 'A fine mug',
          variants: [
            {
              id: 'variant_1',
              calculated_price: {
                calculated_amount: 19.99,
                currency_code: 'usd',
              },
            },
          ],
        },
      ],
      count: 1,
      regionId: 'reg_1',
    });

    render(await ShopPage());
    expect(screen.getByRole('heading', { name: /shop/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dragon mug/i })).toHaveAttribute('href', '/shop/dragon-mug');
    expect(screen.getByText('US$19.99')).toBeInTheDocument();
  });
});
