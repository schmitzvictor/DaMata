"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ALL_CONTENT_FIELDS } from "@/lib/site-content";

export async function updateSiteContentAction(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Não autorizado.");
  }

  await prisma.$transaction(
    ALL_CONTENT_FIELDS.map(({ key }) => {
      const value = String(formData.get(key) ?? "").trim();
      // Campo em branco = volta a usar o texto padrão — não guarda linha
      // vazia, só remove o override se existir.
      if (value === "") {
        return prisma.siteContent.deleteMany({ where: { key } });
      }
      return prisma.siteContent.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }),
  );

  revalidatePath("/", "layout");
  revalidatePath("/admin/conteudo");
}
