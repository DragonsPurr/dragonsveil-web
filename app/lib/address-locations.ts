/** ISO 3166-2 subdivision codes (lowercase) for address province fields. */
export type SubdivisionOption = { code: string; name: string };

export const SUBDIVISIONS_BY_COUNTRY: Record<string, SubdivisionOption[]> = {
  ca: [
    { code: 'ca-ab', name: 'Alberta' },
    { code: 'ca-bc', name: 'British Columbia' },
    { code: 'ca-mb', name: 'Manitoba' },
    { code: 'ca-nb', name: 'New Brunswick' },
    { code: 'ca-nl', name: 'Newfoundland and Labrador' },
    { code: 'ca-ns', name: 'Nova Scotia' },
    { code: 'ca-nt', name: 'Northwest Territories' },
    { code: 'ca-nu', name: 'Nunavut' },
    { code: 'ca-on', name: 'Ontario' },
    { code: 'ca-pe', name: 'Prince Edward Island' },
    { code: 'ca-qc', name: 'Quebec' },
    { code: 'ca-sk', name: 'Saskatchewan' },
    { code: 'ca-yt', name: 'Yukon' },
  ],
  us: [
    { code: 'us-al', name: 'Alabama' },
    { code: 'us-ak', name: 'Alaska' },
    { code: 'us-az', name: 'Arizona' },
    { code: 'us-ar', name: 'Arkansas' },
    { code: 'us-ca', name: 'California' },
    { code: 'us-co', name: 'Colorado' },
    { code: 'us-ct', name: 'Connecticut' },
    { code: 'us-de', name: 'Delaware' },
    { code: 'us-dc', name: 'District of Columbia' },
    { code: 'us-fl', name: 'Florida' },
    { code: 'us-ga', name: 'Georgia' },
    { code: 'us-hi', name: 'Hawaii' },
    { code: 'us-id', name: 'Idaho' },
    { code: 'us-il', name: 'Illinois' },
    { code: 'us-in', name: 'Indiana' },
    { code: 'us-ia', name: 'Iowa' },
    { code: 'us-ks', name: 'Kansas' },
    { code: 'us-ky', name: 'Kentucky' },
    { code: 'us-la', name: 'Louisiana' },
    { code: 'us-me', name: 'Maine' },
    { code: 'us-md', name: 'Maryland' },
    { code: 'us-ma', name: 'Massachusetts' },
    { code: 'us-mi', name: 'Michigan' },
    { code: 'us-mn', name: 'Minnesota' },
    { code: 'us-ms', name: 'Mississippi' },
    { code: 'us-mo', name: 'Missouri' },
    { code: 'us-mt', name: 'Montana' },
    { code: 'us-ne', name: 'Nebraska' },
    { code: 'us-nv', name: 'Nevada' },
    { code: 'us-nh', name: 'New Hampshire' },
    { code: 'us-nj', name: 'New Jersey' },
    { code: 'us-nm', name: 'New Mexico' },
    { code: 'us-ny', name: 'New York' },
    { code: 'us-nc', name: 'North Carolina' },
    { code: 'us-nd', name: 'North Dakota' },
    { code: 'us-oh', name: 'Ohio' },
    { code: 'us-ok', name: 'Oklahoma' },
    { code: 'us-or', name: 'Oregon' },
    { code: 'us-pa', name: 'Pennsylvania' },
    { code: 'us-ri', name: 'Rhode Island' },
    { code: 'us-sc', name: 'South Carolina' },
    { code: 'us-sd', name: 'South Dakota' },
    { code: 'us-tn', name: 'Tennessee' },
    { code: 'us-tx', name: 'Texas' },
    { code: 'us-ut', name: 'Utah' },
    { code: 'us-vt', name: 'Vermont' },
    { code: 'us-va', name: 'Virginia' },
    { code: 'us-wa', name: 'Washington' },
    { code: 'us-wv', name: 'West Virginia' },
    { code: 'us-wi', name: 'Wisconsin' },
    { code: 'us-wy', name: 'Wyoming' },
  ],
};

export function getSubdivisionsForCountry(countryCode: string): SubdivisionOption[] {
  return SUBDIVISIONS_BY_COUNTRY[countryCode.toLowerCase()] ?? [];
}

export function getProvinceFieldLabel(countryCode: string): string {
  const code = countryCode.toLowerCase();
  if (code === 'us') return 'State';
  if (code === 'ca') return 'Province / territory';
  return 'Province / state';
}

export function normalizeProvinceForCountry(
  countryCode: string,
  province: string | null | undefined
): string {
  if (!province) return '';
  const trimmed = province.trim();
  if (!trimmed) return '';

  const subdivisions = getSubdivisionsForCountry(countryCode);
  if (subdivisions.length === 0) return trimmed;

  const lower = trimmed.toLowerCase();
  const byCode = subdivisions.find((s) => s.code === lower);
  if (byCode) return byCode.code;

  const country = countryCode.toLowerCase();
  if (lower.length === 2) {
    const fromAbbrev = subdivisions.find((s) => s.code === `${country}-${lower}`);
    if (fromAbbrev) return fromAbbrev.code;
  }

  const byName = subdivisions.find((s) => s.name.toLowerCase() === lower);
  return byName?.code ?? trimmed;
}
