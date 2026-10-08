export type GeocodedPoint = { latitude: number; longitude: number };

export interface AddressParts {
  street: string;
  district: string;
  city: string;
  province: string;
  postalCode?: string;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/** Drop RT/RW, "No." and block markers that OpenStreetMap does not index, which make street searches miss. */
export function simplifyStreet(street: string): string {
  return street
    .replace(/\bRT\.?\s*\d+(\s*\/\s*(RW\.?\s*)?\d+)?/gi, ' ')
    .replace(/\bRW\.?\s*\d+/gi, ' ')
    .replace(/\b(no|nomor)\.?\s*(?=\d)/gi, ' ')
    .replace(/[,;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Search queries from most to least specific; the first one that resolves wins,
 * so a street OpenStreetMap does not know still lands the pin in the right district.
 */
export function buildGeocodeQueries(parts: AddressParts): string[] {
  const area = [parts.district, parts.city, parts.province].map((value) => value.trim()).filter(Boolean);
  const street = simplifyStreet(parts.street);
  const queries: string[] = [];

  if (street) {
    queries.push([street, ...area, 'Indonesia'].join(', '));
    const streetName = street.split(/\s+/).slice(0, 3).join(' ');
    if (streetName && streetName !== street) {
      queries.push([streetName, ...area, 'Indonesia'].join(', '));
    }
  }
  if (area.length > 0) {
    queries.push([...area, 'Indonesia'].join(', '));
  }
  return [...new Set(queries)];
}

/** Resolve an address to a map point with OpenStreetMap Nominatim; null when nothing matched. */
export async function geocodeAddress(
  parts: AddressParts,
  signal?: AbortSignal,
  fetchImpl: typeof fetch = fetch
): Promise<GeocodedPoint | null> {
  for (const query of buildGeocodeQueries(parts)) {
    const url = `${NOMINATIM_URL}?${new URLSearchParams({ q: query, format: 'jsonv2', limit: '1', countrycodes: 'id' })}`;
    const response = await fetchImpl(url, { signal, headers: { Accept: 'application/json' } });
    if (!response.ok) {
      return null;
    }
    const results = (await response.json().catch(() => [])) as Array<{ lat?: string; lon?: string }>;
    const latitude = Number(results[0]?.lat);
    const longitude = Number(results[0]?.lon);
    if (results.length > 0 && Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return { latitude, longitude };
    }
  }
  return null;
}
