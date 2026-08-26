import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";
import { ProductCard } from "@/components/store/product-card";
import { slugify } from "@/lib/slug";
import { ProductDetail } from "./product-detail";
import { ProductViewTracker } from "@/components/store/product-view-tracker";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category, product.slug);

  return (
    <div className="mx-auto max-w-[1400px] px-8 pb-24 pt-7">
      <div className="flex gap-2 font-ui text-[11.5px] text-escuro/55">
        <Link href="/">Início</Link>
        <span>/</span>
        <Link href={`/categoria/${slugify(product.category)}`}>
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-escuro">{product.name}</span>
      </div>

      <ProductViewTracker productId={product.id} />
      <ProductDetail product={product} />

      {related.length > 0 ? (
        <section className="pt-22">
          <h2 className="mb-2 font-display text-5xl tracking-wide">
            QUEM SUBIU A MESMA TRILHA
          </h2>
          <div className="flex gap-6.5 overflow-x-auto py-6.5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} className="w-[260px] shrink-0" />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
