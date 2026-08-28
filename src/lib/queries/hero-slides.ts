import { prisma } from "@/lib/prisma";

export function getHeroSlides() {
  return prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
}
