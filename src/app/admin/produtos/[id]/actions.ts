"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Only content fields. Name/slug/category/price/stock are owned by the ERP
// sync (api/sync/product) and are never touched here — see schema.prisma
// notes on Product.erpProductId.
export async function updateProductContentAction(
  productId: number,
  formData: FormData,
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Não autorizado.");
  }

  const description = String(formData.get("description") ?? "").trim() || null;
  const images = String(formData.get("images") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const featured = formData.get("featured") === "on";

  await prisma.product.update({
    where: { id: productId },
    data: { description, images, featured },
  });

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/admin/produtos");
}
