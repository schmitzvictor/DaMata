import { Resend } from "resend";
import { formatBRL } from "@/lib/format";

type EmailOrderItem = {
  productName: string;
  size: string;
  quantity: number;
  price: number;
};

type EmailOrder = {
  id: number;
  customerName: string;
  customerEmail: string;
  total: number;
  shippingMethod: string | null;
  shippingCost: number | null;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string | null;
  addressDistrict: string;
  addressCity: string;
  addressState: string;
  paymentMethod: string | null;
  orderItems: EmailOrderItem[];
};

const STATUS_LABEL: Record<string, string> = {
  enviado: "enviado",
  entregue: "entregue",
  cancelado: "cancelado",
};

// Fire-and-forget by design, mesmo espírito do notifyErpOrder — falha ao
// mandar e-mail nunca deve derrubar o webhook de pagamento nem o sync de
// status do ERP. Cada send* função captura o próprio erro e só loga.
function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? "Da Mata Grow <pedidos@damatagrow.com.br>";
}

function addressLine(order: EmailOrder): string {
  const complement = order.addressComplement ? `, ${order.addressComplement}` : "";
  return `${order.addressStreet}, ${order.addressNumber}${complement} — ${order.addressDistrict}, ${order.addressCity}/${order.addressState}`;
}

function itemsHtml(items: EmailOrderItem[]): string {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e5e0d8;">${item.productName} (${item.size})</td>
        <td style="padding:8px 0;border-bottom:1px solid #e5e0d8;text-align:center;">${item.quantity}x</td>
        <td style="padding:8px 0;border-bottom:1px solid #e5e0d8;text-align:right;">${formatBRL(item.price * item.quantity)}</td>
      </tr>`,
    )
    .join("");
}

function wrapper(title: string, bodyHtml: string): string {
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#2b2b26;">
    <h1 style="font-size:18px;letter-spacing:0.04em;text-transform:uppercase;">${title}</h1>
    ${bodyHtml}
    <p style="margin-top:32px;font-size:12px;color:#8a8578;">Da Mata Grow</p>
  </div>`;
}

export async function sendOrderConfirmedEmail(order: EmailOrder): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.error("sendOrderConfirmedEmail: RESEND_API_KEY não configurada");
    return;
  }

  const html = wrapper(
    `Pedido #${order.id} confirmado`,
    `
    <p>Oi, ${order.customerName}! Recebemos o pagamento do seu pedido.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsHtml(order.orderItems)}</table>
    <p>Frete (${order.shippingMethod ?? "—"}): ${formatBRL(order.shippingCost ?? 0)}</p>
    <p style="font-weight:bold;">Total: ${formatBRL(order.total)}</p>
    <p>Endereço de entrega: ${addressLine(order)}</p>
    <p>Assim que o pedido for enviado, avisamos por aqui.</p>`,
  );

  try {
    await resend.emails.send({
      from: fromAddress(),
      to: order.customerEmail,
      subject: `Pedido #${order.id} confirmado — Da Mata Grow`,
      html,
    });
  } catch (err) {
    console.error("sendOrderConfirmedEmail failed", { orderId: order.id, err });
  }
}

export async function sendNewSaleNotification(order: EmailOrder): Promise<void> {
  const resend = getResend();
  const to = process.env.STORE_NOTIFICATION_EMAIL;
  if (!resend || !to) {
    if (!to) console.error("sendNewSaleNotification: STORE_NOTIFICATION_EMAIL não configurada");
    return;
  }

  const html = wrapper(
    `Nova venda — pedido #${order.id}`,
    `
    <p>Cliente: ${order.customerName} (${order.customerEmail})</p>
    <p>Pagamento: ${order.paymentMethod ?? "—"}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsHtml(order.orderItems)}</table>
    <p style="font-weight:bold;">Total: ${formatBRL(order.total)}</p>
    <p>Entrega: ${addressLine(order)}</p>`,
  );

  try {
    await resend.emails.send({
      from: fromAddress(),
      to,
      subject: `Nova venda #${order.id} — ${formatBRL(order.total)}`,
      html,
    });
  } catch (err) {
    console.error("sendNewSaleNotification failed", { orderId: order.id, err });
  }
}

export async function sendOrderStatusEmail(
  order: EmailOrder,
  status: "enviado" | "entregue" | "cancelado",
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.error("sendOrderStatusEmail: RESEND_API_KEY não configurada");
    return;
  }

  const label = STATUS_LABEL[status];
  const extra =
    status === "cancelado"
      ? "<p>Se você não esperava esse cancelamento, responda este e-mail que a gente resolve.</p>"
      : "";

  const html = wrapper(
    `Pedido #${order.id}: ${label}`,
    `
    <p>Oi, ${order.customerName}! Seu pedido #${order.id} foi marcado como <strong>${label}</strong>.</p>
    ${extra}`,
  );

  try {
    await resend.emails.send({
      from: fromAddress(),
      to: order.customerEmail,
      subject: `Pedido #${order.id}: ${label} — Da Mata Grow`,
      html,
    });
  } catch (err) {
    console.error("sendOrderStatusEmail failed", { orderId: order.id, status, err });
  }
}
