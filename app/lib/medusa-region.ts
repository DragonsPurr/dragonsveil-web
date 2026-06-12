import { SUBDIVISIONS_BY_COUNTRY } from '@/app/lib/address-locations';
import { isMedusaConfigured, sdk } from '@/app/lib/medusa';

export type StoreCountryOption = {
  iso2: string;
  name: string;
};

const FALLBACK_COUNTRIES: StoreCountryOption[] = [
  { iso2: 'ca', name: 'Canada' },
  { iso2: 'us', name: 'United States' },
];

export async function getDefaultRegionId(): Promise<string | null> {
  if (!isMedusaConfigured()) return null;
  const { regions } = await sdk.store.region.list({ limit: 1 });
  return regions[0]?.id ?? null;
}

/** Countries available in configured Medusa regions (for address forms). */
export async function listStoreCountries(): Promise<StoreCountryOption[]> {
  if (!isMedusaConfigured()) return FALLBACK_COUNTRIES;

  try {
    const { regions } = await sdk.store.region.list({
      limit: 100,
      fields: '*countries',
    });

    const byIso = new Map<string, string>();
    for (const region of regions) {
      for (const country of region.countries ?? []) {
        const iso2 = country.iso_2?.trim().toLowerCase();
        if (!iso2) continue;
        const name =
          country.display_name?.trim() ||
          country.name?.trim() ||
          iso2.toUpperCase();
        byIso.set(iso2, name);
      }
    }

    if (byIso.size === 0) return FALLBACK_COUNTRIES;

    return [...byIso.entries()]
      .map(([iso2, name]) => ({ iso2, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return FALLBACK_COUNTRIES;
  }
}

/** Ensures fallback countries with subdivision data appear in the list. */
export function mergeCountriesWithSubdivisions(
  countries: StoreCountryOption[]
): StoreCountryOption[] {
  const byIso = new Map(countries.map((c) => [c.iso2, c.name]));
  for (const iso2 of Object.keys(SUBDIVISIONS_BY_COUNTRY)) {
    if (!byIso.has(iso2)) {
      byIso.set(iso2, iso2 === 'ca' ? 'Canada' : iso2 === 'us' ? 'United States' : iso2.toUpperCase());
    }
  }
  return [...byIso.entries()]
    .map(([iso2, name]) => ({ iso2, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
