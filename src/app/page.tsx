import Link from "next/link";
import { getBestSellers, getLaunches } from "@/lib/queries/products";
import { getRecentPosts } from "@/lib/queries/posts";
import { ProductCard } from "@/components/store/product-card";
import { PerksBar } from "@/components/store/perks-bar";
import { B2BBlock } from "@/components/store/b2b-block";
import { EditorialSection } from "@/components/store/editorial-section";
import { getContentValue, getSiteContent, parsePairs } from "@/lib/site-content";

export default async function Home() {
  const [bestSellers, launches, posts, content] = await Promise.all([
    getBestSellers(5),
    getLaunches(4),
    getRecentPosts(3),
    getSiteContent(),
  ]);
  const c = (key: string) => getContentValue(content, key);
  const stats = parsePairs(c("home.process.stats"));

  return (
    <div>
      <section className="relative flex min-h-[82vh] items-end overflow-hidden bg-[repeating-linear-gradient(150deg,#25400F_0_22px,#2D5016_22px_44px)]">
        <div className="absolute inset-0 bg-linear-to-t from-escuro/88 via-escuro/25 to-escuro/45" />
        <div className="relative mx-auto w-full max-w-[1400px] px-8 pb-24">
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[3px] text-verde-claro">
            {c("home.hero.eyebrow")}
          </span>
          <h1 className="mt-4.5 max-w-[16ch] font-display text-[clamp(56px,9vw,132px)] leading-[0.9] tracking-wide text-creme">
            {c("home.hero.heading")}
          </h1>
          <p className="my-5 max-w-[52ch] font-body text-lg leading-relaxed text-creme/85">
            {c("home.hero.subtext")}
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Link
              href="/categoria/camisetas"
              className="bg-verde-vivo px-9 py-4 font-display text-[22px] tracking-wide text-escuro"
            >
              {c("home.hero.cta")}
            </Link>
          </div>
        </div>
      </section>

      <PerksBar />

      {bestSellers.length > 0 ? (
        <section className="mx-auto max-w-[1400px] px-8 pt-22">
          <div className="flex items-end justify-between gap-6 border-b border-escuro/12 pb-4">
            <h2 className="font-display text-[58px] tracking-wide">
              {c("home.bestsellers.heading")}
            </h2>
          </div>
          <div className="flex gap-6.5 overflow-x-auto py-8">
            {bestSellers.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                quickBuyButton
                className="w-[300px] shrink-0"
              />
            ))}
          </div>
        </section>
      ) : null}

      {launches.length > 0 ? (
        <section className="mx-auto max-w-[1400px] px-8 py-22">
          <div className="flex items-end justify-between gap-6 border-b border-escuro/12 pb-4">
            <h2 className="font-display text-[58px] tracking-wide">
              {c("home.launches.heading")}
            </h2>
            <span className="font-body text-base italic text-escuro/60">
              {c("home.launches.subtext")}
            </span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-9 pt-9">
            {launches.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <B2BBlock />

      <section className="mt-22 bg-verde-mata px-8 py-24">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 items-center gap-18 max-lg:grid-cols-1">
          <div>
            <span className="font-ui text-[11px] font-semibold uppercase tracking-[3px] text-verde-claro">
              {c("home.process.eyebrow")}
            </span>
            <h2 className="my-5 font-editorial text-[clamp(34px,4.4vw,58px)] font-black leading-tight text-creme">
              {c("home.process.heading")}
            </h2>
            <p className="mb-4.5 font-body text-lg leading-loose text-creme/85">
              {c("home.process.paragraph")}
            </p>
            <p className="mb-7.5 font-body text-lg italic leading-loose text-verde-claro">
              &quot;{c("home.process.quote")}&quot;
            </p>
            <div className="flex flex-wrap gap-11">
              {stats.map(([n, label]) => (
                <div key={label}>
                  <span className="block font-display text-5xl leading-none text-sol">
                    {n}
                  </span>
                  <span className="font-ui text-[11px] uppercase tracking-wide text-creme/70">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex aspect-[4/5] items-end bg-[repeating-linear-gradient(135deg,#3C6725_0_14px,#446F29_14px_28px)] p-4" />
        </div>
      </section>

      <EditorialSection posts={posts} />
    </div>
  );
}
