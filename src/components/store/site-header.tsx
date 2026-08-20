"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import type { CategoryLink } from "@/lib/queries/products";

const MENU_CLOSE_DELAY_MS = 250;

// De propósito, não tem link pro admin aqui — /admin só é acessível pra
// quem já sabe a URL (login próprio em /login, protegido por lockout de
// tentativas em src/auth.ts). Não expor esse caminho reduz superfície de
// descoberta por quem só está navegando a loja.
export function SiteHeader({
  categories,
  searchPlaceholder,
}: {
  categories: CategoryLink[];
  searchPlaceholder: string;
}) {
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { totalCount, openCart } = useCart();

  function openMenu(slug: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(slug);
  }

  // Delay pra dar tempo do mouse atravessar o espaço entre o item do menu e
  // o painel do submenu sem fechar no meio do caminho.
  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(null), MENU_CLOSE_DELAY_MS);
  }

  return (
    <header className="relative z-[60] border-b border-creme/18 bg-verde-mata text-creme">
      <div className="mx-auto flex max-w-[1400px] items-center gap-8 px-8 py-4.5">
        <Link href="/" className="flex flex-col leading-[0.86]">
          <span className="font-display text-[34px] tracking-[2.5px]">DA MATA</span>
          <span className="font-display text-[34px] tracking-[6px] text-verde-claro">
            GROW
          </span>
        </Link>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex max-w-[520px] flex-1 items-center gap-2.5 bg-creme px-3.5 py-2.5"
        >
          <span className="text-[13px] text-verde-folha">⚲</span>
          <input
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent font-ui text-[13.5px] text-escuro outline-none"
          />
        </form>

        <div className="ml-auto flex items-center gap-6.5 font-ui text-xs font-medium tracking-wide">
          <button
            type="button"
            onClick={openCart}
            className="flex cursor-pointer items-center gap-2 uppercase"
          >
            Carrinho
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-verde-vivo px-1 font-bold text-escuro">
              {totalCount}
            </span>
          </button>
        </div>
      </div>

      <nav className="mx-auto flex max-w-[1400px] gap-8.5 px-8 pb-3.5 font-ui text-[12.5px] font-semibold uppercase tracking-wide">
        {categories.map((c) => (
          <div
            key={c.slug}
            onMouseEnter={() => openMenu(c.slug)}
            onMouseLeave={scheduleClose}
          >
            <Link
              href={`/categoria/${c.slug}`}
              className={`cursor-pointer border-b-2 pb-1.5 ${
                megaOpen === c.slug ? "border-verde-claro text-verde-claro" : "border-transparent text-creme"
              }`}
            >
              {c.label}
            </Link>
          </div>
        ))}
      </nav>

      {megaOpen ? (
        <div
          onMouseEnter={() => openMenu(megaOpen)}
          onMouseLeave={scheduleClose}
          className="animate-in fade-in absolute inset-x-0 top-full border-b-[3px] border-verde-vivo bg-creme text-escuro shadow-[0_24px_40px_rgba(27,27,22,0.18)] duration-150"
        >
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-8 px-8 py-9">
            <span className="font-body text-lg">
              Ver tudo em{" "}
              <strong className="font-semibold">
                {categories.find((c) => c.slug === megaOpen)?.label}
              </strong>
            </span>
            <Link
              href={`/categoria/${megaOpen}`}
              className="bg-verde-mata px-6 py-3 font-ui text-[11px] font-semibold uppercase tracking-wide text-creme"
            >
              Ver categoria →
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
