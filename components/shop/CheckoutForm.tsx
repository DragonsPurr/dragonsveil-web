'use client';

import { formatSavedAddressLabel } from '@/app/lib/customer-display';
import type { StoreCountryOption } from '@/app/lib/medusa-region';
import { formatMoney } from '@/app/lib/shop-pricing';
import { CountryProvinceFields } from '@/components/shop/CountryProvinceFields';
import {
  applySavedAddressToCartAction,
  setShippingMethodAction,
  updateCartAddressAction,
} from '@/app/shop/actions';
import { CheckoutPlaceOrder } from '@/components/shop/CheckoutPlaceOrder';
import type { HttpTypes } from '@medusajs/types';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useMemo, useState } from 'react';

function cartShippingMatchesSavedAddress(
  shipping: HttpTypes.StoreCartAddress | undefined,
  address: HttpTypes.StoreCustomerAddress
): boolean {
  if (!shipping?.address_1 || !address.address_1) return false;
  return (
    shipping.address_1 === address.address_1 &&
    (shipping.city ?? '') === (address.city ?? '') &&
    (shipping.postal_code ?? '') === (address.postal_code ?? '')
  );
}

function getAppliedShippingOptionId(cart: HttpTypes.StoreCart): string | undefined {
  const method = cart.shipping_methods?.[0] as
    | { shipping_option_id?: string; option_id?: string }
    | undefined;
  return method?.shipping_option_id ?? method?.option_id;
}

type CheckoutFormProps = {
  cart: HttpTypes.StoreCart;
  shippingOptions: HttpTypes.StoreCartShippingOption[];
  paymentProviders: HttpTypes.StorePaymentProvider[];
  customer: HttpTypes.StoreCustomer | null;
  countries: StoreCountryOption[];
};

