import {
  formatOrderDate,
  formatOrderStatus,
  getOrderLabel,
} from '@/app/lib/medusa-orders';
import { formatMoney } from '@/app/lib/shop-pricing';
import type { HttpTypes } from '@medusajs/types';
import Link from 'next/link';

type OrderHistoryViewProps = {
  orders: HttpTypes.StoreOrder[];
  placedOrderId?: string | null;
  isGuest?: boolean;
};

export function OrderHistoryView({
  orders,
  placedOrderId,
  isGuest = false,
}: OrderHistoryViewProps) {
  const placedOrder = placedOrderId
    ? orders.find((order) => order.id === placedOrderId)
    : undefined;

  return (
    <div className="space-y-8 max-w-3xl">
      {placedOrderId ? (
        <div
          className="rounded-lg border border-green-800 bg-green-950/40 px-4 py-3 font-cormorant_garamond text-lg text-green-100"
          role="status"
        >
          Thank you! Your order has been placed
          {placedOrder ? ` (${getOrderLabel(placedOrder)})` : ''} and will be shipped
          shortly.
        </div>
      ) : null}

      {isGuest ? (
        <div className="space-y-3">
          <p className="dp-body-text text-gray-300">
            Sign in to view your order history and track past purchases.
          </p>
          <p>
            <Link href="/shop/login" className="dp-link font-cinzel text-lg">
              Sign in
            </Link>
          </p>
        </div>
      ) : orders.length === 0 ? (
        <p className="dp-body-text text-gray-400">You have not placed any orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const totalLabel = formatMoney(order.total, order.currency_code);
            const dateLabel = formatOrderDate(order.created_at);
            const itemCount = (order.items ?? []).reduce(
              (sum, item) => sum + (item.quantity ?? 0),
              0
            );
            const isPlacedHighlight = order.id === placedOrderId;

            return (
              <li
                key={order.id}
                className={`rounded-lg border p-4 space-y-2 ${
                  isPlacedHighlight
                    ? 'border-green-800 bg-green-950/20'
                    : 'border-(--dp-gray-600)'
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-cinzel text-lg text-white">
                    Order {getOrderLabel(order)}
                  </p>
                  {totalLabel ? (
                    <p className="font-cormorant_garamond text-xl text-(--dp-light-red)">
                      {totalLabel}
                    </p>
                  ) : null}
                </div>
                <p className="font-cormorant_garamond text-base text-gray-400">
                  {dateLabel ? `${dateLabel} · ` : ''}
                  {formatOrderStatus(order.status)}
                  {itemCount > 0 ? ` · ${itemCount} item${itemCount === 1 ? '' : 's'}` : ''}
                </p>
                {(order.items ?? []).length > 0 ? (
                  <ul className="font-cormorant_garamond text-base text-gray-300 list-disc pl-5 space-y-1">
                    {order.items!.map((item) => (
                      <li key={item.id}>
                        {item.title ?? 'Item'}
                        {(item.quantity ?? 0) > 1 ? ` × ${item.quantity}` : ''}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <p>
        <Link href="/shop" className="dp-link font-cinzel text-lg">
          Continue shopping
        </Link>
      </p>
    </div>
  );
}
