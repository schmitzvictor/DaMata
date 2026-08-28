"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadBannerImage } from "@/lib/r2";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Não autorizado.");
  }
  return session;
}

export async function createSlideAction(formData: FormData) {
  await requireAdmin();

  const href = String(formData.get("href") ?? "").trim();
  const file = formData.get("image");
  if (!href) {
    throw new Error("Informe o link de destino do slide.");
  }
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecione uma imagem para o slide.");
  }

  const imageUrl = await uploadBannerImage(file);

  const last = await prisma.heroSlide.findFirst({ orderBy: { order: "desc" } });
  await prisma.heroSlide.create({
    data: { imageUrl, href, order: (last?.order ?? -1) + 1 },
  });

  revalidatePath("/admin/banner");
  revalidatePath("/");
}

export async function deleteSlideAction(slideId: number) {
  await requireAdmin();

  await prisma.heroSlide.delete({ where: { id: slideId } });

  revalidatePath("/admin/banner");
  revalidatePath("/");
}

// Troca a ordem do slide com o vizinho imediato — swap simples, não precisa
// de valores de `order` sequenciais/únicos pra funcionar.
export async function moveSlideAction(slideId: number, direction: "up" | "down") {
  await requireAdmin();

  const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
  const index = slides.findIndex((s) => s.id === slideId);
  if (index === -1) return;

  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  if (neighborIndex < 0 || neighborIndex >= slides.length) return;

  const current = slides[index];
  const neighbor = slides[neighborIndex];

  await prisma.$transaction([
    prisma.heroSlide.update({ where: { id: current.id }, data: { order: neighbor.order } }),
    prisma.heroSlide.update({ where: { id: neighbor.id }, data: { order: current.order } }),
  ]);

  revalidatePath("/admin/banner");
  revalidatePath("/");
}
