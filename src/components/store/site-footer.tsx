import Link from "next/link";
import { slugify } from "@/lib/slug";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY } from "@/lib/site-config";

const STORE_LINKS = ["Camisetas", "Moletons", "Jaquetas", "Acessórios"];

// Só "Trocas e devoluções" e "Política de privacidade" têm página própria
// por enquanto — as demais entradas de "Institucional" ficam como texto
// solto até existir conteúdo pra elas.
const INSTITUTIONAL_LINKS: { label: string; href?: string }[] = [
  { label: "Nossa história" },
  { label: "O processo" },
  { label: "Guia de medidas" },
  { label: "Trocas e devoluções", href: "/trocas-e-devolucoes" },
  { label: "Política de privacidade", href: "/politica-de-privacidade" },
];

const ATENDIMENTO_LINKS = [
  `WhatsApp ${WHATSAPP_DISPLAY}`,
  CONTACT_EMAIL,
  "Seg a sex, 9h às 18h",
  "B2B e times",
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

        <div className="flex flex-col gap-2.5">
          <span className="mb-1 font-ui text-[10.5px] font-bold uppercase tracking-[2px] text-sol">
            Loja
          </span>
          {STORE_LINKS.map((label) => (
            <Link
              key={label}
              href={`/categoria/${slugify(label)}`}
              className="font-ui text-[13.5px] text-creme/75 hover:text-verde-claro"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="mb-1 font-ui text-[10.5px] font-bold uppercase tracking-[2px] text-sol">
            Institucional
          </span>
          {INSTITUTIONAL_LINKS.map(({ label, href }) =>
            href ? (
              <Link
                key={label}
                href={href}
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

        <div className="flex flex-col gap-2.5">
          <span className="mb-1 font-ui text-[10.5px] font-bold uppercase tracking-[2px] text-sol">
            Atendimento
          </span>
          {ATENDIMENTO_LINKS.map((label) => (
            <span key={label} className="font-ui text-[13.5px] text-creme/75">
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-11 flex max-w-[1400px] flex-wrap justify-between gap-5 border-t border-creme/15 pt-5 font-ui text-[11.5px] text-creme/50">
        <span>© 2026 Da Mata Grow · CNPJ 00.000.000/0001-00</span>
        <span>Feito à mão, na mata.</span>
      </div>
    </footer>
  );
}
