import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyErpOrder } from "@/lib/erp";
import { sendOrderConfirmedEmail, sendNewSaleNotification } from "@/lib/email";

// O ERP não distingue "cartao" (o site não sabe se foi crédito ou débito) —
// crédito é o padrão mais comum em pagamento online, assume esse.
const ERP_PAYMENT_METHOD: Record<string, string> = {
  pix: "pix",
  boleto: "boleto",
  cartao: "cartao_credito",
};

type MpPayment = {
  id: number | string;
  status: string;
  external_reference: string | null;
};

function isSignatureValid(req: NextRequest): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const signatureHeader = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id");
  const dataId = req.nextUrl.searchParams.get("data.id");
  if (!secret || !signatureHeader || !requestId || !dataId) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    }),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Mercado Pago -> site. Confirms payment, flips Order.status, then notifies
// the ERP so it creates a matching Order there (channel "site") — this is
// what makes site sales show up in the ERP's revenue/ABC dashboards, not
// just its stock counts. Real preference creation lives in lib/payment.ts
// (still a stub) — see the note there about external_reference.
export async function POST(req: NextRequest) {
  if (!isSignatureValid(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body: unknown = await req.json().catch(() => null);
  const type =
    (body as { type?: string; topic?: string } | null)?.type ??
    (body as { type?: string; topic?: string } | null)?.topic;
  if (type !== "payment") {
    return NextResponse.json({ ignored: true });
  }

  const paymentId =
    req.nextUrl.searchParams.get("data.id") ??
    (body as { data?: { id?: string } } | null)?.data?.id;
  if (!paymentId) {
    return NextResponse.json({ error: "missing payment id" }, { status: 400 });
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const paymentRes = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!paymentRes.ok) {
    console.error("mercadopago webhook: failed to fetch payment", paymentId, paymentRes.status);
    return NextResponse.json({ error: "payment lookup failed" }, { status: 502 });
  }
  const payment = (await paymentRes.json()) as MpPayment;

  const orderId = Number(payment.external_reference);
  if (!Number.isInteger(orderId)) {
    console.error("mercadopago webhook: payment has no matching order", payment.id);
    return NextResponse.json({ ignored: true });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });
  if (!order) {
    console.error("mercadopago webhook: order not found", orderId);
    return NextResponse.json({ ignored: true });
  }

  if (payment.status !== "approved" || order.status === "pago") {
    // Not approved yet, or already processed (webhook retry) — no-op,
    // keeps the ERP notification idempotent.
    return NextResponse.json({ ok: true });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "pago",
      paymentStatus: "aprovado",
      paymentId: String(payment.id),
    },
  });

  await Promise.all([sendOrderConfirmedEmail(order), sendNewSaleNotification(order)]);

  const items = order.orderItems
    .filter((item) => {
      if (!item.erpVariantId) {
        console.error(
          "mercadopago webhook: order item has no erpVariantId, skipping ERP notify",
          { orderId: order.id, orderItemId: item.id },
        );
        return false;
      }
      return true;
    })
    .map((item) => ({ erpVariantId: item.erpVariantId!, quantity: item.quantity }));

  if (items.length > 0) {
    const result = await notifyErpOrder({
      siteOrderId: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      paymentMethod: order.paymentMethod ? (ERP_PAYMENT_METHOD[order.paymentMethod] ?? null) : null,
      shippingCost: order.shippingCost ?? 0,
      items,
    });
    if (!result.ok) {
      console.error("mercadopago webhook: ERP notify failed, reconcile manually", {
        orderId: order.id,
        error: result.error,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
