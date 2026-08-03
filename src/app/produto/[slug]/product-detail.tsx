"use client";

import { useMemo, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProductImagePlaceholder } from "@/components/store/product-image-placeholder";
import { VariantSelector } from "@/components/store/variant-selector";
import { sizeOptionsFor } from "@/lib/variants";
import { useCart } from "@/lib/cart/cart-context";
import { formatBRL, formatInstallment } from "@/lib/format";
import type { ProductWithVariants } from "@/lib/queries/products";

export function ProductDetail({ product }: { product: ProductWithVariants }) {
  const [activeImage, setActiveImage] = useState(0);
  const options = useMemo(
    () => sizeOptionsFor(product.variants),
    [product.variants],
  );
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null,
  );
  const { addItem } = useCart();

  const selectedOption = options.find((o) => o.variantId === selectedVariantId);
  const hasImages = product.images.length > 0;

  const stockNote = !selectedOption
    ? "Escolha um tamanho."
    : selectedOption.stock === 0
      ? "Esgotado — avise-me quando voltar."
      : `${selectedOption.stock <= 6 ? "Últimas " : ""}${selectedOption.stock} peça${selectedOption.stock === 1 ? "" : "s"} no tamanho ${selectedOption.size}.`;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(360px,1fr))] items-start gap-16 pt-8">
      <div className="flex min-w-0 items-start gap-4">
        {hasImages && product.images.length > 1 ? (
          <div className="flex w-[84px] shrink-0 flex-col gap-3">
            {product.images.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`aspect-[3/4] cursor-pointer border-2 bg-cover bg-center ${
                  activeImage === i ? "border-verde-vivo" : "border-transparent"
                }`}
                style={{ backgroundImage: `url(${img})` }}
              />
            ))}
          </div>
        ) : null}

        <div className="relative aspect-[4/5] min-w-0 flex-1 overflow-hidden">
          {hasImages ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote domains not configured yet
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <ProductImagePlaceholder label={product.name} />
          )}
        </div>
      </div>

      <div className="min-w-0">
        <span className="font-ui text-[10.5px] font-semibold uppercase tracking-[2px] text-terra">
          {product.category}
        </span>
        <h1 className="my-3.5 font-display text-[clamp(38px,4.6vw,60px)] leading-[0.95] tracking-wide">
          {product.name.toUpperCase()}
        </h1>

        <div className="flex items-baseline gap-3.5">
          <span className="font-ui text-[34px] font-bold text-verde-mata">
            {formatBRL(product.price)}
          </span>
        </div>
        <span className="mt-2 block font-ui text-[13px] text-escuro/65">
          {formatInstallment(product.price)}
        </span>

        <div className="mt-8.5">
          <div className="flex items-baseline justify-between">
            <span className="font-ui text-[11.5px] font-semibold uppercase tracking-wide">
              Tamanho{selectedOption ? `: ${selectedOption.size}` : ""}
            </span>
          </div>
          <div className="mt-3.5">
            <VariantSelector
              variants={product.variants}
              selectedVariantId={selectedVariantId}
              onSelect={(opt) => setSelectedVariantId(opt.variantId)}
            />
          </div>
          <span className="mt-2.5 block font-ui text-[11.5px] text-terra">
            {stockNote}
          </span>
        </div>

        <div className="mt-7.5 flex flex-wrap gap-3">
          <Button
            size="lg"
            disabled={!selectedOption || selectedOption.stock === 0}
            onClick={() =>
              selectedOption &&
              addItem({
                variantId: selectedOption.variantId,
                productId: product.id,
                slug: product.slug,
                name: product.name,
                size: selectedOption.size,
                color: null,
                price: product.price,
                image: product.images[0] ?? null,
              })
            }
            className="h-auto flex-1 basis-[260px] rounded-none bg-verde-vivo py-[19px] font-display text-2xl tracking-wide text-escuro hover:bg-verde-vivo/90"
          >
            ADICIONAR AO CARRINHO
          </Button>
        </div>

        <div className="mt-6.5 flex items-center gap-4 bg-verde-mata p-4.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-verde-claro text-verde-claro">
            ✓
          </div>
          <div>
            <span className="block font-ui text-[11.5px] font-bold uppercase tracking-wide text-sol">
              Selo de serigrafia autoral
            </span>
            <span className="mt-1 block font-body text-[14.5px] leading-snug text-creme/85">
              Estampa chapada à mão no ateliê, tinta base água, cura
              controlada. Peça numerada.
            </span>
          </div>
        </div>

        <Tabs defaultValue="desc" className="mt-8.5 border-t border-escuro/14">
          <TabsList className="h-auto justify-start gap-0 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="desc"
              className="rounded-none border-b-2 border-transparent px-5 py-4 font-ui text-[11.5px] font-semibold uppercase tracking-wide data-[state=active]:border-verde-vivo data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Descrição
            </TabsTrigger>
            <TabsTrigger
              value="spec"
              className="rounded-none border-b-2 border-transparent px-5 py-4 font-ui text-[11.5px] font-semibold uppercase tracking-wide data-[state=active]:border-verde-vivo data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Ficha técnica
            </TabsTrigger>
            <TabsTrigger
              value="ship"
              className="rounded-none border-b-2 border-transparent px-5 py-4 font-ui text-[11.5px] font-semibold uppercase tracking-wide data-[state=active]:border-verde-vivo data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Entrega e trocas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="desc" className="pt-5.5">
            <p className="font-body text-[16.5px] leading-loose text-escuro/82">
              {product.description ?? "Sem descrição cadastrada ainda."}
            </p>
          </TabsContent>

          <TabsContent value="spec" className="pt-5.5">
            <dl className="flex flex-col">
              {[
                ["Categoria", product.category],
                [
                  "Peso",
                  product.weightGrams ? `${product.weightGrams} g` : "—",
                ],
                ["Tamanhos", options.map((o) => o.size).join(", ") || "—"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-6 border-b border-escuro/10 py-3"
                >
                  <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-escuro/55">
                    {k}
                  </dt>
                  <dd className="font-ui text-[13.5px]">{v}</dd>
                </div>
              ))}
            </dl>
          </TabsContent>

          <TabsContent value="ship" className="pt-5.5">
            <p className="font-body text-[16.5px] leading-loose text-escuro/82">
              Frete grátis acima de R$ 299. Trocas em até 30 dias, sem custo
              na primeira troca. Peças chapadas sob demanda saem do ateliê em
              até 3 dias úteis.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
