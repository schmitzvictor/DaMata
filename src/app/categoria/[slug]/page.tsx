import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/queries/products";
import { ProductCard } from "@/components/store/product-card";

type Props = { params: Promise<{ slug: string }> };

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(category);

  return (
    <div className="mx-auto max-w-[1400px] px-8 pb-24 pt-7">
      <div className="flex gap-2 font-ui text-[11.5px] tracking-wide text-escuro/55">
        <Link href="/">Início</Link>
        <span>/</span>
        <span className="text-escuro">{category}</span>
      </div>

      <div className="my-6.5 flex flex-wrap items-end justify-between gap-8">
        <h1 className="font-display text-[clamp(44px,7vw,88px)] leading-[0.92] tracking-wide">
          {category.toUpperCase()}
        </h1>
        <span className="font-ui text-xs text-escuro/55">
          {products.length} {products.length === 1 ? "produto" : "produtos"}
        </span>
      </div>

      {products.length === 0 ? (
        <p className="border-t border-escuro/14 py-16 text-center font-body text-escuro/60">
          Nenhum produto nessa categoria ainda.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-x-7 gap-y-12 border-t border-escuro/14 pt-11">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
