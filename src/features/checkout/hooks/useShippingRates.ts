'use client';

import { useState, useCallback, useRef } from 'react';
import { fetchShippingQuote, ShippingMeta, ShippingRate } from '@/lib/api';
import { CartItem } from '@/store/useCartStore';

export function useShippingRates(token: string | null, cartItems: CartItem[]) {
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [shippingMeta, setShippingMeta] = useState<ShippingMeta | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const requestVersion = useRef(0);
  const [quoteKey, setQuoteKey] = useState<string | null>(null);
  const cartKey = JSON.stringify(cartItems.map((item) => [item.productId, item.quantity]));

  const loadShippingRates = useCallback(
    async (destination: string | number, weightGrams: number) => {
      const version = ++requestVersion.current;
      setQuoteKey(null);
      setSelectedRate(null);
      setShippingRates([]);
      setShippingMeta(null);
      // An empty cart (e.g. right after order placement clears it) must never
      // hit the rates API — the backend rejects requests without items.
      if (!destination || weightGrams <= 0 || cartItems.length === 0) {
        setShippingLoading(false);
        return;
      }

      setShippingLoading(true);
      setShippingError(null);

      try {
        const { rates, meta } = await fetchShippingQuote(
          {
            destination,
            weight: weightGrams,
            couriers: ['jne', 'sicepat', 'jnt', 'tiki', 'pos', 'grab', 'gojek'],
            items: cartItems.map((item) => ({
              product_id: item.productId,
              quantity: item.quantity,
            })),
          },
          token || undefined
        );

        if (version !== requestVersion.current) return;
        setShippingRates(rates);
        setShippingMeta(meta);
        setQuoteKey(JSON.stringify([token, String(destination), cartKey]));

        if (rates.length > 0) {
          setSelectedRate((prev) => {
            if (prev) {
              const matched = rates.find(
                (r) => r.courier === prev.courier && r.service === prev.service
              );
              return matched || rates[0];
            }
            return rates[0];
          });
        } else {
          setSelectedRate(null);
        }
      } catch (err: unknown) {
        if (version !== requestVersion.current) return;
        console.error('Shipping calculation error:', err);
        // Never keep rates/selection from a previous destination — a stale
        // selection would let the user place an order with an unquoted combo.
        setShippingRates([]);
        setSelectedRate(null);
        const msg = err instanceof Error ? err.message : 'Shipping rates could not be loaded. Please try again.';
        setShippingError(msg);
      } finally {
        if (version === requestVersion.current) setShippingLoading(false);
      }
    },
    [token, cartItems, cartKey]
  );

  return {
    shippingRates,
    selectedRate,
    shippingMeta,
    setSelectedRate,
    shippingLoading,
    shippingError,
    setShippingError,
    loadShippingRates,
    isQuoteCurrent: (destination: number | null) => quoteKey === JSON.stringify([token, String(destination), cartKey]),
  };
}
