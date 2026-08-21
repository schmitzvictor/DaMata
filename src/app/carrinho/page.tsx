"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { formatBRL } from "@/lib/format";
import { ProductImagePlaceholder } from "@/components/store/product-image-placeholder";

const FREE_SHIPPING_THRESHOLD = 299;

export default function CartPage() {
  const { items, subtotal, setQuantity, removeItem } = useCart();

  return (
    <div className="mx-auto max-w-[1240px] px-8 pb-24 pt-9">
      <h1 className="font-display text-[clamp(40px,6vw,72px)] tracking-wide">
        SEU CARRINHO
      </h1>

      {items.length === 0 ? (
        <div className="border-t border-escuro/14 py-16 text-center">
          <p className="mb-6 font-body text-escuro/65">
            Seu carrinho está vazio.
          </p>
          <Link
            href="/"
            className="inline-block bg-verde-vivo px-9 py-3.5 font-display text-xl tracking-wide text-escuro"
          >
            VER A COLEÇÃO
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-[1.6fr_1fr] items-start gap-14 max-lg:grid-cols-1">
          <div className="flex flex-col divide-y divide-escuro/10 border-y border-escuro/14">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-5 py-6">
                <div className="aspect-[3/4] w-[100px] shrink-0">
                  <ProductImagePlaceholder />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <Link
                    href={`/produto/${item.slug}`}
                    className="font-body text-lg leading-tight text-escuro"
                  >
                    {item.name}
                  </Link>
                  <span className="font-ui text-[12.5px] text-escuro/60">
                    Tam. {item.size}
                    {item.color ? ` · ${item.color}` : ""}
                  </span>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center border border-escuro/25">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(item.variantId, item.quantity - 1)
                        }
                        className="h-8 w-8 cursor-pointer text-base"
                      >
                        −
                      </button>
                      <span className="w-7 text-center font-ui text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(item.variantId, item.quantity + 1)
                        }
                        className="h-8 w-8 cursor-pointer text-base"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="cursor-pointer font-ui text-[12px] text-terra underline"
                    >
                      Remover
                    </button>
                  </div>
                </div>
                <span className="font-ui text-base font-bold text-verde-mata">
                  {formatBRL(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <aside className="sticky top-24 bg-verde-mata p-7.5 text-creme">
            <h2 className="mb-5.5 font-display text-2xl tracking-wide">
              RESUMO
            </h2>
            <div className="flex justify-between border-b border-creme/20 pb-5 font-ui text-sm">
              <span className="text-creme/75">Subtotal</span>
              <span className="font-bold">{formatBRL(subtotal)}</span>
            </div>
            <p className="py-4 font-ui text-xs text-creme/70">
              {subtotal >= FREE_SHIPPING_THRESHOLD
                ? "Frete grátis liberado."
                : `Faltam ${formatBRL(FREE_SHIPPING_THRESHOLD - subtotal)} para frete grátis.`}{" "}
              Frete calculado no checkout.
            </p>
            <Link
              href="/checkout"
              className="block w-full bg-verde-vivo py-4.5 text-center font-display text-2xl tracking-wide text-escuro"
            >
              FINALIZAR COMPRA
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
