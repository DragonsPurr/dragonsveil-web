'use client';

import {
  getProvinceFieldLabel,
  getSubdivisionsForCountry,
  normalizeProvinceForCountry,
} from '@/app/lib/address-locations';
import type { StoreCountryOption } from '@/app/lib/medusa-region';
import { useMemo, useState } from 'react';

type CountryProvinceFieldsProps = {
  countries: StoreCountryOption[];
  prefix: string;
  defaultCountry?: string | null;
  defaultProvince?: string | null;
  countryRequired?: boolean;
  /** When set with `onCountryCodeChange`, country select is controlled by the parent. */
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
  /** When set with `onProvinceChange`, province field is controlled by the parent. */
  province?: string;
  onProvinceChange?: (code: string) => void;
};

export function CountryProvinceFields({
  countries,
  prefix,
  defaultCountry = '',
  defaultProvince = '',
  countryRequired = true,
  countryCode: controlledCountry,
  onCountryCodeChange,
  province: controlledProvince,
  onProvinceChange,
}: CountryProvinceFieldsProps) {
  const initialCountry = (defaultCountry ?? '').trim().toLowerCase();
  const resolvedInitialCountry =
    (initialCountry && countries.some((c) => c.iso2 === initialCountry)
      ? initialCountry
      : null) ??
    countries[0]?.iso2 ??
    '';

  const isCountryControlled =
    controlledCountry !== undefined && onCountryCodeChange !== undefined;
  const isProvinceControlled =
    controlledProvince !== undefined && onProvinceChange !== undefined;

  const [internalCountry, setInternalCountry] = useState(resolvedInitialCountry);
  const country = isCountryControlled ? controlledCountry : internalCountry;

  const subdivisions = useMemo(() => getSubdivisionsForCountry(country), [country]);

  const [internalProvince, setInternalProvince] = useState(() =>
    normalizeProvinceForCountry(resolvedInitialCountry, defaultProvince)
  );
  const province = isProvinceControlled ? controlledProvince : internalProvince;

  const countryId = `${prefix}_country_code`;
  const provinceId = `${prefix}_province`;
  const provinceLabel = getProvinceFieldLabel(country);

  const handleCountryChange = (nextCountry: string) => {
    if (isCountryControlled) {
      onCountryCodeChange(nextCountry);
      if (isProvinceControlled) {
        onProvinceChange('');
      }
    } else {
      setInternalCountry(nextCountry);
      setInternalProvince('');
    }
  };

  const handleProvinceChange = (nextProvince: string) => {
    if (isProvinceControlled) {
      onProvinceChange(nextProvince);
    } else {
      setInternalProvince(nextProvince);
    }
  };

  const provinceInList =
    subdivisions.length === 0 ||
    subdivisions.some((s) => s.code === province) ||
    province === '';

  return (
    <>
      <div>
        <label htmlFor={countryId} className="dp-form-label">
          Country
        </label>
        <select
          id={countryId}
          name="country_code"
          required={countryRequired}
          value={country}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="dp-form-select"
        >
          <option value="" disabled>
            Select a country
          </option>
          {countries.map((c) => (
            <option key={c.iso2} value={c.iso2}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={provinceId} className="dp-form-label">
          {provinceLabel}
        </label>
        {subdivisions.length > 0 ? (
          <select
            id={provinceId}
            name="province"
            value={provinceInList ? province : ''}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="dp-form-select"
          >
            <option value="">Select {provinceLabel.toLowerCase()}</option>
            {subdivisions.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={provinceId}
            name="province"
            type="text"
            value={province}
            onChange={(e) => handleProvinceChange(e.target.value)}
            placeholder="Optional"
            className="dp-form-input"
          />
        )}
      </div>
    </>
  );
}
