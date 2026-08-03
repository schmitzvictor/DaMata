export type ShippingOption = {
  method: string;
  label: string;
  etaDays: string;
  cost: number;
};

export type ShippingQuoteInput = {
  zip: string;
  weightGrams: number;
  subtotal: number;
};

/**
 * INTEGRATION POINT — Melhor Envio.
 *
 * Stub. Returns flat rates (free above R$299, matching the approved
 * design's copy) regardless of `zip`/`weightGrams`, so checkout has real
 * numbers to work with. Swap the body for a Melhor Envio quote call —
 * `zip` is the destination CEP, `weightGrams` is the cart's total weight
 * (sum of `Product.weightGrams * quantity`) — and keep the return shape so
 * `app/checkout/actions.ts` doesn't need to change.
 */
export async function calculateShipping(
  input: ShippingQuoteInput,
): Promise<ShippingOption[]> {
  const freeShipping = input.subtotal >= 299;
  return [
    {
      method: "pac",
      label: "PAC — Correios",
      etaDays: "5 a 8 dias úteis",
      cost: freeShipping ? 0 : 24.9,
    },
    {
      method: "sedex",
      label: "SEDEX",
      etaDays: "2 a 3 dias úteis",
      cost: freeShipping ? 0 : 38.9,
    },
  ];
}
