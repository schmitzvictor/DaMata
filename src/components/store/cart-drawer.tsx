"use client";

import Link from "next/link";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useCart } from "@/lib/cart/cart-context";
import { formatBRL } from "@/lib/format";
import { ProductImagePlaceholder } from "./product-image-placeholder";

const FREE_SHIPPING_THRESHOLD = 299;

export function CartDrawer() {
  const { items, isOpen, openCart, closeCart, subtotal, setQuantity, removeItem } =
    useCart();

  const freeShipNote =
    subtotal >= FREE_SHIPPING_THRESHOLD
      ? "Frete grátis liberado. Boa trilha."
      : `Faltam ${formatBRL(FREE_SHIPPING_THRESHOLD - subtotal)} para frete grátis.`;

  return (
    <Drawer
      direction="right"
      open={isOpen}
      onOpenChange={(open) => (open ? openCart() : closeCart())}
    >
      <DrawerContent className="!w-[min(440px,100%)] gap-0 rounded-none border-none bg-creme p-0">
        <div className="flex items-center justify-between bg-verde-mata px-6 py-5 text-creme">
          <DrawerTitle asChild>
            <span className="font-display text-2xl tracking-wide">
              SEU CARRINHO ({items.reduce((n, i) => n + i.quantity, 0)})
            </span>
          </DrawerTitle>
        </div>

        <div className="bg-verde-claro px-6 py-3.5 font-ui text-xs font-semibold text-escuro">
          {freeShipNote}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <p className="font-body text-sm text-escuro/60">
              Seu carrinho está vazio.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4">
                  <div className="aspect-[3/4] w-[84px] shrink-0">
                    <ProductImagePlaceholder />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="font-body text-[15.5px] leading-tight">
                      {item.name}
                    </span>
                    <span className="font-ui text-[11.5px] text-escuro/60">
                      Tam. {item.size}
                      {item.color ? ` · ${item.color}` : ""}
                    </span>
                    <div className="mt-1.5 flex items-center gap-3.5">
                      <div className="flex items-center border border-escuro/25">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.variantId, item.quantity - 1)
                          }
                          className="h-[30px] w-[30px] cursor-pointer text-[15px]"
                        >
                          −
                        </button>
                        <span className="w-[26px] text-center font-ui text-[13px] font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.variantId, item.quantity + 1)
                          }
                          className="h-[30px] w-[30px] cursor-pointer text-[15px]"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="cursor-pointer font-ui text-[11.5px] text-terra underline"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                  <span className="font-ui text-[15px] font-bold text-verde-mata">
                    {formatBRL(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-escuro/10 bg-[#EFE9DD] px-6 py-5">
          <div className="mb-3.5 flex items-baseline justify-between">
            <span className="font-ui text-xs uppercase tracking-wide text-escuro/60">
              Subtotal
            </span>
            <span className="font-ui text-2xl font-bold text-verde-mata">
              {formatBRL(subtotal)}
            </span>
          </div>
          <Link
            href="/checkout"
            onClick={closeCart}
            className="block w-full bg-verde-vivo py-[18px] text-center font-display text-2xl tracking-wide text-escuro"
          >
            FINALIZAR COMPRA
          </Link>
          <span className="mt-3 block text-center font-ui text-[11.5px] text-escuro/55">
            ou 3x sem juros no cartão
          </span>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
