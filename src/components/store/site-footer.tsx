import Link from "next/link";
import { slugify } from "@/lib/slug";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY } from "@/lib/site-config";

const STORE_LINKS = ["Camisetas", "Moletons", "Jaquetas", "Acessórios"];

const FOOTER_COLS = [
  { title: "Loja", links: STORE_LINKS },
  {
    title: "Institucional",
    links: [
      "Nossa história",
      "O processo",
      "Guia de medidas",
      "Trocas e devoluções",
      "Política de privacidade",
    ],
  },
  {
    title: "Atendimento",
    links: [`WhatsApp ${WHATSAPP_DISPLAY}`, CONTACT_EMAIL, "Seg a sex, 9h às 18h", "B2B e times"],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-0 bg-escuro px-8 pb-8 pt-18 text-creme">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[1.4fr_1fr_1fr_1fr] gap-11 max-md:grid-cols-1">
        <div>
          <div className="mb-4 flex flex-col leading-[0.86]">
            <span className="font-display text-3xl tracking-wide">DA MATA</span>
            <span className="font-display text-3xl tracking-[5px] text-verde-claro">
              GROW
            </span>
          </div>
          <p className="max-w-[36ch] font-body text-[15px] leading-relaxed text-creme/70">
            Serigrafia autoral e roupa de trilha, feitas à mão em
            Florianópolis desde 2019.
          </p>
          <div className="mt-5 flex gap-3.5 font-ui text-[11.5px] uppercase tracking-wide text-verde-claro">
            <span>Instagram</span>
            <span>TikTok</span>
            <span>YouTube</span>
          </div>
        </div>

        {FOOTER_COLS.map((col) => (
          <div key={col.title} className="flex flex-col gap-2.5">
            <span className="mb-1 font-ui text-[10.5px] font-bold uppercase tracking-[2px] text-sol">
              {col.title}
            </span>
            {col.links.map((label) =>
              col.title === "Loja" ? (
                <Link
                  key={label}
                  href={`/categoria/${slugify(label)}`}
                  className="font-ui text-[13.5px] text-creme/75 hover:text-verde-claro"
                >
                  {label}
                </Link>
              ) : (
                <span key={label} className="font-ui text-[13.5px] text-creme/75">
                  {label}
                </span>
              ),
            )}
          </div>
        ))}
      </div>
      <div className="mx-auto mt-11 flex max-w-[1400px] flex-wrap justify-between gap-5 border-t border-creme/15 pt-5 font-ui text-[11.5px] text-creme/50">
        <span>© 2026 Da Mata Grow · CNPJ 00.000.000/0001-00</span>
        <span>Feito à mão, na mata.</span>
      </div>
    </footer>
  );
}