export function CheckoutForm({
  cart,
  shippingOptions,
  paymentProviders,
  customer,
  countries,
}: CheckoutFormProps) {
  const router = useRouter();
  const [addressState, addressAction, addressPending] = useActionState(updateCartAddressAction, null);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const paymentReturnError = searchParams.get('error');
  const paymentReturnMessage = searchParams.get('message');
  const [savedAddressError, setSavedAddressError] = useState<string | null>(null);
  const [applyingSavedAddress, setApplyingSavedAddress] = useState(false);
  const [applyingShipping, setApplyingShipping] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(() => getAppliedShippingOptionId(cart) ?? '');
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState('');

  const paymentProviderId = paymentProviders[0]?.id ?? '';

  const savedAddresses = useMemo(() => customer?.addresses ?? [], [customer?.addresses]);
  const shipping = cart.shipping_address;
  const appliedShippingOptionId = getAppliedShippingOptionId(cart);
  const shippingMethodApplied = Boolean(appliedShippingOptionId);

  useEffect(() => {
    if (appliedShippingOptionId) {
      setSelectedShipping(appliedShippingOptionId);
    }
  }, [appliedShippingOptionId]);

  useEffect(() => {
    if (!shipping || savedAddresses.length === 0) return;
    const match = savedAddresses.find((addr) => cartShippingMatchesSavedAddress(shipping, addr));
    if (match) setSelectedSavedAddressId(match.id);
  }, [shipping, savedAddresses]);
  const totalLabel = formatMoney(cart.total, cart.currency_code);

  const addressFormKey = useMemo(
    () =>
      [
        cart.id,
        shipping?.first_name ?? '',
        shipping?.last_name ?? '',
        shipping?.address_1 ?? '',
        shipping?.city ?? '',
        shipping?.postal_code ?? '',
        shipping?.country_code ?? '',
        shipping?.province ?? '',
      ].join('|'),
    [cart.id, shipping]
  );

  const handleApplySavedAddress = async (addressId: string) => {
    if (!addressId) return;
    setSavedAddressError(null);
    setApplyingSavedAddress(true);
    setSelectedSavedAddressId(addressId);
    const result = await applySavedAddressToCartAction(addressId);
    setApplyingSavedAddress(false);
    if (!result.ok) {
      setSelectedSavedAddressId('');
      setSavedAddressError(result.error);
      return;
    }
    router.refresh();
  };

  const handleShippingOptionChange = async (optionId: string) => {
    setSelectedShipping(optionId);
    if (optionId === appliedShippingOptionId) {
      setShippingError(null);
      return;
    }
    setShippingError(null);
    setApplyingShipping(true);
    const result = await setShippingMethodAction(optionId);
    setApplyingShipping(false);
    if (!result.ok) {
      setShippingError(result.error);
      return;
    }
    router.refresh();
  };

  const shippingRequired = shippingOptions.length > 0;

  return (
    <div className="space-y-10 max-w-2xl">
      {paymentReturnError ? (
        <p className="text-red-400 font-cormorant_garamond text-lg" role="alert">
          {paymentReturnMessage
            ? decodeURIComponent(paymentReturnMessage)
            : 'Payment could not be completed. Please try again.'}
        </p>
      ) : null}
      <section>
        <h2 className="dp-section-header text-xl mb-4">Contact &amp; shipping</h2>

        {savedAddresses.length > 0 ? (
          <div className="mb-4">
            <label htmlFor="saved_address" className="dp-form-label">
              Saved address
            </label>
            <select
              id="saved_address"
              name="saved_address"
              value={selectedSavedAddressId}
              disabled={applyingSavedAddress}
              onChange={(e) => void handleApplySavedAddress(e.target.value)}
              className="dp-form-select"
            >
              <option value="" disabled>
                Choose a saved address
              </option>
              {savedAddresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {formatSavedAddressLabel(address)}
                  {address.is_default_shipping ? ' (default shipping)' : ''}
                </option>
              ))}
            </select>
            {applyingSavedAddress ? (
              <p className="mt-1 font-cormorant_garamond text-sm text-gray-400">Applying address…</p>
            ) : null}
            {savedAddressError ? (
              <p className="mt-1 text-red-400 font-cormorant_garamond text-lg" role="alert">
                {savedAddressError}
              </p>
            ) : null}
          </div>
        ) : customer ? (
          <p className="dp-body-text text-gray-400 mb-4">
            No saved addresses yet.{' '}
            <Link href="/shop/account" className="dp-link">
              Add one in your account
            </Link>
            .
          </p>
        ) : (
          <p className="dp-body-text text-gray-400 mb-4">
            <Link href="/shop/login" className="dp-link">
              Sign in
            </Link>{' '}
            to use saved addresses.
          </p>
        )}

        <form key={addressFormKey} action={addressAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="dp-form-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={cart.email ?? customer?.email ?? ''}
              className="dp-form-input"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="dp-form-label">First name</label>
              <input
                id="first_name"
                name="first_name"
                required
                defaultValue={shipping?.first_name ?? ''}
                className="dp-form-input"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="dp-form-label">Last name</label>
              <input
                id="last_name"
                name="last_name"
                defaultValue={shipping?.last_name ?? ''}
                className="dp-form-input"
              />
            </div>
          </div>
          <div>
            <label htmlFor="address_1" className="dp-form-label">Address</label>
            <input
              id="address_1"
              name="address_1"
              required
              defaultValue={shipping?.address_1 ?? ''}
              className="dp-form-input"
            />
          </div>
          <div>
            <label htmlFor="address_2" className="dp-form-label">Address line 2</label>
            <input
              id="address_2"
              name="address_2"
              defaultValue={shipping?.address_2 ?? ''}
              className="dp-form-input"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="dp-form-label">City</label>
              <input id="city" name="city" required defaultValue={shipping?.city ?? ''} className="dp-form-input" />
            </div>
            <div>
              <label htmlFor="postal_code" className="dp-form-label">Postal code</label>
              <input
                id="postal_code"
                name="postal_code"
                defaultValue={shipping?.postal_code ?? ''}
                className="dp-form-input"
              />
            </div>
          </div>
          <CountryProvinceFields
            countries={countries}
            prefix="checkout"
            defaultCountry={shipping?.country_code ?? cart.region?.countries?.[0]?.iso_2}
            defaultProvince={shipping?.province}
          />
          <div>
            <label htmlFor="phone" className="dp-form-label">Phone</label>
            <input id="phone" name="phone" type="tel" defaultValue={shipping?.phone ?? ''} className="dp-form-input" />
          </div>
          {addressState && !addressState.ok ? (
            <p className="text-red-400 font-cormorant_garamond" role="alert">{addressState.error}</p>
          ) : null}
          {addressState?.ok ? (
            <p className="text-green-400 font-cormorant_garamond">Address saved.</p>
          ) : null}
          <button type="submit" disabled={addressPending} className="dp-form-button">
            {addressPending ? 'Saving…' : 'Save address'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="dp-section-header text-xl mb-4">Shipping method</h2>
        {shippingOptions.length === 0 ? (
          <p className="dp-body-text text-gray-400">Save your address to load shipping options.</p>
        ) : (
          <div className="space-y-3">
            {shippingOptions.map((option) => (
              <label key={option.id} className="flex items-center gap-3 font-cormorant_garamond text-lg cursor-pointer">
                <input
                  type="radio"
                  name="shipping_option"
                  value={option.id}
                  checked={selectedShipping === option.id}
                  disabled={applyingShipping}
                  onChange={() => void handleShippingOptionChange(option.id)}
                />
                {option.name}
              </label>
            ))}
            {applyingShipping ? (
              <p className="font-cormorant_garamond text-sm text-gray-400">Updating shipping…</p>
            ) : null}
            {shippingMethodApplied ? (
              <p className="text-green-400 font-cormorant_garamond">Shipping method applied.</p>
            ) : null}
            {shippingError ? <p className="text-red-400" role="alert">{shippingError}</p> : null}
          </div>
        )}
      </section>

      <CheckoutPlaceOrder
        cart={cart}
        paymentProviderId={paymentProviderId}
        shippingOptionId={selectedShipping || undefined}
        shippingRequired={shippingRequired}
        shippingMethodApplied={shippingMethodApplied}
        totalLabel={totalLabel}
      />
    </div>
  );
}
