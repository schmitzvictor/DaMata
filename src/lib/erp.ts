type StockMovementInput = {
  erpVariantId: string;
  quantity: number;
  reason: string;
};

// Site -> ERP. Fire-and-forget by design: a failure here must never block
// order confirmation for the customer. Callers should just log the outcome
// and reconcile manually — see the mercadopago webhook handler.
export async function notifyErpStockMovement(
  input: StockMovementInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiUrl = process.env.ERP_API_URL;
  const apiToken = process.env.ERP_API_TOKEN;
  if (!apiUrl || !apiToken) {
    return { ok: false, error: "ERP_API_URL/ERP_API_TOKEN not configured" };
  }

  try {
    const res = await fetch(`${apiUrl}/api/movements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        productId: input.erpVariantId,
        type: "SAIDA",
        quantity: input.quantity,
        reason: input.reason,
      }),
    });
    if (!res.ok) {
      return { ok: false, error: `ERP responded ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
