"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import type { CategoryLink } from "@/lib/queries/products";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 px-4 py-4 md:gap-8 md:px-8 md:py-4.5">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir menu"
          className="-ml-2 p-2 text-2xl leading-none md:hidden"
        >
          ☰
        </button>

        <Link href="/" className="flex flex-col leading-[0.86]">
          <span className="font-display text-[24px] tracking-[1.5px] md:text-[34px] md:tracking-[2.5px]">
            Da Mata
          </span>
          <span className="font-display text-[24px] tracking-[3.5px] text-verde-claro md:text-[34px] md:tracking-[6px]">
            grow
          </span>
        </Link>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="order-2 flex w-full items-center gap-2.5 bg-creme px-3.5 py-2.5 md:order-none md:w-auto md:max-w-[520px] md:flex-1"
        >
          <span className="text-[13px] text-verde-folha">⚲</span>
          <input
            placeholder={searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent font-ui text-[13.5px] text-escuro outline-none"
          />
        </form>

        <div className="order-1 ml-auto flex items-center gap-6.5 font-ui text-xs font-medium tracking-wide md:order-none">
          <button
            type="button"
            onClick={openCart}
            className="flex cursor-pointer items-center gap-2 uppercase"
          >
            <span className="hidden sm:inline">Carrinho</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-verde-vivo px-1 font-bold text-escuro">
              {totalCount}
            </span>
          </button>
        </div>
      </div>

      <nav className="mx-auto hidden max-w-[1400px] gap-8.5 px-8 pb-3.5 font-ui text-[12.5px] font-semibold uppercase tracking-wide md:flex">
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
        <Link
          href="/serigrafia"
          className="cursor-pointer border-b-2 border-transparent pb-1.5 text-creme transition-colors hover:text-verde-claro"
        >
          Serigrafia
        </Link>
        <Link
          href="/sobre"
          className="cursor-pointer border-b-2 border-transparent pb-1.5 text-creme transition-colors hover:text-verde-claro"
        >
          Sobre nós
        </Link>
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

      <Drawer direction="left" open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DrawerContent className="!w-[min(320px,85%)] gap-0 rounded-none border-none bg-verde-mata p-0 text-creme">
          <DrawerTitle asChild>
            <div className="border-b border-creme/15 px-6 py-5 font-display text-2xl tracking-wide">
              MENU
            </div>
          </DrawerTitle>
          <nav className="flex flex-col p-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/categoria/${c.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="border-b border-creme/10 px-4 py-4 font-ui text-sm font-semibold uppercase tracking-wide"
              >
                {c.label}
              </Link>
            ))}
            <Link
              href="/serigrafia"
              onClick={() => setMobileMenuOpen(false)}
              className="border-b border-creme/10 px-4 py-4 font-ui text-sm font-semibold uppercase tracking-wide"
            >
              Serigrafia
            </Link>
            <Link
              href="/sobre"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-4 font-ui text-sm font-semibold uppercase tracking-wide"
            >
              Sobre nós
            </Link>
          </nav>
        </DrawerContent>
      </Drawer>
    </header>
  );
}
