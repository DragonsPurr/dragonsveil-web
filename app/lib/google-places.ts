import { normalizeProvinceForCountry } from '@/app/lib/address-locations';

export type AddressComponentLike = {
  long_name: string;
  short_name: string;
  types: string[];
};

/** Address components from Places API (New) `Place.addressComponents`. */
export type PlaceAddressComponentLike = {
  longText?: string | null;
  shortText?: string | null;
  types: string[];
};

export type ParsedPlaceAddress = {
  address1: string;
  address2: string;
  city: string;
  postalCode: string;
  countryCode: string;
  province: string;
};

export function isGooglePlacesConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim());
}

function getComponent(
  components: AddressComponentLike[],
  type: string,
  name: 'long_name' | 'short_name' = 'long_name'
): string {
  const match = components.find((c) => c.types.includes(type));
  return match?.[name] ?? '';
}

function placeComponentsToLegacy(
  components: PlaceAddressComponentLike[]
): AddressComponentLike[] {
  return components.map((c) => ({
    long_name: c.longText ?? '',
    short_name: c.shortText ?? c.longText ?? '',
    types: c.types,
  }));
}

/** Maps Places API (New) `Place.addressComponents` to Medusa address fields. */
export function parsePlaceAddressComponents(
  components: PlaceAddressComponentLike[]
): ParsedPlaceAddress {
  return parseGoogleAddressComponents(placeComponentsToLegacy(components));
}

/** Maps legacy Place `address_components` to Medusa address fields. */
export function parseGoogleAddressComponents(
  components: AddressComponentLike[]
): ParsedPlaceAddress {
  const streetNumber = getComponent(components, 'street_number');
  const route = getComponent(components, 'route');
  const address1 = [streetNumber, route].filter(Boolean).join(' ').trim();

  const city =
    getComponent(components, 'locality') ||
    getComponent(components, 'postal_town') ||
    getComponent(components, 'sublocality_level_1') ||
    getComponent(components, 'sublocality');

  const countryCode = getComponent(components, 'country', 'short_name').toLowerCase();
  const provinceRaw =
    getComponent(components, 'administrative_area_level_1', 'short_name') ||
    getComponent(components, 'administrative_area_level_1');

  return {
    address1,
    address2: getComponent(components, 'subpremise'),
    city,
    postalCode: getComponent(components, 'postal_code'),
    countryCode,
    province: normalizeProvinceForCountry(countryCode, provinceRaw),
  };
}
