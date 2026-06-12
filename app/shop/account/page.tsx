import { retrieveLoggedInCustomer } from '@/app/lib/medusa-auth';
import { listStoreCountries, mergeCountriesWithSubdivisions } from '@/app/lib/medusa-region';
import { isOvhUserAssetsConfigured } from '@/app/lib/ovh-user-assets';
import { AccountView } from '@/components/shop/AccountView';
import { MedusaConfigAlert } from '@/components/shop/MedusaConfigAlert';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Account',
  description: 'Your shop account.',
};

export default async function AccountPage() {
  const [customer, countries] = await Promise.all([
    retrieveLoggedInCustomer(),
    listStoreCountries().then(mergeCountriesWithSubdivisions),
  ]);

  if (!customer) {
    redirect('/shop/login');
  }

  return (
    <div className="container mx-auto w-full">
      <MedusaConfigAlert />
      <h1 className="dp-page-header">Manage account</h1>
      <AccountView
        customer={customer}
        countries={countries}
        avatarUploadEnabled={isOvhUserAssetsConfigured()}
      />
      <p className="mt-8 font-cormorant_garamond text-gray-400 text-base">
        Not you?{' '}
        <Link href="/shop/login" className="dp-link">
          Sign in with a different account
        </Link>
      </p>
    </div>
  );
}
