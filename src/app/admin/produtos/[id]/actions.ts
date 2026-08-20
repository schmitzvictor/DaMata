"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadProductImage } from "@/lib/r2";

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
  const featured = formData.get("featured") === "on";
  const isBestSeller = formData.get("isBestSeller") === "on";

  const keptImages = formData.getAll("keepImages").map(String);
  const newFiles = formData
    .getAll("newImages")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const uploadedUrls = await Promise.all(newFiles.map(uploadProductImage));
  const images = [...keptImages, ...uploadedUrls];

  await prisma.product.update({
    where: { id: productId },
    data: { description, images, featured, isBestSeller },
  });

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/admin/produtos");
}
