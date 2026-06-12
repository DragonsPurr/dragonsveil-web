'use client';

import type { ActionResult } from '@/app/shop/actions';
import {
  deleteCustomerAddressAction,
  saveCustomerAddressAction,
  updateCustomerProfileAction,
} from '@/app/shop/actions';
import { getCustomerAvatarProxyUrl } from '@/app/lib/customer-avatar';
import { getCustomerDisplayName } from '@/app/lib/customer-display';
import { isGooglePlacesConfigured } from '@/app/lib/google-places';
import type { ParsedPlaceAddress } from '@/app/lib/google-places';
import type { StoreCountryOption } from '@/app/lib/medusa-region';
import { AddressPlaceAutocomplete } from '@/components/shop/AddressPlaceAutocomplete';
import { CountryProvinceFields } from '@/components/shop/CountryProvinceFields';
import { ProfileAvatarUpload } from '@/components/shop/ProfileAvatarUpload';
import type { HttpTypes } from '@medusajs/types';
import { useActionState, useEffect, useState } from 'react';

type ManageAccountFormProps = {
  customer: HttpTypes.StoreCustomer;
  countries: StoreCountryOption[];
  avatarUploadEnabled?: boolean;
};

function ActionMessage({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  if (!state.ok) {
    return (
      <p className="text-red-400 font-cormorant_garamond text-lg" role="alert">
        {state.error}
      </p>
    );
  }
  return (
    <p className="text-green-400 font-cormorant_garamond text-lg" role="status">
      Saved.
    </p>
  );
}

function AddressFields({
  address,
  profileFirstName,
  profileLastName,
  prefix,
  countries,
}: {
  address?: HttpTypes.StoreCustomerAddress;
  profileFirstName: string;
  profileLastName: string;
  prefix: string;
  countries: StoreCountryOption[];
}) {
  const id = (name: string) => `${prefix}_${name}`;
  const isNewAddress = !address;
  const placesAutocomplete = isNewAddress && isGooglePlacesConfigured();
  const defaultCountry =
    countries.find((c) => c.iso2 === (address?.country_code ?? '').toLowerCase())?.iso2 ??
    countries[0]?.iso2 ??
    '';

  const [firstName, setFirstName] = useState(address?.first_name ?? profileFirstName);
  const [lastName, setLastName] = useState(address?.last_name ?? profileLastName);
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [countryCode, setCountryCode] = useState(defaultCountry);
  const [province, setProvince] = useState('');

  useEffect(() => {
    if (!isNewAddress) return;
    setFirstName(profileFirstName);
    setLastName(profileLastName);
  }, [isNewAddress, profileFirstName, profileLastName]);

  const applyPlaceSelection = (parsed: ParsedPlaceAddress) => {
    if (parsed.address1) setAddress1(parsed.address1);
    if (parsed.address2) setAddress2(parsed.address2);
    if (parsed.city) setCity(parsed.city);
    if (parsed.postalCode) setPostalCode(parsed.postalCode);
    if (parsed.countryCode && countries.some((c) => c.iso2 === parsed.countryCode)) {
      setCountryCode(parsed.countryCode);
      if (parsed.province) setProvince(parsed.province);
    } else if (parsed.province) {
      setProvince(parsed.province);
    }
  };
  return (
    <>
      <div>
        <label htmlFor={id('address_name')} className="dp-form-label">
          Label (optional)
        </label>
        <input
          id={id('address_name')}
          name="address_name"
          type="text"
          defaultValue={address?.address_name ?? ''}
          placeholder="Home"
          className="dp-form-input"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={id('first_name')} className="dp-form-label">
            First name
          </label>
          <input
            id={id('first_name')}
            name="first_name"
            required
            value={isNewAddress ? firstName : undefined}
            defaultValue={isNewAddress ? undefined : address?.first_name ?? ''}
            onChange={isNewAddress ? (e) => setFirstName(e.target.value) : undefined}
            className="dp-form-input"
          />
        </div>
        <div>
          <label htmlFor={id('last_name')} className="dp-form-label">
            Last name
          </label>
          <input
            id={id('last_name')}
            name="last_name"
            value={isNewAddress ? lastName : undefined}
            defaultValue={isNewAddress ? undefined : address?.last_name ?? ''}
            onChange={isNewAddress ? (e) => setLastName(e.target.value) : undefined}
            className="dp-form-input"
          />
        </div>
      </div>
      <div>
        <label htmlFor={id('address_1')} className="dp-form-label">
          Address
        </label>
        {placesAutocomplete ? (
          <AddressPlaceAutocomplete
            id={id('address_1')}
            name="address_1"
            required
            value={address1}
            onChange={setAddress1}
            onPlaceSelected={applyPlaceSelection}
            className="dp-form-input"
          />
        ) : (
          <input
            id={id('address_1')}
            name="address_1"
            required
            defaultValue={address?.address_1 ?? ''}
            className="dp-form-input"
          />
        )}
      </div>
      <div>
        <label htmlFor={id('address_2')} className="dp-form-label">
          Address line 2
        </label>
        <input
          id={id('address_2')}
          name="address_2"
          defaultValue={placesAutocomplete ? undefined : address?.address_2 ?? ''}
          value={placesAutocomplete ? address2 : undefined}
          onChange={placesAutocomplete ? (e) => setAddress2(e.target.value) : undefined}
          className="dp-form-input"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={id('city')} className="dp-form-label">
            City
          </label>
          <input
            id={id('city')}
            name="city"
            required
            defaultValue={placesAutocomplete ? undefined : address?.city ?? ''}
            value={placesAutocomplete ? city : undefined}
            onChange={placesAutocomplete ? (e) => setCity(e.target.value) : undefined}
            className="dp-form-input"
          />
        </div>
        <div>
          <label htmlFor={id('postal_code')} className="dp-form-label">
            Postal code
          </label>
          <input
            id={id('postal_code')}
            name="postal_code"
            defaultValue={placesAutocomplete ? undefined : address?.postal_code ?? ''}
            value={placesAutocomplete ? postalCode : undefined}
            onChange={placesAutocomplete ? (e) => setPostalCode(e.target.value) : undefined}
            className="dp-form-input"
          />
        </div>
      </div>
      <CountryProvinceFields
        countries={countries}
        prefix={prefix}
        defaultCountry={address?.country_code}
        defaultProvince={address?.province}
        countryCode={placesAutocomplete ? countryCode : undefined}
        onCountryCodeChange={placesAutocomplete ? setCountryCode : undefined}
        province={placesAutocomplete ? province : undefined}
        onProvinceChange={placesAutocomplete ? setProvince : undefined}
      />
      <div>
        <label htmlFor={id('phone')} className="dp-form-label">
          Phone
        </label>
        <input
          id={id('phone')}
          name="phone"
          type="tel"
          defaultValue={address?.phone ?? ''}
          className="dp-form-input"
        />
      </div>
      <div className="flex flex-wrap gap-6 font-cormorant_garamond text-lg">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="is_default_shipping"
            defaultChecked={address?.is_default_shipping ?? false}
            className="rounded border-[var(--dp-gray-600)]"
          />
          Default shipping
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="is_default_billing"
            defaultChecked={address?.is_default_billing ?? false}
            className="rounded border-[var(--dp-gray-600)]"
          />
          Default billing
        </label>
      </div>
    </>
  );
}

function AddressForm({
  address,
  profileFirstName,
  profileLastName,
  countries,
}: {
  address?: HttpTypes.StoreCustomerAddress;
  profileFirstName: string;
  profileLastName: string;
  countries: StoreCountryOption[];
}) {
  const prefix = address?.id ?? 'new';
  const [saveState, saveAction, savePending] = useActionState(saveCustomerAddressAction, null);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteCustomerAddressAction, null);

  return (
    <div className="rounded-lg border border-[var(--dp-gray-600)] p-4 space-y-4">
      {address ? (
        <h3 className="font-cinzel text-lg text-[var(--dp-light-red)]">
          {address.address_name || 'Address'}
        </h3>
      ) : (
        <h3 className="font-cinzel text-lg text-[var(--dp-light-red)]">New address</h3>
      )}
      <form action={saveAction} className="space-y-4">
        {address ? <input type="hidden" name="address_id" value={address.id} /> : null}
        <AddressFields
          address={address}
          profileFirstName={profileFirstName}
          profileLastName={profileLastName}
          prefix={prefix}
          countries={countries}
        />
        <ActionMessage state={saveState} />
        <button type="submit" disabled={savePending} className="dp-form-button">
          {savePending ? 'Saving…' : address ? 'Update address' : 'Add address'}
        </button>
      </form>
      {address ? (
        <form action={deleteAction} className="pt-2 border-t border-[var(--dp-gray-600)]">
          <input type="hidden" name="address_id" value={address.id} />
          <ActionMessage state={deleteState} />
          <button
            type="submit"
            disabled={deletePending}
            className="font-cinzel text-base text-red-400 hover:text-red-300 bg-transparent border-0 p-0 cursor-pointer"
          >
            {deletePending ? 'Removing…' : 'Remove address'}
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function ManageAccountForm({
  customer,
  countries,
  avatarUploadEnabled = false,
}: ManageAccountFormProps) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateCustomerProfileAction,
    null
  );
  const addresses = customer.addresses ?? [];
  const [profileFirstName, setProfileFirstName] = useState(customer.first_name ?? '');
  const [profileLastName, setProfileLastName] = useState(customer.last_name ?? '');

  return (
    <div className="max-w-2xl space-y-10">
      <section>
        <ProfileAvatarUpload
          avatarUrl={getCustomerAvatarProxyUrl(customer)}
          displayName={getCustomerDisplayName(customer)}
          uploadEnabled={avatarUploadEnabled}
        />
        <p className="dp-body-text text-gray-300 mb-4">
          Email: <span className="text-white">{customer.email}</span>
        </p>
        <form action={profileAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile_first_name" className="dp-form-label">
                First name
              </label>
              <input
                id="profile_first_name"
                name="first_name"
                value={profileFirstName}
                onChange={(e) => setProfileFirstName(e.target.value)}
                className="dp-form-input"
              />
            </div>
            <div>
              <label htmlFor="profile_last_name" className="dp-form-label">
                Last name
              </label>
              <input
                id="profile_last_name"
                name="last_name"
                value={profileLastName}
                onChange={(e) => setProfileLastName(e.target.value)}
                className="dp-form-input"
              />
            </div>
          </div>
          <div>
            <label htmlFor="profile_phone" className="dp-form-label">
              Phone
            </label>
            <input
              id="profile_phone"
              name="phone"
              type="tel"
              defaultValue={customer.phone ?? ''}
              className="dp-form-input"
            />
          </div>
          <div>
            <label htmlFor="profile_company_name" className="dp-form-label">
              Company
            </label>
            <input
              id="profile_company_name"
              name="company_name"
              defaultValue={customer.company_name ?? ''}
              className="dp-form-input"
            />
          </div>
          <ActionMessage state={profileState} />
          <button type="submit" disabled={profilePending} className="dp-form-button">
            {profilePending ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="dp-section-header text-xl mb-4">Addresses</h2>
        <div className="space-y-6">
          {addresses.map((address) => (
            <AddressForm
              key={address.id}
              address={address}
              profileFirstName={profileFirstName}
              profileLastName={profileLastName}
              countries={countries}
            />
          ))}
          <AddressForm
            profileFirstName={profileFirstName}
            profileLastName={profileLastName}
            countries={countries}
          />
        </div>
      </section>
    </div>
  );
}
