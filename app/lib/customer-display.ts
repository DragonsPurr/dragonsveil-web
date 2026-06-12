import type { HttpTypes } from '@medusajs/types';

/** Pure helper safe for client and server components. */
export function getCustomerDisplayName(
  customer: Pick<HttpTypes.StoreCustomer, 'first_name' | 'last_name' | 'email'>
): string {
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ');
  return name || customer.email;
}

export function formatSavedAddressLabel(
  address: Pick<
    HttpTypes.StoreCustomerAddress,
    'address_name' | 'first_name' | 'last_name' | 'address_1' | 'city' | 'postal_code'
  >
): string {
  const line = [address.address_1, address.city, address.postal_code].filter(Boolean).join(', ');
  const label = address.address_name?.trim();
  if (label) return `${label} — ${line}`;
  const name = [address.first_name, address.last_name].filter(Boolean).join(' ');
  return name ? `${name} — ${line}` : line || 'Saved address';
}
