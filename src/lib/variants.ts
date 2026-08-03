import type { ProductVariant } from "@/generated/prisma/client";

export type SizeOption = {
  size: string;
  variantId: number;
  stock: number;
  available: boolean;
};

/**
 * Collapses a product's variants into one option per size.
 *
 * The schema allows color to vary independently of size, but neither the
 * approved design nor this pass model a color picker — a size is
 * "available" if any variant of that size has stock, and the option's
 * `variantId` points at the first in-stock variant for that size (falling
 * back to the first variant at all if every one is out of stock). Revisit
 * this if products start using distinct colors per size.
 */
export function sizeOptionsFor(variants: ProductVariant[]): SizeOption[] {
  const bySize = new Map<string, ProductVariant[]>();
  for (const v of variants) {
    const list = bySize.get(v.size) ?? [];
    list.push(v);
    bySize.set(v.size, list);
  }

  return Array.from(bySize.entries()).map(([size, vs]) => {
    const stock = vs.reduce((sum, v) => sum + v.stock, 0);
    const inStock = vs.find((v) => v.stock > 0) ?? vs[0];
    return {
      size,
      variantId: inStock.id,
      stock,
      available: stock > 0,
    };
  });
}
