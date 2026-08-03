import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import type { Prisma } from "@/generated/prisma/client";

export type ProductWithVariants = Prisma.ProductGetPayload<{
  include: { variants: true };
}>;

const withVariants = { variants: true } satisfies Prisma.ProductInclude;

/** "Mais vendidos" — featured products, catalog order. */
export function getBestSellers(limit = 5) {
  return prisma.product.findMany({
    where: { featured: true },
    include: withVariants,
    orderBy: { id: "asc" },
    take: limit,
  });
}

/** "Lançamentos" — featured products, most recently added first. */
export function getLaunches(limit = 4) {
  return prisma.product.findMany({
    where: { featured: true },
    include: withVariants,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export type CategoryLink = { slug: string; label: string };

/** Distinct product categories, for nav/mega-menu and PLP routing. */
export async function getCategories(): Promise<CategoryLink[]> {
  const rows = await prisma.product.groupBy({ by: ["category"] });
  return rows
    .map((r) => ({ slug: slugify(r.category), label: r.category }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

/** Resolves a URL slug (e.g. "calcas-bermudas") back to the exact stored
 *  category string (e.g. "Calças/Bermudas") — categories aren't a separate
 *  table in this schema, so the match happens in app code. */
export async function getCategoryBySlug(
  slug: string,
): Promise<string | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug)?.label ?? null;
}

export function getProductsByCategory(category: string) {
  return prisma.product.findMany({
    where: { category },
    include: withVariants,
    orderBy: { createdAt: "desc" },
  });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: withVariants,
  });
}

export function getRelatedProducts(
  category: string,
  excludeSlug: string,
  limit = 4,
) {
  return prisma.product.findMany({
    where: { category, slug: { not: excludeSlug } },
    include: withVariants,
    take: limit,
  });
}
