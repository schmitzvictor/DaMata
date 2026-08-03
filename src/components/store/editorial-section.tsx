import { ProductImagePlaceholder } from "./product-image-placeholder";
import type { Post } from "@/generated/prisma/client";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function EditorialSection({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-8 py-22">
      <div className="flex items-end justify-between gap-6 border-b border-escuro/12 pb-4">
        <h2 className="font-editorial text-4xl font-black text-escuro">
          Do ateliê
        </h2>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-9 pt-9">
        {posts.map((post) => (
          <article key={post.id} className="flex flex-col gap-3">
            <div className="relative aspect-[4/3] overflow-hidden">
              {post.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote domains not configured yet
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ProductImagePlaceholder label={post.title} />
              )}
            </div>
            <span className="font-ui text-[11px] uppercase tracking-wide text-escuro/55">
              {post.author} · {dateFormatter.format(post.date)}
            </span>
            <h3 className="font-body text-xl leading-snug text-escuro">
              {post.title}
            </h3>
            <p className="font-body text-[15px] leading-relaxed text-escuro/70">
              {post.excerpt}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
