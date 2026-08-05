export type PaymentMethod = "pix" | "boleto" | "cartao";

export type CreatePaymentInput = {
  orderId: number;
  total: number;
  method: PaymentMethod;
  customerEmail: string;
};

export type PaymentPreference = {
  provider: "mercadopago";
  id: string;
  initPoint: string | null;
};

/**
 * INTEGRATION POINT — Mercado Pago.
 *
 * Stub. Returns a fake preference id and no redirect URL, so checkout can
 * complete end-to-end without a live payment provider. Swap the body for a
 * real call to the Preferences API (`MERCADO_PAGO_ACCESS_TOKEN`) using
 * `input.total`/`input.method`/`input.customerEmail`, and return the real
 * preference id + `init_point`. Keep the return shape so
 * `app/checkout/actions.ts` doesn't need to change.
 *
 * IMPORTANT for the real implementation: set `external_reference` on the
 * preference to `String(input.orderId)`. `api/webhooks/mercadopago` matches
 * incoming payment notifications back to an `Order` by that field.
 */
export async function createPaymentPreference(
  input: CreatePaymentInput,
): Promise<PaymentPreference> {
  return {
    provider: "mercadopago",
    id: `stub-${input.orderId}`,
    initPoint: null,
  };
}
