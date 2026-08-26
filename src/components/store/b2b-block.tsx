import { WHATSAPP_LINK } from "@/lib/site-config";
import { getContentValue, getSiteContent } from "@/lib/site-content";

export async function B2BBlock() {
  const content = await getSiteContent();
  const c = (key: string) => getContentValue(content, key);

  return (
    <section className="bg-terra px-8 py-20">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-12">
        <div className="max-w-[60ch]">
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[3px] text-sol">
            {c("home.b2b.eyebrow")}
          </span>
          <h2 className="my-3.5 font-display text-[clamp(38px,5vw,68px)] leading-[0.95] tracking-wide text-creme">
            {c("home.b2b.heading")}
          </h2>
          <p className="font-body text-lg leading-relaxed text-creme/90">
            {c("home.b2b.paragraph")}
          </p>
        </div>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noreferrer"
          data-track="b2b_cta"
          className="bg-sol px-11 py-[19px] text-center font-display text-2xl tracking-wide text-escuro"
        >
          {c("home.b2b.cta")}
        </a>
      </div>
    </section>
  );
}
