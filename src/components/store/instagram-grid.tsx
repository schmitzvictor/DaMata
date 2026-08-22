import Link from "next/link";
import { Reveal } from "@/components/store/reveal";

const TILES = [
  { tone: "from-verde-mata to-verde-folha", label: "Nova coleção" },
  { tone: "from-verde-folha to-verde-claro", label: "Ateliê" },
  { tone: "from-terra to-verde-mata", label: "Processo" },
  { tone: "from-verde-vivo to-verde-folha", label: "Trilha" },
  { tone: "from-verde-claro to-sol", label: "Detalhe" },
  { tone: "from-escuro to-verde-mata", label: "Mata" },
];

export function InstagramGrid() {
  return (
    <section className="bg-creme px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1400px]">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-verde-folha">
              @da.mata.grow
            </p>
            <h2 className="mt-4 font-display text-4xl md:text-6xl">
              Últimos posts
            </h2>
          </div>
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-verde-mata px-6 py-3 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-verde-mata transition-colors hover:bg-verde-mata hover:text-creme"
          >
            Seguir no Instagram <span aria-hidden>→</span>
          </Link>
        </Reveal>

        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {TILES.map((t, i) => (
            <Reveal
              as="li"
              key={t.label}
              delay={i * 80}
              className="group relative aspect-square overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-linear-to-br ${t.tone} transition-transform duration-700 group-hover:scale-[1.05]`}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-creme/90">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
                </svg>
                <span className="font-ui text-[10px] uppercase tracking-[0.18em]">
                  {t.label}
                </span>
              </div>
            </Reveal>
          ))}
        </ul>

        <p className="mt-8 text-center font-ui text-xs text-escuro/50">
          Em breve, feed ao vivo do Instagram.
        </p>
      </div>
    </section>
  );
}
