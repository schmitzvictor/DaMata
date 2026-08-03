"use client";

import { sizeOptionsFor, type SizeOption } from "@/lib/variants";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/generated/prisma/client";

type Props = {
  variants: ProductVariant[];
  selectedVariantId?: number | null;
  onSelect: (option: SizeOption) => void;
  /** compact = 32px chips for card quick-add; default = 54px PDP buttons. */
  size?: "compact" | "default";
  /** compact chips sit on a dark hover overlay; default sits on a light page. */
  tone?: "dark" | "light";
};

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
  size = "default",
  tone = "light",
}: Props) {
  const options = sizeOptionsFor(variants);
  const compact = size === "compact";

  return (
    <div className={cn("flex flex-wrap gap-2.5", compact && "justify-center gap-1.5")}>
      {options.map((opt) => {
        const selected = opt.variantId === selectedVariantId;
        return (
          <button
            key={opt.size}
            type="button"
            disabled={!opt.available}
            onClick={() => onSelect(opt)}
            className={cn(
              "border font-ui font-semibold cursor-pointer disabled:cursor-not-allowed transition-colors",
              compact
                ? "h-8 w-8 text-[11.5px]"
                : "h-[52px] min-w-[54px] px-3 text-sm",
              !opt.available && "line-through",
              selected
                ? "border-verde-vivo bg-verde-vivo text-escuro"
                : !opt.available
                  ? tone === "dark"
                    ? "border-creme/25 text-creme/30 bg-transparent"
                    : "border-escuro/20 text-escuro/30 bg-transparent"
                  : tone === "dark"
                    ? "border-creme/55 text-creme bg-transparent hover:border-verde-vivo"
                    : "border-escuro/30 text-escuro bg-transparent hover:border-verde-vivo",
            )}
          >
            {opt.size}
          </button>
        );
      })}
    </div>
  );
}
