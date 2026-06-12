import {
  MEDUSA_JWT_COOKIE,
  medusaCookieOptions,
} from '@/app/lib/medusa-cookies';
import { isMedusaConfigured, sdk } from '@/app/lib/medusa';
import type { HttpTypes } from '@medusajs/types';
import { cookies } from 'next/headers';

export async function getMedusaAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEDUSA_JWT_COOKIE)?.value;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function setMedusaAuthToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(MEDUSA_JWT_COOKIE, token, {
    ...medusaCookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearMedusaAuthToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(MEDUSA_JWT_COOKIE);
}

export async function retrieveLoggedInCustomer(): Promise<HttpTypes.StoreCustomer | null> {
  if (!isMedusaConfigured()) return null;
  const headers = await getMedusaAuthHeaders();
  if (!headers.Authorization) return null;

  try {
    const { customer } = await sdk.store.customer.retrieve(
      { fields: '*addresses' },
      headers
    );
    return customer;
  } catch {
    return null;
  }
}
