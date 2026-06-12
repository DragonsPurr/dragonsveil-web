export const MEDUSA_CART_ID_COOKIE = '_medusa_cart_id';
export const MEDUSA_JWT_COOKIE = '_medusa_jwt';

export const medusaCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};
