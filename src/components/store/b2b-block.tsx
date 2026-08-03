import { WHATSAPP_LINK } from "@/lib/site-config";

export function B2BBlock() {
  return (
    <section className="bg-terra px-8 py-20">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-12">
        <div className="max-w-[60ch]">
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[3px] text-sol">
            Para times e coletivos
          </span>
          <h2 className="my-3.5 font-display text-[clamp(38px,5vw,68px)] leading-[0.95] tracking-wide text-creme">
            SEU TIME, SUA MARCA
          </h2>
          <p className="font-body text-lg leading-relaxed text-creme/90">
            Seu time já tem o visual? A trilha começa com a estampa certa.
            Orçamento em 24h pelo WhatsApp, a partir de 20 peças.
          </p>
        </div>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noreferrer"
          className="bg-sol px-11 py-[19px] text-center font-display text-2xl tracking-wide text-escuro"
        >
          PEDIR ORÇAMENTO
        </a>
      </div>
    </section>
  );
}
