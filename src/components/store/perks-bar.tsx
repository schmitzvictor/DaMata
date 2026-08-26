import { getContentValue, getSiteContent, parsePairs } from "@/lib/site-content";

const ICONS = ["▲", "◈", "⬒", "⟳"];

export async function PerksBar() {
  const content = await getSiteContent();
  const perks = parsePairs(getContentValue(content, "home.perks"));

  const perkItem = (title: string, sub: string, i: number, key: string) => (
    <div key={key} className="flex shrink-0 items-center gap-3.5">
      <span className="w-[26px] text-center text-xl text-verde-claro">
        {ICONS[i % ICONS.length]}
      </span>
      <div className="flex flex-col whitespace-nowrap">
        <span className="font-ui text-[12.5px] font-bold uppercase tracking-wide text-creme">
          {title}
        </span>
        <span className="font-ui text-[11.5px] text-creme/60">{sub}</span>
      </div>
    </div>
  );

  return (
    <section className="overflow-hidden bg-escuro py-6">
      <div className="mx-auto hidden max-w-[1400px] grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-7 px-8 md:grid">
        {perks.map(([title, sub], i) => perkItem(title, sub, i, title))}
      </div>

      <div className="animate-marquee flex w-max gap-14 md:hidden">
        {[...perks, ...perks].map(([title, sub], i) =>
          perkItem(title, sub, i, `${title}-${i}`),
        )}
      </div>
    </section>
  );
}
