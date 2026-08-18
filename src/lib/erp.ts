type ErpOrderItemInput = {
  erpVariantId: string;
  quantity: number;
};

type ErpOrderInput = {
  siteOrderId: number;
  customerName: string | null;
  customerPhone: string | null;
  paymentMethod: string | null;
  shippingCost: number;
  items: ErpOrderItemInput[];
};

// Site -> ERP. Fire-and-forget by design: a failure here must never block
// order confirmation for the customer. Callers should just log the outcome
// and reconcile manually — see the mercadopago webhook handler. Creates a
// real Order in the ERP (channel "site"), not just a stock movement — shows
// up in revenue/ABC dashboards there, unlike the old /api/movements call.
export async function notifyErpOrder(
  input: ErpOrderInput,
): Promise<{ ok: true; orderId?: string } | { ok: false; error: string }> {
  const apiUrl = process.env.ERP_API_URL;
  const apiToken = process.env.ERP_API_TOKEN;
  if (!apiUrl || !apiToken) {
    return { ok: false, error: "ERP_API_URL/ERP_API_TOKEN not configured" };
  }

  try {
    const res = await fetch(`${apiUrl}/api/orders/site`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      return { ok: false, error: `ERP responded ${res.status}` };
    }
    const data = (await res.json().catch(() => ({}))) as { orderId?: string };
    return { ok: true, orderId: data.orderId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
