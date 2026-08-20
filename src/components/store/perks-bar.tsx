import { getContentValue, getSiteContent, parsePairs } from "@/lib/site-content";

const ICONS = ["▲", "◈", "⬒", "⟳"];

export async function PerksBar() {
  const content = await getSiteContent();
  const perks = parsePairs(getContentValue(content, "home.perks"));

  return (
    <section className="bg-escuro px-8 py-6">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-7">
        {perks.map(([title, sub], i) => (
          <div key={title} className="flex items-center gap-3.5">
            <span className="w-[26px] text-center text-xl text-verde-claro">
              {ICONS[i % ICONS.length]}
            </span>
            <div className="flex flex-col">
              <span className="font-ui text-[12.5px] font-bold uppercase tracking-wide text-creme">
                {title}
              </span>
              <span className="font-ui text-[11.5px] text-creme/60">{sub}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
