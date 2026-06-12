import type { StoreCountryOption } from '@/app/lib/medusa-region';
import { ManageAccountForm } from '@/components/shop/ManageAccountForm';
import type { HttpTypes } from '@medusajs/types';
import Link from 'next/link';

type AccountViewProps = {
  customer: HttpTypes.StoreCustomer;
  countries: StoreCountryOption[];
  avatarUploadEnabled?: boolean;
};

export function AccountView({
  customer,
  countries,
  avatarUploadEnabled = false,
}: AccountViewProps) {
  return (
    <div className="space-y-8">
      <ManageAccountForm
        customer={customer}
        countries={countries}
        avatarUploadEnabled={avatarUploadEnabled}
      />
      <p>
        <Link href="/shop" className="dp-link font-cinzel text-lg">
          Continue shopping
        </Link>
      </p>
    </div>
  );
}
