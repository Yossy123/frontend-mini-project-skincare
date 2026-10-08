import { API_BASE_URL } from './client';
import type { ShippingRatePayload, ShippingRate, DestinationResult } from './types';

/**
 * What the server says about instant couriers (Gojek / Grab) for a destination.
 */
export interface ShippingMeta {
  /** Instant delivery is switched on and the store pickup point is set. */
  instant_enabled: boolean;
  /** The destination address has a usable map pin. */
  destination_has_pin: boolean;
}

export interface ShippingQuote {
  rates: ShippingRate[];
  meta: ShippingMeta;
}

/**
 * Calculate domestic shipping rates from couriers via Biteship, together with
 * whether instant couriers are available for the destination.
 */
export async function fetchShippingQuote(
  payload: ShippingRatePayload,
  token?: string
): Promise<ShippingQuote> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/shipping/rates`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const json = await res.json();

  if (!res.ok) {
    const errorMsg = json.errors
      ? Object.values(json.errors).flat().join(' ')
      : json.message || 'Failed to calculate shipping rates';
    throw new Error(errorMsg);
  }

  return {
    rates: json.data || [],
    meta: {
      instant_enabled: Boolean(json.meta?.instant_enabled),
      destination_has_pin: Boolean(json.meta?.destination_has_pin),
    },
  };
}

/**
 * Calculate domestic shipping rates only.
 */
export async function fetchShippingRates(
  payload: ShippingRatePayload,
  token?: string
): Promise<ShippingRate[]> {
  return (await fetchShippingQuote(payload, token)).rates;
}

/**
 * Search domestic destination locations via Biteship areas API.
 */
export async function searchDestinations(query: string): Promise<DestinationResult[]> {
  const res = await fetch(`${API_BASE_URL}/shipping/destinations?search=${encodeURIComponent(query)}`, {
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to search destination locations');
  }

  const json = await res.json();
  return json.data || [];
}
