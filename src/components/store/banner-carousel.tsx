"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

export type BannerSlide = {
  src: string;
  alt: string;
  title?: string;
  cta?: string;
  href?: string;
};

export function BannerCarousel({ slides }: { slides: BannerSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback(
    (n: number) => setIndex((i) => (n + count) % count),
    [count],
  );
  const next = useCallback(() => go(1), [go]);
  const prev = useCallback(() => go(-1), [go]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = setInterval(next, 5500);
    return () => clearInterval(id);
  }, [paused, next, count]);

  if (count === 0) return null;

  return (
    <section
      className="relative h-[72vh] min-h-[460px] w-full overflow-hidden bg-verde-mata"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
        touchX.current = null;
      }}
    >
      {slides.map((s, i) => (
        <div
          key={s.src}
          aria-hidden={i !== index}
          className="absolute inset-0 transition-opacity duration-[1100ms] ease-out"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- local brand assets */}
          <img src={s.src} alt={s.alt} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-escuro/70 via-escuro/15 to-escuro/30" />
          {i === index && (s.title || s.cta) ? (
            <div className="absolute inset-0 flex items-end">
              <div className="mx-auto w-full max-w-[1400px] px-5 pb-16 md:px-10 md:pb-24">
                {s.title ? (
                  <h1 className="max-w-2xl font-display text-4xl leading-[1.05] text-creme md:text-7xl">
                    {s.title}
                  </h1>
                ) : null}
                {s.cta && s.href ? (
                  <Link
                    href={s.href}
                    className="mt-6 inline-flex items-center gap-2 bg-creme px-7 py-3 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-escuro transition-colors hover:bg-sol"
                  >
                    {s.cta}
                    <span aria-hidden>→</span>
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ))}

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Slide anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-creme/15 text-2xl text-creme backdrop-blur transition-colors hover:bg-creme/30 md:left-8"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Próximo slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-creme/15 text-2xl text-creme backdrop-blur transition-colors hover:bg-creme/30 md:right-8"
          >
            ›
          </button>
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ir para o slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-creme" : "w-2 bg-creme/45"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
