import { Button } from "@/components/ui/button";
import { CONTENT_SECTIONS, getSiteContent } from "@/lib/site-content";
import { updateSiteContentAction } from "./actions";

export default async function AdminContentPage() {
  const values = await getSiteContent();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 font-display text-2xl tracking-wide">Conteúdo do site</h1>
      <p className="mb-8 font-ui text-xs text-escuro/60">
        Campos em branco mostram o texto padrão (exibido como exemplo
        cinza) — só muda no site quando você preenche aqui.
      </p>

      <form action={updateSiteContentAction} className="flex flex-col gap-10">
        {CONTENT_SECTIONS.map((section) => (
          <section key={section.title} className="flex flex-col gap-4">
            <h2 className="border-b border-escuro/14 pb-2 font-ui text-xs font-semibold uppercase tracking-wide text-escuro/70">
              {section.title}
            </h2>
            {section.fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <label htmlFor={field.key} className="font-ui text-xs text-escuro/70">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={field.key}
                    name={field.key}
                    rows={field.key.includes("stats") || field.key.includes("perks") ? 4 : 3}
                    defaultValue={values[field.key] ?? ""}
                    placeholder={field.fallback}
                    className="rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                ) : (
                  <input
                    id={field.key}
                    name={field.key}
                    defaultValue={values[field.key] ?? ""}
                    placeholder={field.fallback}
                    className="rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                )}
              </div>
            ))}
          </section>
        ))}
        <Button type="submit" className="w-fit">
          Salvar
        </Button>
      </form>
    </div>
  );
}
