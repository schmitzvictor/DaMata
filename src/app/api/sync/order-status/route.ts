import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderStatusEmail } from "@/lib/email";

/**
 * ERP -> Site: avisa que o status de um pedido mudou lá (gerenciamento de
 * pedidos é feito no ERP, não no admin do site). Dispara o e-mail
 * correspondente pro cliente. "pago" nunca chega aqui — o site já sabe
 * disso sozinho via webhook do Mercado Pago; só aceitamos as transições
 * que só existem no ERP.
 *
 * Auth: header `x-sync-secret: <ERP_SYNC_SECRET>` (mesmo secret do sync de
 * produto).
 *
 * Body: { "siteOrderId": 42, "status": "enviado" | "entregue" | "cancelado" }
 */

const ALLOWED_STATUSES = new Set(["enviado", "entregue", "cancelado"]);

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ERP_SYNC_SECRET;
  if (!secret) return false;

  const provided = req.headers.get("x-sync-secret") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição precisa ser JSON válido." },
      { status: 400 },
    );
  }

  const b = (body ?? {}) as Record<string, unknown>;
  if (typeof b.siteOrderId !== "number" || !Number.isInteger(b.siteOrderId)) {
    return NextResponse.json(
      { error: 'Campo "siteOrderId" é obrigatório e deve ser um inteiro.' },
      { status: 400 },
    );
  }
  if (typeof b.status !== "string" || !ALLOWED_STATUSES.has(b.status)) {
    return NextResponse.json(
      { error: 'Campo "status" deve ser "enviado", "entregue" ou "cancelado".' },
      { status: 400 },
    );
  }
  const status = b.status as "enviado" | "entregue" | "cancelado";

  const order = await prisma.order.findUnique({
    where: { id: b.siteOrderId },
    include: { orderItems: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  if (order.status === status) {
    // Reentrega — no-op, mesma lógica de idempotência do resto do sync.
    return NextResponse.json({ ok: true, duplicate: true });
  }

  await prisma.order.update({ where: { id: order.id }, data: { status } });
  await sendOrderStatusEmail(order, status);

  return NextResponse.json({ ok: true });
}
