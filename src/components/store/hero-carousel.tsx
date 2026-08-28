"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SLIDE_DURATION_MS = 5000;

export type HeroSlide = { src: string; href: string };

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;

  function go(delta: number) {
    setIndex((i) => (i + delta + slides.length) % slides.length);
  }

  return (
    <div className="absolute inset-0">
      {slides.map((slide, i) => (
        // Cada slide leva pra uma página diferente (categoria/promo) — o
        // slide inteiro é clicável, não só um botão por cima.
        <Link
          key={slide.src}
          href={slide.href}
          aria-hidden={i !== index}
          tabIndex={i === index ? 0 : -1}
          style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
          className="absolute inset-0 transition-opacity duration-1000"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- remote domains not configured yet */}
          <img src={slide.src} alt="" className="h-full w-full object-cover" />
        </Link>
      ))}

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Slide anterior"
            className="absolute left-4 top-1/2 z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-creme/85 text-2xl leading-none text-escuro shadow-md transition hover:bg-creme"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Próximo slide"
            className="absolute right-4 top-1/2 z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-creme/85 text-2xl leading-none text-escuro shadow-md transition hover:bg-creme"
          >
            ›
          </button>
          <div className="absolute bottom-8 right-8 z-10 flex gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ir para o slide ${i + 1}`}
                className={`size-2 rounded-full transition ${
                  i === index ? "bg-creme" : "bg-creme/40"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
