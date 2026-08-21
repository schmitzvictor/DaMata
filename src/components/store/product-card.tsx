"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { formatBRL, formatInstallment } from "@/lib/format";
import { ProductImagePlaceholder } from "./product-image-placeholder";
import { VariantSelector } from "./variant-selector";
import type { ProductWithVariants } from "@/lib/queries/products";

const NEW_WINDOW_DAYS = 14;

function isNew(createdAt: Date) {
  const days = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  return days <= NEW_WINDOW_DAYS;
}

export function ProductCard({
  product,
  quickBuyButton = false,
  className,
}: {
  product: ProductWithVariants;
  quickBuyButton?: boolean;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const { addItem } = useCart();
  const href = `/produto/${product.slug}`;
  const badge = isNew(product.createdAt) ? "Novo" : null;

  return (
    <div
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#E6DFD1]">
        <Link href={href} className="absolute inset-0">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote domains not configured yet
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <ProductImagePlaceholder label={product.name} />
          )}
        </Link>

        {badge ? (
          <span className="absolute left-3 top-3 bg-sol px-2.5 py-1 font-ui text-[10.5px] font-bold uppercase tracking-wide text-escuro">
            {badge}
          </span>
        ) : null}

        <div
          className={`absolute inset-x-0 bottom-0 flex justify-center gap-1.5 bg-escuro/85 p-3 transition-transform duration-300 max-md:translate-y-0 ${
            hovered ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <VariantSelector
            variants={product.variants}
            size="compact"
            tone="dark"
            onSelect={(opt) =>
              addItem({
                variantId: opt.variantId,
                productId: product.id,
                slug: product.slug,
                name: product.name,
                size: opt.size,
                color: null,
                price: product.price,
                image: product.images[0] ?? null,
              })
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 pt-4">
        <span className="font-ui text-[10px] uppercase tracking-widest text-terra">
          {product.category}
        </span>
        <Link href={href} className="font-body text-[17px] leading-tight text-escuro">
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2.5">
          <span className="font-ui text-lg font-bold text-verde-mata">
            {formatBRL(product.price)}
          </span>
        </div>
        <span className="font-ui text-[11.5px] text-escuro/55">
          {formatInstallment(product.price)}
        </span>

        {quickBuyButton ? (
          <Link
            href={href}
            className="mt-2 border border-verde-mata py-2.5 text-center font-display text-[17px] tracking-wide text-verde-mata"
          >
            COMPRA RÁPIDA
          </Link>
        ) : null}
      </div>
    </div>
  );
}
