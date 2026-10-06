'use client';

import { useState, useCallback, useRef } from 'react';
import { validateCheckout, CheckoutValidationResponse } from '@/lib/api';
import { CartItem } from '@/store/useCartStore';

export function useCheckoutValidation(token: string | null, cartItems: CartItem[]) {
  const [checkoutData, setCheckoutData] = useState<CheckoutValidationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const requestVersion = useRef(0);
  const [validatedKey, setValidatedKey] = useState<string | null>(null);
  const cartKey = JSON.stringify(cartItems.map((item) => [item.productId, item.quantity]));

  const runCheckoutValidation = useCallback(
    async (addressId?: number | null) => {
      const version = ++requestVersion.current;
      setValidatedKey(null);
      setCheckoutData(null);
      if (!token || cartItems.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setValidationError(null);

      try {
        const payloadItems = cartItems.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        }));

        const response = await validateCheckout(
          {
            items: payloadItems,
            address_id: addressId ?? null,
          },
          token
        );

        if (version !== requestVersion.current) return;
        setCheckoutData(response);
        setValidatedKey(JSON.stringify([token, addressId ?? null, cartKey]));
      } catch (err: unknown) {
        if (version !== requestVersion.current) return;
        const msg = err instanceof Error ? err.message : 'Failed to validate checkout calculation.';
        setValidationError(msg);
      } finally {
        if (version === requestVersion.current) setLoading(false);
      }
    },
    [token, cartItems, cartKey]
  );

  return {
    checkoutData,
    loading,
    validationError,
    setValidationError,
    runCheckoutValidation,
    isValidationCurrent: (addressId: number | null) => validatedKey === JSON.stringify([token, addressId, cartKey]),
  };
}
