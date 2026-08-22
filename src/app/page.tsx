import Link from "next/link";
import { getBestSellers, getLaunches } from "@/lib/queries/products";
import { ProductCard } from "@/components/store/product-card";
import { PerksBar } from "@/components/store/perks-bar";
import { B2BBlock } from "@/components/store/b2b-block";
import {
  BannerCarousel,
  type BannerSlide,
} from "@/components/store/banner-carousel";
import { InstagramGrid } from "@/components/store/instagram-grid";
import { Reveal } from "@/components/store/reveal";
import { getContentValue, getSiteContent } from "@/lib/site-content";

export default async function Home() {
  const [bestSellers, launches, content] = await Promise.all([
    getBestSellers(5),
    getLaunches(4),
    getSiteContent(),
  ]);
  const c = (key: string) => getContentValue(content, key);

  const slides: BannerSlide[] = [
    {
      src: "/banner-1.jpg",
      alt: "Estampa botânica impressa à mão em tecido natural",
      title: c("home.hero.heading"),
      cta: c("home.hero.cta"),
      href: "/categoria/camisetas",
    },
    {
      src: "/banner-2.jpg",
      alt: "Peças de linho com estampa de folhagem dobradas no ateliê",
      title: c("home.hero.eyebrow"),
    },
    {
      src: "/banner-3.jpg",
      alt: "Modelo vestindo camiseta com estampa de floresta",
      title: "Feito à mão, na mata.",
      cta: "Ver serigrafia",
      href: "/serigrafia",
    },
  ];

  return (
    <div>
      <BannerCarousel slides={slides} />

      <PerksBar />

      <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-10">
        <Reveal className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.28em] text-verde-folha">
            {c("home.hero.eyebrow")}
          </p>
          <p className="mt-6 font-display text-3xl leading-snug md:text-5xl">
            {c("home.hero.subtext")}
          </p>
        </Reveal>
      </section>

      {bestSellers.length > 0 ? (
        <section className="mx-auto max-w-[1400px] px-5 pb-20 md:px-10">
          <Reveal>
            <div className="flex items-end justify-between gap-6 border-b border-escuro/12 pb-4">
              <h2 className="font-heading text-4xl md:text-5xl">
                {c("home.bestsellers.heading")}
              </h2>
            </div>
          </Reveal>
          <div className="flex gap-6.5 overflow-x-auto py-8">
            {bestSellers.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                className="w-[300px] shrink-0"
              />
            ))}
          </div>
        </section>
      ) : null}

      {launches.length > 0 ? (
        <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10">
          <Reveal>
            <div className="flex items-end justify-between gap-6 border-b border-escuro/12 pb-4">
              <h2 className="font-heading text-4xl md:text-5xl">
                {c("home.launches.heading")}
              </h2>
              <span className="font-body text-base italic text-escuro/60">
                {c("home.launches.subtext")}
              </span>
            </div>
          </Reveal>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-9 pt-9">
            {launches.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-[1400px] gap-10 px-5 pb-24 md:grid-cols-12 md:px-10">
        <Reveal rotate={-1.5} className="md:col-span-7">
          <Link href="/serigrafia" className="group block overflow-hidden">
            <div className="aspect-[4/5] overflow-hidden bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element -- local brand asset */}
              <img
                src="/serigrafia.jpg"
                alt="Telas de serigrafia e potes de tinta terracota e verde sobre bancada de madeira"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
            <h2 className="mt-6 text-4xl md:text-5xl">Serigrafia</h2>
            <p className="mt-3 max-w-md text-escuro/70">
              O processo camada por camada: gravação da tela, mistura das tintas e
              a impressão manual de cada peça.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm uppercase tracking-[0.14em] text-verde-mata">
              ver o processo <span aria-hidden>→</span>
            </span>
          </Link>
        </Reveal>

        <Reveal rotate={1.5} delay={140} className="md:col-span-5 md:pt-24">
          <Link href="/sobre" className="group block overflow-hidden">
            <div className="aspect-[4/5] overflow-hidden bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element -- local brand asset */}
              <img
                src="/atelier.jpg"
                alt="Duas artesãs conferindo um tecido estampado no ateliê cheio de plantas"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
            <h2 className="mt-6 text-4xl md:text-5xl">Sobre nós</h2>
            <p className="mt-3 text-escuro/70">
              Duas mãos, um ateliê pequeno e a mata como referência de forma e cor.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm uppercase tracking-[0.14em] text-verde-mata">
              nossa história <span aria-hidden>→</span>
            </span>
          </Link>
        </Reveal>
      </section>

      <B2BBlock />

      <InstagramGrid />
    </div>
  );
}
