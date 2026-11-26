import Link from "next/link";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, WHATSAPP_LINK } from "@/lib/site-config";
import type { CategoryLink } from "@/lib/queries/products";

// Só entra aqui o que tem destino. "Nossa história" e "Guia de medidas"
// voltam quando houver conteúdo; redes sociais, quando houver os links.
const INSTITUTIONAL_LINKS = [
  { label: "O processo", href: "/#processo" },
  { label: "Trocas e devoluções", href: "/trocas-e-devolucoes" },
  { label: "Política de privacidade", href: "/politica-de-privacidade" },
];

const ATENDIMENTO_LINKS: { label: string; href?: string }[] = [
  { label: `WhatsApp ${WHATSAPP_DISPLAY}`, href: WHATSAPP_LINK },
  { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { label: "Seg a sex, 9h às 18h" },
  { label: "B2B e times", href: WHATSAPP_LINK },
];

const linkClass = "font-ui text-[13.5px] text-creme/75 hover:text-verde-claro";

export function SiteFooter({ categories }: { categories: CategoryLink[] }) {
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
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="mb-1 font-ui text-[10.5px] font-bold uppercase tracking-[2px] text-sol">
            Loja
          </span>
          <Link href="/colecao" className={linkClass}>
            Toda a coleção
          </Link>
          {categories.map((c) => (
            <Link key={c.slug} href={`/categoria/${c.slug}`} className={linkClass}>
              {c.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="mb-1 font-ui text-[10.5px] font-bold uppercase tracking-[2px] text-sol">
            Institucional
          </span>
          {INSTITUTIONAL_LINKS.map(({ label, href }) => (
            <Link key={label} href={href} className={linkClass}>
              {label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="mb-1 font-ui text-[10.5px] font-bold uppercase tracking-[2px] text-sol">
            Atendimento
          </span>
          {ATENDIMENTO_LINKS.map(({ label, href }) =>
            href ? (
              <a
                key={label}
                href={href}
                {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                className={linkClass}
              >
                {label}
              </a>
            ) : (
              <span key={label} className="font-ui text-[13.5px] text-creme/75">
                {label}
              </span>
            ),
          )}
        </div>
      </div>
      <div className="mx-auto mt-11 flex max-w-[1400px] flex-wrap justify-between gap-5 border-t border-creme/15 pt-5 font-ui text-[11.5px] text-creme/50">
        <span>© 2026 Da Mata Grow · CNPJ 00.000.000/0001-00</span>
        <span>Feito à mão, na mata.</span>
      </div>
    </footer>
  );
}
