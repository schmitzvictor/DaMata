"use server";

import { prisma } from "@/lib/prisma";
import { calculateShipping, type ShippingOption } from "@/lib/shipping";
import { createPaymentPreference, type PaymentMethod } from "@/lib/payment";

export type CreateOrderInput = {
  customer: { name: string; email: string; phone: string };
  address: {
    zip: string;
    street: string;
    number: string;
    complement: string;
    district: string;
    city: string;
    state: string;
    reference: string;
  };
  shippingMethod: string;
  paymentMethod: PaymentMethod;
  items: { variantId: number; quantity: number }[];
};

export async function quoteShippingAction(
  zip: string,
  subtotal: number,
): Promise<ShippingOption[]> {
  // weightGrams is computed from the real cart at order-creation time; a
  // quote before that only needs zip + subtotal (free-shipping threshold).
  return calculateShipping({ zip, weightGrams: 0, subtotal });
}

export async function createOrderAction(input: CreateOrderInput) {
  if (!input.customer.name || !input.customer.email) {
    throw new Error("Nome e e-mail são obrigatórios.");
  }
  if (input.items.length === 0) {
    throw new Error("Carrinho vazio.");
  }
  if (
    !input.address.zip ||
    !input.address.street ||
    !input.address.number ||
    !input.address.district ||
    !input.address.city ||
    !input.address.state
  ) {
    throw new Error("Endereço incompleto.");
  }

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: input.items.map((i) => i.variantId) } },
    include: { product: true },
  });

  // Prices/names come from the DB, never from the client, so an item can't
  // be checked out at a tampered price.
  const resolved = input.items.map((requested) => {
    const variant = variants.find((v) => v.id === requested.variantId);
    if (!variant || requested.quantity < 1) {
      throw new Error("Item de carrinho inválido.");
    }
    return { variant, quantity: requested.quantity };
  });

  const orderItemsData = resolved.map(({ variant, quantity }) => ({
    productId: variant.productId,
    productName: variant.product.name,
    size: variant.size,
    quantity,
    price: variant.product.price,
  }));

  const subtotal = orderItemsData.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  const weightGrams = resolved.reduce(
    (sum, { variant, quantity }) => sum + (variant.product.weightGrams ?? 0) * quantity,
    0,
  );

  const shippingOptions = await calculateShipping({
    zip: input.address.zip,
    weightGrams,
    subtotal,
  });
  const shipping =
    shippingOptions.find((o) => o.method === input.shippingMethod) ??
    shippingOptions[0];
  const total = subtotal + (shipping?.cost ?? 0);

  // NOTE: this does not decrement ProductVariant.stock — inventory is not
  // debited on checkout yet. Flagged in the review summary.
  const order = await prisma.order.create({
    data: {
      customerName: input.customer.name,
      customerEmail: input.customer.email,
      customerPhone: input.customer.phone || null,
      total,
      addressZip: input.address.zip,
      addressStreet: input.address.street,
      addressNumber: input.address.number,
      addressComplement: input.address.complement || null,
      addressDistrict: input.address.district,
      addressCity: input.address.city,
      addressState: input.address.state,
      addressReference: input.address.reference || null,
      shippingMethod: shipping?.label ?? null,
      shippingCost: shipping?.cost ?? null,
      paymentProvider: "mercadopago",
      paymentMethod: input.paymentMethod,
      orderItems: { create: orderItemsData },
    },
    select: { id: true },
  });

  const preference = await createPaymentPreference({
    orderId: order.id,
    total,
    method: input.paymentMethod,
    customerEmail: input.customer.email,
  });

  return { orderId: order.id, total, paymentPreference: preference };
}
