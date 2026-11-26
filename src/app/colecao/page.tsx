import type { Metadata } from "next";
import Link from "next/link";
import { searchProducts } from "@/lib/queries/products";
import { ProductCard } from "@/components/store/product-card";

export const metadata: Metadata = { title: "Coleção | Da Mata Grow" };

type Props = { searchParams: Promise<{ q?: string | string[] }> };

// Coleção inteira e resultado de busca na mesma rota: sem ?q= lista tudo.
export default async function CollectionPage({ searchParams }: Props) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 80) ?? "";
  const products = await searchProducts(q);

  return (
    <div className="mx-auto max-w-[1400px] px-8 pb-24 pt-9">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-6">
        <h1 className="font-display text-[clamp(36px,6vw,72px)] leading-[0.95] tracking-wide">
          {q ? `BUSCA: ${q.toUpperCase()}` : "TODA A COLEÇÃO"}
        </h1>
        <span className="font-ui text-xs text-escuro/55">
          {products.length} {products.length === 1 ? "produto" : "produtos"}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="border-t border-escuro/14 py-16 text-center">
          <p className="font-body text-escuro/60">
            {q ? "Nada encontrado para essa busca." : "Nenhum produto disponível ainda."}
          </p>
          {q ? (
            <Link href="/colecao" className="mt-5 inline-block font-ui text-sm underline">
              Ver toda a coleção
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-7 gap-y-12 border-t border-escuro/14 pt-11">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
