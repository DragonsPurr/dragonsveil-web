import { getMedusaAuthHeaders } from '@/app/lib/medusa-auth';
import { isMedusaConfigured, sdk } from '@/app/lib/medusa';
import type { HttpTypes } from '@medusajs/types';

const ORDER_LIST_FIELDS =
  'id,display_id,status,created_at,total,currency_code,*items,items.title,items.quantity';

export async function listCustomerOrders(): Promise<HttpTypes.StoreOrder[]> {
  if (!isMedusaConfigured()) return [];

  const headers = await getMedusaAuthHeaders();
  if (!headers.Authorization) return [];

  try {
    const { orders } = await sdk.store.order.list(
      { fields: ORDER_LIST_FIELDS },
      headers
    );
    return (orders ?? []).sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
  } catch {
    return [];
  }
}

export function formatOrderDate(createdAt: string | Date | undefined): string | null {
  if (!createdAt) return null;
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatOrderStatus(status: string | undefined): string {
  if (!status) return 'Unknown';
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getOrderLabel(order: HttpTypes.StoreOrder): string {
  if (order.display_id != null) return `#${order.display_id}`;
  return order.id;
}
