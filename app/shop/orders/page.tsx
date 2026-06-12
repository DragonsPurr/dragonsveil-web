import { retrieveLoggedInCustomer } from '@/app/lib/medusa-auth';
import { listCustomerOrders } from '@/app/lib/medusa-orders';
import { MedusaConfigAlert } from '@/components/shop/MedusaConfigAlert';
import { OrderHistoryView } from '@/components/shop/OrderHistoryView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order history',
  description: 'View your past shop orders.',
};

type OrdersPageProps = {
  searchParams: Promise<{ placed?: string }>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { placed: placedOrderId } = await searchParams;
  const customer = await retrieveLoggedInCustomer();
  const orders = customer ? await listCustomerOrders() : [];

  return (
    <div className="container mx-auto w-full">
      <MedusaConfigAlert />
      <h1 className="dp-page-header">Order history</h1>
      <OrderHistoryView
        orders={orders}
        placedOrderId={placedOrderId}
        isGuest={!customer}
      />
    </div>
  );
}
