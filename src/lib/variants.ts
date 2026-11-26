import type { ProductVariant } from "@/generated/prisma/client";
import { slugify } from "@/lib/slug";

export type SizeOption = {
  size: string;
  color: string | null;
  variantId: number;
  stock: number;
  available: boolean;
};

export type ColorOption = { key: string; label: string; available: boolean };

const SIZE_ORDER = ["PP", "P", "M", "G", "GG", "XG", "XGG"];

// A cor é texto livre no ERP: "Off White", "Offwhite" e "off white" são a
// mesma opção pro cliente.
export function colorKey(color: string | null): string {
  return slugify(color ?? "").replaceAll("-", "");
}

function compareSizes(a: string, b: string): number {
  const ia = SIZE_ORDER.indexOf(a.toUpperCase());
  const ib = SIZE_ORDER.indexOf(b.toUpperCase());
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== ib) return ia === -1 ? 1 : -1;
  return a.localeCompare(b, "pt-BR", { numeric: true });
}

/** Cores distintas do produto, as com estoque primeiro. Vazio = sem cor. */
export function colorOptionsFor(variants: ProductVariant[]): ColorOption[] {
  const byKey = new Map<string, ColorOption>();
  for (const v of variants) {
    const key = colorKey(v.color);
    if (!key) continue;
    const option = byKey.get(key) ?? { key, label: v.color!.trim(), available: false };
    option.available ||= v.stock > 0;
    byKey.set(key, option);
  }
  return Array.from(byKey.values()).sort(
    (a, b) => Number(b.available) - Number(a.available) || a.label.localeCompare(b.label, "pt-BR"),
  );
}

/**
 * Uma opção por tamanho do produto. Com `color`, estoque e variante vêm só
 * daquela cor (tamanho que ela não tem aparece indisponível). `variantId` e
 * `stock` são sempre da mesma variante, a que vai de fato pro carrinho.
 */
export function sizeOptionsFor(variants: ProductVariant[], color?: string | null): SizeOption[] {
  const sizes = Array.from(new Set(variants.map((v) => v.size))).sort(compareSizes);

  return sizes.map((size) => {
    const matches = variants.filter(
      (v) => v.size === size && (!color || colorKey(v.color) === color),
    );
    const chosen = matches.sort((a, b) => b.stock - a.stock)[0];
    return {
      size,
      color: chosen?.color?.trim() ?? null,
      variantId: chosen?.id ?? -1,
      stock: chosen?.stock ?? 0,
      available: (chosen?.stock ?? 0) > 0,
    };
  });
}
